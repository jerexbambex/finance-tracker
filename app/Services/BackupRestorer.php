<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Goal;
use App\Models\GoalContribution;
use App\Models\RecurringTransaction;
use App\Models\Reminder;
use App\Models\Tag;
use App\Models\Transaction;
use App\Models\TransactionSplit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Restores a JSON backup produced by ExportController::allData() into a
 * user's workspace.
 *
 * Records keep their original UUIDs where possible, which makes a restore
 * idempotent: a record that already belongs to this user is skipped, so
 * restoring the same file twice never duplicates anything. If an ID is taken
 * by another user's record (a backup restored into a different account on the
 * same instance), the record gets a fresh ID and every reference to it is
 * remapped.
 *
 * Transactions are written without model events. TransactionObserver would
 * otherwise add every historical transaction on top of the account balance
 * that the backup already carries, and the activity log would record
 * thousands of entries that never happened. New accounts take their balance
 * from the backup; accounts that already existed are adjusted by the
 * transactions this restore adds to them.
 */
class BackupRestorer
{
    private User $user;

    /** @var array<string, array<string, string>> table => old id => new id */
    private array $ids = [];

    /** @var array<string, true> account ids created by this restore */
    private array $newAccounts = [];

    /** @var array<string, true> goal ids created by this restore */
    private array $newGoals = [];

    /** @var array<string, string> old transfer group id => new transfer group id */
    private array $transferGroups = [];

    /** @var array<string, int> */
    private array $counts = [];

    /**
     * @param  array<string, mixed>  $data  the decoded backup file
     * @return array<string, int> records created per section
     */
    public function restore(User $user, array $data): array
    {
        $this->user = $user;

        DB::transaction(function () use ($data) {
            $this->restoreAccounts($data['accounts'] ?? []);
            $this->restoreCategories($data['categories'] ?? []);
            $this->restoreTags($data['tags'] ?? []);
            $this->restoreBudgets($data['budgets'] ?? []);
            $this->restoreGoals($data['goals'] ?? []);
            $this->restoreGoalContributions($data['goal_contributions'] ?? []);
            $this->restoreRecurringTransactions($data['recurring_transactions'] ?? []);
            $this->restoreReminders($data['reminders'] ?? []);
            $this->restoreTransactions($data['transactions'] ?? []);
        });

        return $this->counts;
    }

    private function restoreAccounts(array $rows): void
    {
        foreach ($rows as $row) {
            [$id, $exists] = $this->claimId(Account::class, $row['id'] ?? null);
            $this->ids['accounts'][$row['id'] ?? $id] = $id;

            if ($exists) {
                continue;
            }

            $this->create(new Account, $id, $this->attributes(Account::class, $row));
            $this->newAccounts[$id] = true;
            $this->tally('accounts');
        }
    }

    private function restoreCategories(array $rows): void
    {
        $parents = [];

        foreach ($rows as $row) {
            [$id, $exists] = $this->claimId(Category::class, $row['id'] ?? null);

            // A category with the same name and type is the same category,
            // even if it was created separately from the backup.
            if (! $exists) {
                $match = $this->user->categories()
                    ->where('name', $row['name'] ?? '')
                    ->where('type', $row['type'] ?? '')
                    ->value('id');

                if ($match) {
                    [$id, $exists] = [$match, true];
                }
            }

            $this->ids['categories'][$row['id'] ?? $id] = $id;

            if ($exists) {
                continue;
            }

            $this->create(new Category, $id, Arr::except($this->attributes(Category::class, $row), ['parent_id']));
            $this->tally('categories');

            if (! empty($row['parent_id'])) {
                $parents[$id] = $row['parent_id'];
            }
        }

        // Parents can appear after their children in the file, so link them
        // once every category has its final ID.
        foreach ($parents as $id => $oldParent) {
            if ($parent = $this->ids['categories'][$oldParent] ?? null) {
                Category::whereKey($id)->update(['parent_id' => $parent]);
            }
        }
    }

    private function restoreTags(array $rows): void
    {
        foreach ($rows as $row) {
            // Tag names are unique per user, so an existing tag of the same
            // name is reused rather than colliding with it.
            $existing = Tag::where('user_id', $this->user->id)->where('name', $row['name'] ?? '')->value('id');

            if ($existing) {
                $this->ids['tags'][$row['id'] ?? $existing] = $existing;

                continue;
            }

            [$id] = $this->claimId(Tag::class, $row['id'] ?? null);
            $this->ids['tags'][$row['id'] ?? $id] = $id;
            $this->create(new Tag, $id, $this->attributes(Tag::class, $row));
            $this->tally('tags');
        }
    }

