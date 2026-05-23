<?php

namespace App\Services\Budgets;

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class BudgetStatus
{
    public function execute(User $user, array $params): array
    {
        $validated = $this->validate($params);
        $budget = $this->resolveBudget($user, $validated);

        if (!$budget) {
            throw ValidationException::withMessages(['budget' => 'Budget not found.']);
        }

        $spent = $this->calculateSpent($user, $budget);
        $remaining = $budget->amount - $spent;
        $percentUsed = $budget->amount > 0 ? round(($spent / $budget->amount) * 100, 2) : 0;

        return [
            'budget_id' => $budget->id,
            'name' => $budget->name,
            'period' => $budget->period,
            'month' => $budget->start_date->format('Y-m'),
            'budget_amount' => $budget->amount,
            'spent' => $spent,
            'remaining' => $remaining,
            'percent_used' => $percentUsed,
            'start_date' => $budget->start_date->format('Y-m-d'),
            'end_date' => $budget->end_date->format('Y-m-d'),
            'category_id' => $budget->category_id,
            'category' => $budget->category?->name,
        ];
    }

    private function validate(array $params): array
    {
        $validator = Validator::make($params, [
            'budget_id' => 'nullable|uuid|exists:budgets,id',
            'month' => 'nullable|date_format:Y-m',
            'category_id' => 'nullable|uuid|exists:categories,id',
            'category' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    private function resolveBudget(User $user, array $params): ?Budget
    {
        if (isset($params['budget_id'])) {
            return $user->budgets()->find($params['budget_id']);
        }

        if (isset($params['month']) && (isset($params['category_id']) || isset($params['category']))) {
            $date = Carbon::createFromFormat('Y-m', $params['month'])->startOfMonth();
            $category = $this->resolveCategory($user, $params);

            return $user->budgets()
                ->where('category_id', $category->id)
                ->whereDate('start_date', '<=', $date->copy()->endOfMonth())
                ->whereDate('end_date', '>=', $date->copy()->startOfMonth())
                ->orderByDesc('start_date')
                ->first();
        }

        return null;
    }

    private function resolveCategory(User $user, array $params): Category
    {
        $query = Category::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereNull('user_id');
            });

        if (isset($params['category_id'])) {
            $category = $query->whereKey($params['category_id'])->first();

            if ($category) {
                return $category;
            }

            throw ValidationException::withMessages([
                'category_id' => 'Category not found or does not belong to user.',
            ]);
        }

        $category = $query
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($params['category'])])
            ->first();

        if ($category) {
            return $category;
        }

        throw ValidationException::withMessages([
            'category' => 'Category not found or does not belong to user.',
        ]);
    }

    private function calculateSpent(User $user, Budget $budget): float
    {
        $query = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$budget->start_date, $budget->end_date]);

        if ($budget->category_id) {
            $query->where('category_id', $budget->category_id);
        }

        return round($query->sum('amount') / 100, 2);
    }
}
