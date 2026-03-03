<?php

namespace App\Services\Transactions;

use App\Models\User;
use Carbon\Carbon;

class MonthlySummary
{
    public function execute(User $user, ?string $month = null): array
    {
        $date = $month ? Carbon::parse($month) : now();
        $startDate = $date->copy()->startOfMonth();
        $endDate = $date->copy()->endOfMonth();

        $transactions = $user->transactions()
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->get();

        $income = $transactions->where('type', 'income')->sum('amount');
        $expenses = $transactions->where('type', 'expense')->sum('amount');

        $categoryBreakdown = $transactions->where('type', 'expense')
            ->groupBy('category_id')
            ->map(function ($items) {
                $category = $items->first()->category;
                return [
                    'category' => $category?->name ?? 'Uncategorized',
                    'amount' => $items->sum('amount'),
                    'count' => $items->count(),
                ];
            })->values()->toArray();

        return [
            'period' => $date->format('Y-m'),
            'start_date' => $startDate->format('Y-m-d'),
            'end_date' => $endDate->format('Y-m-d'),
            'income' => $income,
            'expenses' => $expenses,
            'net' => $income - $expenses,
            'transaction_count' => $transactions->count(),
            'category_breakdown' => $categoryBreakdown,
        ];
    }
}
