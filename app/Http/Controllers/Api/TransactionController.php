<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Transactions\BulkStoreTransactionRequest;
use App\Http\Requests\Api\Transactions\IndexTransactionRequest;
use App\Http\Requests\Api\Transactions\StoreTransactionRequest;
use App\Http\Requests\Api\Transactions\SummaryRequest;
use App\Http\Requests\Api\Transactions\UpdateTransactionRequest;
use App\Http\Resources\Api\TransactionResource;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TransactionController extends Controller
{
    public function index(IndexTransactionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $page = (int) ($data['page'] ?? 1);
        $limit = (int) ($data['limit'] ?? 20);

        $query = $this->scopedQuery($request->user());

        if (! empty($data['startDate'])) {
            $query->where('transaction_date', '>=', Carbon::parse($data['startDate'])->toDateString());
        }
        if (! empty($data['endDate'])) {
            $query->where('transaction_date', '<=', Carbon::parse($data['endDate'])->toDateString());
        }
        if (! empty($data['type'])) {
            $query->where('type', $data['type']);
        }
        if (! empty($data['categoryId'])) {
            $query->where('category_id', $data['categoryId']);
        }
        if (! empty($data['search'])) {
            $needle = '%'.$data['search'].'%';
            $query->where(function ($q) use ($needle) {
                $q->where('description', 'like', $needle)
                    ->orWhere('notes', 'like', $needle);
            });
        }

        $paginator = $query
            ->orderByDesc('transaction_date')
            ->orderByDesc('created_at')
            ->paginate(perPage: $limit, page: $page);

        return response()->apiSuccess(
            data: TransactionResource::collection($paginator->getCollection())->resolve(),
            pagination: [
                'page' => $paginator->currentPage(),
                'limit' => $paginator->perPage(),
                'total' => $paginator->total(),
                'totalPages' => max(1, $paginator->lastPage()),
            ],
        );
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $transaction = $this->createTransactionFor($request->user(), $request->validated());

        return response()->apiSuccess(
            data: (new TransactionResource($transaction))->toArray($request),
            status: 201,
        );
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $transaction = $this->findUserTransaction($request->user(), $id);

        return response()->apiSuccess(
            data: (new TransactionResource($transaction))->toArray($request),
        );
    }

    public function update(UpdateTransactionRequest $request, string $id): JsonResponse
    {
        $transaction = $this->findUserTransaction($request->user(), $id);
        $data = $request->validated();

        $attrs = [];
        foreach (['amount', 'type', 'description', 'notes', 'currency'] as $key) {
            if (array_key_exists($key, $data)) {
                $attrs[$key] = $data[$key];
            }
        }
        if (array_key_exists('categoryId', $data)) {
            $attrs['category_id'] = $data['categoryId'];
        }
        if (array_key_exists('accountId', $data)) {
            $attrs['account_id'] = $this->resolveAccountId($request->user(), $data['accountId']);
        }
        if (array_key_exists('date', $data)) {
            $attrs['transaction_date'] = Carbon::parse($data['date'])->toDateString();
        }

        $transaction->update($attrs);

        return response()->apiSuccess(
            data: (new TransactionResource($transaction->fresh()))->toArray($request),
        );
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $transaction = $this->findUserTransaction($request->user(), $id);
        $transaction->delete();

        return response()->apiSuccess(message: 'Transaction deleted.');
    }

    public function bulk(BulkStoreTransactionRequest $request): JsonResponse
    {
        $user = $request->user();
        $defaultAccount = $user->defaultAccount();

        $created = collect();
        DB::transaction(function () use ($request, $user, $defaultAccount, &$created) {
            foreach ($request->validated('transactions') as $row) {
                $created->push($this->createTransactionFor($user, $row, $defaultAccount));
            }
        });

        return response()->apiSuccess(
            data: [
                'created' => $created->count(),
                'transactions' => TransactionResource::collection($created)->resolve(),
            ],
            status: 201,
        );
    }

    public function summary(SummaryRequest $request): JsonResponse
    {
        $start = Carbon::parse($request->validated('startDate'))->toDateString();
        $end = Carbon::parse($request->validated('endDate'))->toDateString();

        $rows = $this->scopedQuery($request->user())
            ->whereBetween('transaction_date', [$start, $end])
            ->selectRaw('type, SUM(amount) as total_cents, COUNT(*) as count')
            ->groupBy('type')
            ->get();

        $income = 0;
        $expense = 0;
        $count = 0;

        foreach ($rows as $row) {
            $cents = (int) $row->total_cents;
            if ($row->type === 'income') {
                $income = $cents;
            } elseif ($row->type === 'expense') {
                $expense = $cents;
            }
            $count += (int) $row->count;
        }

        return response()->apiSuccess([
            'startDate' => $start,
            'endDate' => $end,
            'income' => (float) ($income / 100),
            'expense' => (float) ($expense / 100),
            'net' => (float) (($income - $expense) / 100),
            'transactionCount' => $count,
        ]);
    }

    public function recent(Request $request): JsonResponse
    {
        $limit = (int) $request->integer('limit', 10);
        $limit = max(1, min(100, $limit));

        $transactions = $this->scopedQuery($request->user())
            ->orderByDesc('transaction_date')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        return response()->apiSuccess(
            data: TransactionResource::collection($transactions)->resolve(),
        );
    }

    /**
     * @param  array<string, mixed>  $row
     */
    private function createTransactionFor(User $user, array $row, ?Account $defaultAccount = null): Transaction
    {
        $accountId = $this->resolveAccountId($user, $row['accountId'] ?? null, $defaultAccount);

        return Transaction::create([
            'user_id' => $user->id,
            'account_id' => $accountId,
            'category_id' => $row['categoryId'] ?? null,
            'type' => $row['type'],
            'amount' => $row['amount'],
            'currency' => $row['currency'] ?? ($defaultAccount?->currency ?? 'USD'),
            'description' => $row['description'] ?? '',
            'notes' => $row['notes'] ?? null,
            'transaction_date' => isset($row['date'])
                ? Carbon::parse($row['date'])->toDateString()
                : now()->toDateString(),
        ]);
    }

    private function scopedQuery(User $user): \Illuminate\Database\Eloquent\Builder
    {
        return Transaction::query()->where('user_id', $user->id);
    }

    private function findUserTransaction(User $user, string $id): Transaction
    {
        $transaction = Transaction::query()
            ->where('user_id', $user->id)
            ->whereKey($id)
            ->first();

        if ($transaction === null) {
            throw new NotFoundHttpException('Transaction not found.');
        }

        return $transaction;
    }

    private function resolveAccountId(User $user, ?string $accountId, ?Account $default = null): string
    {
        if ($accountId !== null) {
            $exists = $user->accounts()->whereKey($accountId)->exists();
            if (! $exists) {
                throw new NotFoundHttpException('Account not found.');
            }

            return $accountId;
        }

        return ($default ?? $user->defaultAccount())->id;
    }
}
