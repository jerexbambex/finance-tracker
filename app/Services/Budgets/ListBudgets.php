<?php

namespace App\Services\Budgets;

use App\Models\User;

class ListBudgets
{
    public function execute(User $user, array $filters = []): array
    {
        $query = $user->budgets()->with('category');

        if (isset($filters['period'])) {
            $query->where('period_type', $filters['period']);
        }

        if (isset($filters['active_only']) && $filters['active_only']) {
            $query->where('is_active', true);
        }

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        $budgets = $query->orderBy('start_date', 'desc')->get();

        return [
            'budgets' => $budgets->map(fn($b) => [
                'budget_id' => $b->id,
                'name' => $b->name,
                'amount' => $b->amount,
                'currency' => $b->currency,
                'period' => $b->period_type,
                'start_date' => $b->start_date?->format('Y-m-d'),
                'end_date' => $b->end_date?->format('Y-m-d'),
                'category' => $b->category?->name,
                'is_active' => $b->is_active,
            ])->toArray(),
            'count' => $budgets->count(),
        ];
    }
}