    private function restoreBudgets(array $rows): void
    {
        foreach ($rows as $row) {
            $categoryId = $this->mapped('categories', $row['category_id'] ?? null);
            if (! $categoryId) {
                continue;
            }

            [$id, $exists] = $this->claimId(Budget::class, $row['id'] ?? null);

            // One budget per category and period; an existing one wins.
            $exists = $exists || $this->user->budgets()
                ->where('category_id', $categoryId)
                ->where('period_type', $row['period_type'] ?? 'monthly')
                ->where('period_year', $row['period_year'] ?? null)
                ->where('period_month', $row['period_month'] ?? null)
                ->exists();

            if ($exists) {
                continue;
            }

            $this->create(new Budget, $id, ['category_id' => $categoryId] + $this->attributes(Budget::class, $row));
            $this->tally('budgets');
        }
    }

    private function restoreGoals(array $rows): void
    {
        foreach ($rows as $row) {
            [$id, $exists] = $this->claimId(Goal::class, $row['id'] ?? null);
            $this->ids['goals'][$row['id'] ?? $id] = $id;

            if ($exists) {
                continue;
            }

            $this->create(new Goal, $id, $this->attributes(Goal::class, $row));
            $this->newGoals[$id] = true;
            $this->tally('goals');
        }
    }

    private function restoreGoalContributions(array $rows): void
    {
        foreach ($rows as $row) {
            $goalId = $this->mapped('goals', $row['goal_id'] ?? null);
            if (! $goalId) {
                continue;
            }

            [$id, $exists] = $this->claimId(GoalContribution::class, $row['id'] ?? null);
            if ($exists) {
                continue;
            }

            // A restored goal already carries its saved total from the backup;
            // GoalContributionObserver would recompute it from contributions
            // alone, which loses amounts saved before contributions existed.
            GoalContribution::withoutEvents(fn () => $this->create(
                new GoalContribution,
                $id,
                ['goal_id' => $goalId] + $this->attributes(GoalContribution::class, $row),
            ));

            if (! isset($this->newGoals[$goalId])) {
                $goal = Goal::find($goalId);
                $goal->current_amount += (float) ($row['amount'] ?? 0);
                $goal->is_completed = $goal->target_amount > 0 && $goal->current_amount >= $goal->target_amount;
                $goal->save();
            }

            $this->tally('goal_contributions');
        }
    }

    private function restoreRecurringTransactions(array $rows): void
    {
        foreach ($rows as $row) {
            $accountId = $this->mapped('accounts', $row['account_id'] ?? null);
            if (! $accountId) {
                continue;
            }

            [$id, $exists] = $this->claimId(RecurringTransaction::class, $row['id'] ?? null);
            if ($exists) {
                continue;
            }

            $this->create(new RecurringTransaction, $id, [
                'account_id' => $accountId,
                'category_id' => $this->mapped('categories', $row['category_id'] ?? null),
            ] + $this->attributes(RecurringTransaction::class, $row));
            $this->tally('recurring_transactions');
        }
    }

    private function restoreReminders(array $rows): void
    {
        foreach ($rows as $row) {
            [$id, $exists] = $this->claimId(Reminder::class, $row['id'] ?? null);
            if ($exists) {
                continue;
            }

            $this->create(new Reminder, $id, [
                'category_id' => $this->mapped('categories', $row['category_id'] ?? null),
            ] + $this->attributes(Reminder::class, $row));
            $this->tally('reminders');
        }
    }

