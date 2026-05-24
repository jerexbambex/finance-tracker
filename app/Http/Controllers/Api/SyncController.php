<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Sync\PullRequest;
use App\Http\Requests\Api\Sync\PushRequest;
use App\Http\Resources\Api\BudgetResource;
use App\Http\Resources\Api\CategoryResource;
use App\Http\Resources\Api\GoalResource;
use App\Http\Resources\Api\RecurringTransactionResource;
use App\Http\Resources\Api\SettingsResource;
use App\Http\Resources\Api\TransactionResource;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Goal;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Last-write-wins bi-directional sync between the Flutter SQLite store
 * and the Laravel API.
 *
 * Wire shape mirrors what `lib/services/api/sync_api_service.dart` expects:
 *
 *   POST /sync/push  body: { transactions, categories, budgets, savingsGoals, settings }
 *   GET  /sync/pull  query: lastSyncAt (ISO8601)
 *   GET  /sync/status
 *
 * Conflict rule per row:
 *   1. Look up by (user_id, client_id) — `client_id` is the device's UUID.
 *   2. If not found server-side: insert (client wins).
 *   3. If found and server `updated_at` >= payload `updatedAt`: skip the
 *      write, return the server row in `conflicts` so the device can
 *      reconcile.
 *   4. Otherwise: update (client wins).
 *
 * Deletes propagate through soft-deletes (`deleted_at`). The client's
 * payload signals "delete me" by including `deletedAt` for a row.
 */
class SyncController extends Controller
{
    public function push(PushRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $applied = [
            'transactions' => [],
            'categories' => [],
            'budgets' => [],
            'savingsGoals' => [],
            'recurringTransactions' => [],
        ];
        $conflicts = [
            'transactions' => [],
            'categories' => [],
            'budgets' => [],
            'savingsGoals' => [],
            'recurringTransactions' => [],
        ];

        DB::transaction(function () use ($user, $data, &$applied, &$conflicts) {
            // Order matters: categories first so transactions/budgets/
            // recurringTransactions can resolve `categoryClientId` against
            // newly-created rows.
            foreach (($data['categories'] ?? []) as $row) {
                $this->upsertCategory($user, $row, $applied, $conflicts);
            }

            foreach (($data['budgets'] ?? []) as $row) {
                $this->upsertBudget($user, $row, $applied, $conflicts);
            }

            foreach (($data['transactions'] ?? []) as $row) {
                $this->upsertTransaction($user, $row, $applied, $conflicts);
            }

            foreach (($data['recurringTransactions'] ?? []) as $row) {
                $this->upsertRecurringTransaction($user, $row, $applied, $conflicts);
            }

            foreach (($data['savingsGoals'] ?? []) as $row) {
                $this->upsertGoal($user, $row, $applied, $conflicts);
            }

            if (isset($data['settings'])) {
                $this->upsertSettings($user, $data['settings']);
            }

            $user->forceFill(['last_synced_at' => now()])->save();
        });

        return response()->apiSuccess([
            'applied' => $applied,
            'conflicts' => $conflicts,
            'serverTime' => now()->toIso8601String(),
        ]);
    }

    public function pull(PullRequest $request): JsonResponse
    {
        $user = $request->user();
        $since = $request->validated('lastSyncAt') !== null
            ? Carbon::parse($request->validated('lastSyncAt'))
            : null;

        $payload = [
            'transactions' => $this->pullModel(Transaction::query()->where('user_id', $user->id), $since, fn ($m) => new TransactionResource($m)),
            'categories' => $this->pullModel(Category::query()->where('user_id', $user->id), $since, fn ($m) => new CategoryResource($m)),
            'budgets' => $this->pullModel(Budget::query()->where('user_id', $user->id), $since, fn ($m) => new BudgetResource($m)),
            'savingsGoals' => $this->pullModel(Goal::query()->where('user_id', $user->id), $since, fn ($m) => new GoalResource($m)),
            'recurringTransactions' => $this->pullModel(RecurringTransaction::query()->where('user_id', $user->id), $since, fn ($m) => new RecurringTransactionResource($m)),
            'settings' => $this->pullSettings($user, $since),
            'deletedIds' => [
                'transactions' => $this->pullDeleted(Transaction::query()->where('user_id', $user->id), $since),
                'categories' => $this->pullDeleted(Category::query()->where('user_id', $user->id), $since),
                'budgets' => $this->pullDeleted(Budget::query()->where('user_id', $user->id), $since),
                'savingsGoals' => $this->pullDeleted(Goal::query()->where('user_id', $user->id), $since),
                'recurringTransactions' => $this->pullDeleted(RecurringTransaction::query()->where('user_id', $user->id), $since),
            ],
            'serverTime' => now()->toIso8601String(),
        ];

        $user->forceFill(['last_synced_at' => now()])->save();

        return response()->apiSuccess($payload);
    }

    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        $pending = [
            'transactions' => Transaction::query()->where('user_id', $user->id)->count(),
            'categories' => Category::query()->where('user_id', $user->id)->count(),
            'budgets' => Budget::query()->where('user_id', $user->id)->count(),
            'savingsGoals' => Goal::query()->where('user_id', $user->id)->count(),
            'recurringTransactions' => RecurringTransaction::query()->where('user_id', $user->id)->count(),
        ];

