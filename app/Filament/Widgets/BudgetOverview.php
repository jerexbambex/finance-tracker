<?php

namespace App\Filament\Widgets;

use App\Models\Budget;
use App\Models\Transaction;
use Filament\Widgets\ChartWidget;

class BudgetOverview extends ChartWidget
{
    protected ?string $heading = 'Budget vs Spending (This Month)';

    protected static ?int $sort = 3;

    protected function getData(): array
    {
        $user = auth()->user();

        $budgets = Budget::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('period_type', 'monthly')
            ->where('period_year', now()->year)
            ->where('period_month', now()->month)
            ->with('category')
            ->get();

        $labels = [];
        $budgetData = [];
        $spentData = [];

        foreach ($budgets as $budget) {
            $spent = Transaction::where('user_id', $user->id)
                ->where('category_id', $budget->category_id)
                ->where('type', 'expense')
                ->whereYear('transaction_date', now()->year)
                ->whereMonth('transaction_date', now()->month)
                ->sum('amount');

            $labels[] = $budget->category->name;
            $budgetData[] = $budget->amount / 100;
            $spentData[] = $spent / 100;
        }

        return [
            'datasets' => [
                [
                    'label' => 'Budget',
                    'data' => $budgetData,
                    'backgroundColor' => 'rgba(59, 130, 246, 0.5)',
                ],
                [
                    'label' => 'Spent',
                    'data' => $spentData,
                    'backgroundColor' => 'rgba(239, 68, 68, 0.5)',
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
