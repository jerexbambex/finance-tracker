<?php

namespace App\Filament\Resources\Users\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Database\Eloquent\Model;

class UserTransactionsChart extends ChartWidget
{
    public ?Model $record = null;

    protected ?string $heading = 'Transactions by type (last 6 months)';

    protected int|string|array $columnSpan = 'full';

    protected function getData(): array
    {
        $labels = [];
        $income = [];
        $expense = [];
        $transfer = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $labels[] = $month->format('M Y');

            $counts = $this->record->transactions()
                ->whereYear('transaction_date', $month->year)
                ->whereMonth('transaction_date', $month->month)
                ->selectRaw('type, COUNT(*) as total')
                ->groupBy('type')
                ->pluck('total', 'type');

            $income[] = (int) ($counts['income'] ?? 0);
            $expense[] = (int) ($counts['expense'] ?? 0);
            $transfer[] = (int) ($counts['transfer'] ?? 0);
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
                    'label' => 'Expense',
                    'data' => $expense,
                    'backgroundColor' => 'rgba(225, 29, 72, 0.6)',
                    'borderColor' => '#e11d48',
                ],
                [
                    'label' => 'Transfer',
                    'data' => $transfer,
                    'backgroundColor' => 'rgba(63, 159, 232, 0.6)',
                    'borderColor' => '#3f9fe8',
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