        return response()->apiSuccess([
            'lastSyncAt' => optional($user->last_synced_at)->toIso8601String(),
            'subscriptionTier' => $user->subscription_tier,
            'isPremium' => $user->isPremium(),
            'subscriptionExpiresAt' => optional($user->subscription_expires_at)->toIso8601String(),
            'counts' => $pending,
            'serverTime' => now()->toIso8601String(),
        ]);
    }

    // ============================================
    // UPSERT HELPERS
    // ============================================

    /**
     * @param  array<string, mixed>  $row
     * @param  array<string, list<array<string, mixed>>>  $applied
     * @param  array<string, list<array<string, mixed>>>  $conflicts
     */
    private function upsertTransaction(User $user, array $row, array &$applied, array &$conflicts): void
    {
        $existing = Transaction::withTrashed()
            ->where('user_id', $user->id)
            ->where('client_id', $row['clientId'])
            ->first();

        if ($this->isStale($existing, $row, $conflicts['transactions'], fn ($m) => new TransactionResource($m))) {
            return;
        }

        $categoryId = $this->resolveCategoryServerId($user, $row['categoryClientId'] ?? null);
        $accountId = $user->defaultAccount()->id;

        $attrs = array_filter([
            'user_id' => $user->id,
            'client_id' => $row['clientId'],
            'account_id' => $accountId,
            'category_id' => $categoryId,
            'type' => $row['type'] ?? null,
            'amount' => $row['amount'] ?? null,
            'currency' => $row['currency'] ?? null,
            'description' => $row['description'] ?? null,
            'notes' => $row['notes'] ?? null,
            'transaction_date' => isset($row['date']) ? Carbon::parse($row['date'])->toDateString() : null,
        ], fn ($v) => $v !== null);

        if ($existing === null) {
            // Insert. Force updated_at to the device timestamp so future
            // round-trips compare against the same clock.
            $tx = Transaction::create($attrs);
            $tx->forceFill(['updated_at' => Carbon::parse($row['updatedAt'])])->save();
            if (! empty($row['deletedAt'])) {
                $tx->delete();
            }
            $applied['transactions'][] = (new TransactionResource($tx->fresh()))->toArray(request());

            return;
        }

        // Update path.
        $existing->fill($attrs);
        $existing->updated_at = Carbon::parse($row['updatedAt']);

        if (! empty($row['deletedAt'])) {
            $existing->save();
            $existing->delete();
        } else {
            if ($existing->trashed()) {
                $existing->restore();
            }
            $existing->save();
        }

        $applied['transactions'][] = (new TransactionResource($existing->fresh()))->toArray(request());
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array<string, list<array<string, mixed>>>  $applied
     * @param  array<string, list<array<string, mixed>>>  $conflicts
     */
    private function upsertRecurringTransaction(User $user, array $row, array &$applied, array &$conflicts): void
    {
        $existing = RecurringTransaction::withTrashed()
            ->where('user_id', $user->id)
            ->where('client_id', $row['clientId'])
            ->first();

        if ($this->isStale($existing, $row, $conflicts['recurringTransactions'], fn ($m) => new RecurringTransactionResource($m))) {
            return;
        }

        $categoryId = $this->resolveCategoryServerId($user, $row['categoryClientId'] ?? null);
        $accountId = $user->defaultAccount()->id;

        $attrs = array_filter([
            'user_id' => $user->id,
            'client_id' => $row['clientId'],
            'account_id' => $accountId,
            'category_id' => $categoryId,
            'type' => $row['type'] ?? null,
            'amount' => $row['amount'] ?? null,
            'description' => $row['description'] ?? null,
            'frequency' => $row['frequency'] ?? null,
            'next_due_date' => isset($row['nextDueDate']) ? Carbon::parse($row['nextDueDate'])->toDateString() : null,
            'is_active' => $row['isActive'] ?? null,
        ], fn ($v) => $v !== null);

        $rt = $existing ?? new RecurringTransaction;
        $rt->fill($attrs);
        $rt->updated_at = Carbon::parse($row['updatedAt']);

        if (! empty($row['deletedAt'])) {
            $rt->save();
            $rt->delete();
        } else {
            $rt->save();
            if ($rt->trashed()) {
                $rt->restore();
            }
        }

        $applied['recurringTransactions'][] = (new RecurringTransactionResource($rt->fresh()))->toArray(request());
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array<string, list<array<string, mixed>>>  $applied
     * @param  array<string, list<array<string, mixed>>>  $conflicts
     */
    private function upsertCategory(User $user, array $row, array &$applied, array &$conflicts): void
    {
        $existing = Category::withTrashed()
            ->where('user_id', $user->id)
            ->where('client_id', $row['clientId'])
            ->first();

        if ($this->isStale($existing, $row, $conflicts['categories'], fn ($m) => new CategoryResource($m))) {
            return;
        }

        $attrs = array_filter([
            'user_id' => $user->id,
            'client_id' => $row['clientId'],
            'name' => $row['name'] ?? null,
            'type' => $row['type'] ?? null,
            'budget_category' => $row['budgetCategory'] ?? null,
            'icon' => $row['icon'] ?? null,
            'color' => $row['color'] ?? null,
            'monthly_budget' => $row['monthlyBudget'] ?? null,
            'display_order' => $row['order'] ?? null,
            'is_active' => isset($row['isArchived']) ? ! $row['isArchived'] : null,
        ], fn ($v) => $v !== null);

        $cat = $existing ?? new Category;
        $cat->fill($attrs);
        $cat->updated_at = Carbon::parse($row['updatedAt']);

        if (! empty($row['deletedAt'])) {
            $cat->save();
            $cat->delete();
        } else {
            $cat->save();
            if ($cat->trashed()) {
                $cat->restore();
            }
        }

        $applied['categories'][] = (new CategoryResource($cat->fresh()))->toArray(request());
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array<string, list<array<string, mixed>>>  $applied
     * @param  array<string, list<array<string, mixed>>>  $conflicts
     */
    private function upsertBudget(User $user, array $row, array &$applied, array &$conflicts): void
    {
        $existing = Budget::withTrashed()
            ->where('user_id', $user->id)
            ->where('client_id', $row['clientId'])
            ->first();

        if ($this->isStale($existing, $row, $conflicts['budgets'], fn ($m) => new BudgetResource($m))) {
            return;
        }

        $clientCategory = $row['categoryClientId'] ?? null;
        $isEnvelope = $clientCategory === null;
        $categoryId = $isEnvelope ? null : $this->resolveCategoryServerId($user, $clientCategory);

        if (! $isEnvelope && $categoryId === null && $existing === null) {
            // Per-category budget referencing a category the server hasn't
            // seen yet. Skip — the device will re-push after categories sync.
            return;
        }

        $attrs = array_filter([
            'user_id' => $user->id,
            'client_id' => $row['clientId'],
            'amount' => $row['amount'] ?? null,
            'period_type' => 'monthly',
            'period_year' => $row['year'] ?? null,
            'period_month' => $row['month'] ?? null,
            'is_recurrent' => $row['isRecurrent'] ?? null,
        ], fn ($v) => $v !== null);

        // Set category_id explicitly so envelopes (null) aren't filtered out.
        $attrs['category_id'] = $categoryId;

        $budget = $existing ?? new Budget;
        $budget->fill($attrs);
        $budget->updated_at = Carbon::parse($row['updatedAt']);

        if (! empty($row['deletedAt'])) {
            $budget->save();
            $budget->delete();
        } else {
            $budget->save();
            if ($budget->trashed()) {
                $budget->restore();
            }
        }

        $applied['budgets'][] = (new BudgetResource($budget->fresh()))->toArray(request());
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array<string, list<array<string, mixed>>>  $applied
     * @param  array<string, list<array<string, mixed>>>  $conflicts
     */
    private function upsertGoal(User $user, array $row, array &$applied, array &$conflicts): void
    {
        $existing = Goal::withTrashed()
            ->where('user_id', $user->id)
            ->where('client_id', $row['clientId'])
            ->first();

        if ($this->isStale($existing, $row, $conflicts['savingsGoals'], fn ($m) => new GoalResource($m))) {
            return;
        }

        $attrs = array_filter([
            'user_id' => $user->id,
            'client_id' => $row['clientId'],
            'name' => $row['name'] ?? null,
            'target_amount' => $row['targetAmount'] ?? null,
            'current_amount' => $row['savedAmount'] ?? null,
            'target_date' => isset($row['deadline']) ? Carbon::parse($row['deadline'])->toDateString() : null,
            'is_active' => true,
        ], fn ($v) => $v !== null);

        $goal = $existing ?? new Goal;
        $goal->fill($attrs);
        $goal->updated_at = Carbon::parse($row['updatedAt']);
        $goal->is_completed = ($goal->target_amount > 0) && ($goal->current_amount >= $goal->target_amount);

        if (! empty($row['deletedAt'])) {
            $goal->save();
            $goal->delete();
        } else {
            $goal->save();
            if ($goal->trashed()) {
                $goal->restore();
            }
        }

        $applied['savingsGoals'][] = (new GoalResource($goal->fresh()))->toArray(request());
    }

    /**
     * @param  array<string, mixed>  $row
     */
    private function upsertSettings(User $user, array $row): void
    {
        $settings = $user->settings()->firstOrCreate(['user_id' => $user->id]);

        $map = [
            'themeMode' => 'theme_mode',
            'accentColor' => 'accent_color',
            'currency' => 'currency',
            'dailyReminderHour' => 'daily_reminder_hour',
            'dailyReminderMinute' => 'daily_reminder_minute',
            'dailyReminderEnabled' => 'daily_reminder_enabled',
            'budgetAlertEnabled' => 'budget_alert_enabled',
            'flexibleStreakDays' => 'flexible_streak_days',
            'cloudSyncEnabled' => 'cloud_sync_enabled',
        ];

        // Server-wins-on-tie semantics: only overwrite if the client's
        // updatedAt is strictly newer.
        $clientStamp = Carbon::parse($row['updatedAt']);
        if ($settings->updated_at !== null && $settings->updated_at->gte($clientStamp)) {
            return;
        }

        $attrs = [];
        foreach ($map as $camel => $snake) {
            if (array_key_exists($camel, $row)) {
                $attrs[$snake] = $row[$camel];
            }
        }
        $settings->fill($attrs);
        $settings->updated_at = $clientStamp;
        $settings->save();
    }

    // ============================================
    // PULL HELPERS
    // ============================================

    /**
     * @param  callable(Model): \Illuminate\Http\Resources\Json\JsonResource  $resolver
     * @return list<array<string, mixed>>
     */
    private function pullModel(\Illuminate\Database\Eloquent\Builder $query, ?Carbon $since, callable $resolver): array
    {
        if ($since !== null) {
            $query->where('updated_at', '>', $since);
        }

        return $query->orderBy('updated_at')
            ->get()
            ->map(fn (Model $m) => $resolver($m)->toArray(request()))
            ->all();
    }

    /**
     * @return list<string>
     */
    private function pullDeleted(\Illuminate\Database\Eloquent\Builder $query, ?Carbon $since): array
    {
        $query = $query->onlyTrashed();
        if ($since !== null) {
            $query->where('deleted_at', '>', $since);
        }

        return $query->pluck('client_id')->filter()->values()->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function pullSettings(User $user, ?Carbon $since): ?array
    {
        // Use a fresh query rather than $user->settings — Sanctum::actingAs
        // shares the user instance across sub-requests in a single test, so
        // the lazy-loaded relation can cache a stale null between calls.
        $settings = $user->settings()->first();

        if ($settings === null) {
            return null;
        }
        if ($since !== null && $settings->updated_at !== null && $settings->updated_at->lte($since)) {
            return null;
        }

        $payload = (new SettingsResource($settings))->toArray(request());
        $payload['updatedAt'] = optional($settings->updated_at)->toIso8601String();

        return $payload;
    }

    // ============================================
    // SHARED HELPERS
    // ============================================

    /**
     * Returns true when the existing server row is at least as fresh as
     * the incoming client row. Pushes the server's snapshot into the
     * supplied conflicts bucket so the caller can return it untouched.
     *
     * @param  array<string, mixed>  $row
     * @param  list<array<string, mixed>>  $conflictsBucket
     * @param  callable(Model): \Illuminate\Http\Resources\Json\JsonResource  $resolver
     */
    private function isStale(?Model $existing, array $row, array &$conflictsBucket, callable $resolver): bool
    {
        if ($existing === null) {
            return false;
        }

        $serverStamp = $existing->updated_at;
        $clientStamp = Carbon::parse($row['updatedAt']);

        if ($serverStamp === null || $clientStamp->gt($serverStamp)) {
            return false;
        }

        $conflictsBucket[] = $resolver($existing)->toArray(request());

        return true;
    }

    private function resolveCategoryServerId(User $user, ?string $clientId): ?string
    {
        if ($clientId === null) {
            return null;
        }

        return Category::withTrashed()
            ->where('user_id', $user->id)
            ->where('client_id', $clientId)
            ->value('id');
    }
}