    private function restoreTransactions(array $rows): void
    {
        $currencies = Account::whereIn('id', array_values($this->ids['accounts'] ?? []))->pluck('currency', 'id');

        Transaction::withoutEvents(function () use ($rows, $currencies) {
            foreach ($rows as $row) {
                $accountId = $this->mapped('accounts', $row['account_id'] ?? null);
                if (! $accountId) {
                    continue;
                }

                [$id, $exists] = $this->claimId(Transaction::class, $row['id'] ?? null);
                if ($exists) {
                    continue;
                }

                $attributes = $this->attributes(Transaction::class, $row);
                $attributes['account_id'] = $accountId;
                $attributes['category_id'] = $this->mapped('categories', $row['category_id'] ?? null);
                $attributes['currency'] ??= $currencies[$accountId] ?? 'USD';

                if (! empty($row['transfer_group_id'])) {
                    $attributes['transfer_group_id'] = $this->transferGroup($row['transfer_group_id']);
                }

                $transaction = $this->create(new Transaction, $id, $attributes);
                $this->tally('transactions');

                foreach ($row['splits'] ?? [] as $split) {
                    $this->create(new TransactionSplit, (string) Str::uuid(), [
                        'transaction_id' => $id,
                        'category_id' => $this->mapped('categories', $split['category_id'] ?? null),
                    ] + $this->attributes(TransactionSplit::class, $split));
                }

                $tagIds = array_filter(array_map(fn ($tag) => $this->mapped('tags', $tag['id'] ?? null), $row['tags'] ?? []));
                if ($tagIds !== []) {
                    $transaction->tags()->syncWithoutDetaching($tagIds);
                }

                if (! isset($this->newAccounts[$accountId])) {
                    $delta = Transaction::signedBalanceDelta($transaction->type, $transaction->transfer_direction, (int) $transaction->getAttributes()['amount']);
                    Account::whereKey($accountId)->increment('balance', $delta);
                }
            }
        });
    }

    /**
     * Decides which ID a restored record gets.
     *
     * @param  class-string<Model>  $model
     * @return array{0: string, 1: bool} the ID, and whether this user already has that record
     */
    private function claimId(string $model, ?string $oldId): array
    {
        if (! $oldId || ! Str::isUuid($oldId)) {
            return [(string) Str::uuid(), false];
        }

        $owner = $this->ownerOf($model, $oldId);

        return match (true) {
            $owner === null => [$oldId, false],
            $owner === $this->user->id => [$oldId, true],
            default => [(string) Str::uuid(), false],
        };
    }

    /**
     * @param  class-string<Model>  $model
     * @return string|false|null the owning user's ID, false for an unowned row, null if no row
     */
    private function ownerOf(string $model, string $id): string|false|null
    {
        $row = $model::query()->whereKey($id)->first();

        if (! $row) {
            return null;
        }

        return $row->getAttribute('user_id') ?? false;
    }

    private function mapped(string $table, ?string $oldId): ?string
    {
        return $oldId ? ($this->ids[$table][$oldId] ?? null) : null;
    }

    private function transferGroup(string $oldGroup): string
    {
        if (! isset($this->transferGroups[$oldGroup])) {
            $takenByOthers = Transaction::where('transfer_group_id', $oldGroup)
                ->where('user_id', '!=', $this->user->id)
                ->exists();

            $this->transferGroups[$oldGroup] = $takenByOthers ? (string) Str::uuid() : $oldGroup;
        }

        return $this->transferGroups[$oldGroup];
    }

    /**
     * The backup row reduced to the model's own fillable columns, with the
     * owner, foreign keys and dates normalised. Foreign keys are set by the
     * caller after remapping.
     *
     * @param  class-string<Model>  $model
     */
    private function attributes(string $model, array $row): array
    {
        $instance = new $model;

        $attributes = Arr::except(
            Arr::only($row, $instance->getFillable()),
            ['user_id', 'account_id', 'category_id', 'goal_id', 'transaction_id', 'transfer_group_id'],
        );

        // toArray() writes dates as ISO-8601 strings with a time and zone;
        // DATE columns want just the day.
        foreach ($instance->getCasts() as $column => $cast) {
            if (! isset($attributes[$column]) || ! is_string($attributes[$column])) {
                continue;
            }

            if ($cast === 'date') {
                $attributes[$column] = Carbon::parse($attributes[$column])->toDateString();
            } elseif ($cast === 'datetime') {
                $attributes[$column] = Carbon::parse($attributes[$column]);
            }
        }

        return $attributes;
    }

    /**
     * @template T of Model
     *
     * @param  T  $model
     * @return T
     */
    private function create(Model $model, string $id, array $attributes): Model
    {
        $model->forceFill($attributes);
        $model->setAttribute($model->getKeyName(), $id);

        if (in_array('user_id', $model->getFillable(), true)) {
            $model->setAttribute('user_id', $this->user->id);
        }

        $model->save();

        return $model;
    }

    private function tally(string $section): void
    {
        $this->counts[$section] = ($this->counts[$section] ?? 0) + 1;
    }
}
