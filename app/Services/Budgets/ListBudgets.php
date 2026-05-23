<?php

namespace App\Services\Budgets;

use App\Models\Category;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ListBudgets
{
    public function execute(User $user, array $filters = []): array
    {
        $query = $user->budgets()->with('category');

        if (isset($filters['period'])) {
            $query->where('period', $filters['period']);
        }

        if (isset($filters['active_only']) && $filters['active_only']) {
            $query->where('is_active', true);
        }

        if (isset($filters['category_id']) || isset($filters['category'])) {
            $category = $this->resolveCategory($user, $filters);
            $query->where('category_id', $category->id);
        }

        $budgets = $query->orderBy('start_date', 'desc')->get();

        return [
            'budgets' => $budgets->map(fn($b) => [
                'budget_id' => $b->id,
                'name' => $b->name,
                'amount' => $b->amount,
                'currency' => $b->currency,
                'period' => $b->period,
                'start_date' => $b->start_date?->format('Y-m-d'),
                'end_date' => $b->end_date?->format('Y-m-d'),
                'category_id' => $b->category_id,
                'category' => $b->category?->name,
                'notes' => $b->notes,
                'is_active' => $b->is_active,
            ])->toArray(),
            'count' => $budgets->count(),
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
