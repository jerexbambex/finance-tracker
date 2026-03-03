<?php

namespace App\Services\Budgets;

use App\Models\Budget;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class BudgetStatus
{
    public function execute(User $user, array $params): array
    {
        $budget = $this->resolveBudget($user, $params);

        if (!$budget) {
            throw ValidationException::withMessages(['budget' => 'Budget not found.']);
        }

        $spent = $this->calculateSpent($user, $budget);
        $remaining = max(0, $budget->amount - $spent);
        $percentUsed = $budget->amount > 0 ? round(($spent / $budget->amount) * 100, 2) : 0;

        return [
            'budget_id' => $budget->id,
            'name' => $budget->name,
            'period' => $budget->start_date->format('Y-m'),
            'budget_amount' => $budget->amount,
            'spent' => $spent,
            'remaining' => $remaining,
            'percent_used' => $percentUsed,
            'start_date' => $budget->start_date->format('Y-m-d'),
            'end_date' => $budget->end_date->format('Y-m-d'),
        ];
    }

    private function resolveBudget(User $user, array $params): ?Budget
    {
        if (isset($params['budget_id'])) {
            return $user->budgets()->find($params['budget_id']);
        }

        if (isset($params['month']) && isset($params['category_id'])) {
            $date = Carbon::parse($params['month']);
            return $user->budgets()
                ->where('category_id', $params['category_id'])
                ->where('period_year', $date->year)
                ->where('period_month', $date->month)
                ->first();
        }

        return null;
    }

    private function calculateSpent(User $user, Budget $budget): float
    {
        $query = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$budget->start_date, $budget->end_date]);

        if ($budget->category_id) {
            $query->where('category_id', $budget->category_id);
        }

        return $query->sum('amount');
    }
}
