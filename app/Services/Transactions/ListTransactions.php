<?php

namespace App\Services\Transactions;

use App\Models\User;
use Carbon\Carbon;

class ListTransactions
{
    public function execute(User $user, array $filters = []): array
    {
        $query = $user->transactions()->with(['category', 'account']);

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['account_id'])) {
            $query->where('account_id', $filters['account_id']);
        }

        if (isset($filters['start_date'])) {
            $query->where('transaction_date', '>=', Carbon::parse($filters['start_date']));
        }

        if (isset($filters['end_date'])) {
            $query->where('transaction_date', '<=', Carbon::parse($filters['end_date']));
        }

        $limit = $filters['limit'] ?? 50;
        $transactions = $query->orderBy('transaction_date', 'desc')->limit($limit)->get();

        return [
            'transactions' => $transactions->map(fn($t) => [
                'id' => $t->id,
                'type' => $t->type,
                'amount' => $t->amount,
                'currency' => $t->currency,
                'description' => $t->description,
                'date' => $t->transaction_date->format('Y-m-d'),
                'category' => $t->category?->name,
                'account' => $t->account?->name,
            ])->toArray(),
            'count' => $transactions->count(),
        ];
    }
}
