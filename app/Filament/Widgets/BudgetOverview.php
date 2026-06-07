<?php

namespace App\Filament\Widgets;

use App\Models\Budget;
use Filament\Widgets\ChartWidget;

class BudgetOverview extends ChartWidget
{
    protected ?string $heading = 'Budget vs Spending (This Month)';

    protected static ?int $sort = 3;

    protected function getData(): array
    {
        $budgets = Budget::where('is_active', true)
            ->where('period_type', 'monthly')
            ->where('period_year', now()->year)
            ->where('period_month', now()->month)
            ->with('category')
            ->get();

        $labels = [];
        $budgetData = [];
        $spentData = [];
        $indexByKey = [];

        foreach ($budgets as $budget) {
            // Group by category AND currency so figures of different currencies are
            // never summed together. amount and getSpentAmount() are already in major
            // units (dollars); getSpentAmount() is currency-, user- and split-aware.
            $key = $budget->category->name.' ('.$budget->currency.')';

            if (! isset($indexByKey[$key])) {
                $indexByKey[$key] = count($labels);
                $labels[] = $key;
                $budgetData[] = 0;
                $spentData[] = 0;
            }

            $i = $indexByKey[$key];
            $budgetData[$i] += $budget->amount;
            $spentData[$i] += $budget->getSpentAmount();
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
