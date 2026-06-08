<?php

namespace App\Filament\Resources\Accounts\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Database\Eloquent\Model;

class AccountTransactionsChart extends ChartWidget
{
    public ?Model $record = null;

    protected ?string $heading = 'Income vs Expenses (last 6 months)';

    protected function getData(): array
    {
        $labels = [];
        $income = [];
        $expense = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);

            $labels[] = $month->format('M Y');
            $income[] = $this->record->transactions()
                ->where('type', 'income')
                ->whereYear('transaction_date', $month->year)
                ->whereMonth('transaction_date', $month->month)
                ->sum('amount') / 100;
            $expense[] = $this->record->transactions()
                ->where('type', 'expense')
                ->whereYear('transaction_date', $month->year)
                ->whereMonth('transaction_date', $month->month)
                ->sum('amount') / 100;
        }

        return [
            'datasets' => [
                [
                    'label' => 'Income',
                    'data' => $income,
                    'backgroundColor' => 'rgba(0, 184, 166, 0.6)',
                    'borderColor' => '#00b8a6',
                ],
                [
                    'label' => 'Expenses',
                    'data' => $expense,
                    'backgroundColor' => 'rgba(225, 29, 72, 0.6)',
                    'borderColor' => '#e11d48',
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
