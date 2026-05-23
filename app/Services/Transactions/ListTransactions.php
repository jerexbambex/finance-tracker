<?php

namespace App\Services\Transactions;

use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class ListTransactions
{
    public function execute(User $user, array $filters = []): array
    {
        $query = $user->transactions()->with(['category', 'account']);

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['category_id']) || isset($filters['category'])) {
            $category = $this->resolveCategory($user, $filters);
            $query->where('category_id', $category->id);
        }

        if (isset($filters['account_id'])) {
            $account = $user->accounts()->find($filters['account_id']);

            if (! $account) {
                throw ValidationException::withMessages([
                    'account_id' => 'Account not found or does not belong to user.',
                ]);
            }

            $query->where('account_id', $account->id);
        }

        if (isset($filters['start_date'])) {
            $query->where('transaction_date', '>=', Carbon::parse($filters['start_date'])->startOfDay());
        }

        if (isset($filters['end_date'])) {
            $query->where('transaction_date', '<=', Carbon::parse($filters['end_date'])->endOfDay());
        }

        $limit = min(max((int) ($filters['limit'] ?? 50), 1), 100);
        $transactions = $query->orderBy('transaction_date', 'desc')->limit($limit)->get();

        return [
            'transactions' => $transactions->map(fn($t) => [
                'id' => $t->id,
                'type' => $t->type,
                'amount' => $t->amount,
                'currency' => $t->currency,
                'description' => $t->description,
                'date' => $t->transaction_date->format('Y-m-d'),
                'category_id' => $t->category_id,
                'category' => $t->category?->name,
                'account_id' => $t->account_id,
                'account' => $t->account?->name,
            ])->toArray(),
            'count' => $transactions->count(),
        ];
    }

    private function resolveCategory(User $user, array $filters): Category
    {
        $query = Category::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereNull('user_id');
            });

        if (isset($filters['category_id'])) {
            $category = $query->whereKey($filters['category_id'])->first();

            if ($category) {
                return $category;
            }

            throw ValidationException::withMessages([
                'category_id' => 'Category not found or does not belong to user.',
            ]);
        }

        $category = $query
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($filters['category'])])
            ->first();

        if ($category) {
            return $category;
        }

        throw ValidationException::withMessages([
            'category' => 'Category not found or does not belong to user.',
        ]);
    }
}
