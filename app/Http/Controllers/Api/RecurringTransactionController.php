<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RecurringTransactions\StoreRecurringTransactionRequest;
use App\Http\Requests\Api\RecurringTransactions\UpdateRecurringTransactionRequest;
use App\Http\Resources\Api\RecurringTransactionResource;
use App\Models\RecurringTransaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class RecurringTransactionController extends Controller
{
    /**
     * Frequency → step mapping that mirrors ProcessRecurringTransactions.
     *
     * @var array<string, array{0: string, 1: int}>
     */
    private const FREQUENCY_STEPS = [
        'daily' => ['addDays', 1],
        'weekly' => ['addWeeks', 1],
        'biweekly' => ['addWeeks', 2],
        'monthly' => ['addMonths', 1],
        'quarterly' => ['addMonths', 3],
        'yearly' => ['addYears', 1],
    ];

    public function index(Request $request): JsonResponse
    {
        $rows = RecurringTransaction::query()
            ->where('user_id', $request->user()->id)
            ->orderBy('next_due_date')
            ->orderBy('created_at')
            ->get();

        return response()->apiSuccess(
            data: RecurringTransactionResource::collection($rows)->resolve(),
        );
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $row = $this->findForUser($request->user(), $id);

        return response()->apiSuccess(
            data: (new RecurringTransactionResource($row))->toArray($request),
        );
    }

    public function store(StoreRecurringTransactionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $accountId = $data['accountId'] ?? $user->defaultAccount()->id;

        if ($data['accountId'] ?? null) {
            // Guard against cross-user account references.
            $owns = $user->accounts()->whereKey($accountId)->exists();
            if (! $owns) {
                throw new NotFoundHttpException('Account not found.');
            }
        }

        $row = RecurringTransaction::create([
            'user_id' => $user->id,
            'account_id' => $accountId,
            'category_id' => $data['categoryId'] ?? null,
            'type' => $data['type'],
            'amount' => $data['amount'],
            'description' => $data['description'],
            'frequency' => $data['frequency'],
            'next_due_date' => Carbon::parse($data['nextDueDate'])->toDateString(),
            'is_active' => $data['isActive'] ?? true,
        ]);

        return response()->apiSuccess(
            data: (new RecurringTransactionResource($row))->toArray($request),
            status: 201,
        );
    }

    public function update(UpdateRecurringTransactionRequest $request, string $id): JsonResponse
    {
        $row = $this->findForUser($request->user(), $id);
        $data = $request->validated();

        $attrs = [];
        foreach (['type', 'amount', 'description', 'frequency'] as $key) {
            if (array_key_exists($key, $data)) {
                $attrs[$key] = $data[$key];
            }
        }
        if (array_key_exists('categoryId', $data)) {
            $attrs['category_id'] = $data['categoryId'];
        }
        if (array_key_exists('accountId', $data)) {
            if ($data['accountId'] !== null && ! $request->user()->accounts()->whereKey($data['accountId'])->exists()) {
                throw new NotFoundHttpException('Account not found.');
            }
            $attrs['account_id'] = $data['accountId'];
        }
        if (array_key_exists('nextDueDate', $data)) {
            $attrs['next_due_date'] = Carbon::parse($data['nextDueDate'])->toDateString();
        }
        if (array_key_exists('isActive', $data)) {
            $attrs['is_active'] = $data['isActive'];
        }

        $row->update($attrs);

        return response()->apiSuccess(
            data: (new RecurringTransactionResource($row->fresh()))->toArray($request),
        );
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $row = $this->findForUser($request->user(), $id);
        $row->delete();

        return response()->apiSuccess(message: 'Recurring transaction deleted.');
    }

    /**
     * Skips the next occurrence by advancing `next_due_date` one frequency
     * step forward without generating a transaction. Useful when the user
     * wants to skip e.g. a monthly subscription for one cycle.
     */
    public function skipNext(Request $request, string $id): JsonResponse
    {
        $row = $this->findForUser($request->user(), $id);

        [$method, $count] = self::FREQUENCY_STEPS[$row->frequency] ?? self::FREQUENCY_STEPS['monthly'];

        $row->next_due_date = $row->next_due_date->{$method}($count);
        $row->save();

        return response()->apiSuccess(
            data: (new RecurringTransactionResource($row->fresh()))->toArray($request),
        );
    }

    private function findForUser(User $user, string $id): RecurringTransaction
    {
        $row = RecurringTransaction::query()
            ->where('user_id', $user->id)
            ->whereKey($id)
            ->first();

        if ($row === null) {
            throw new NotFoundHttpException('Recurring transaction not found.');
        }

        return $row;
    }
}
