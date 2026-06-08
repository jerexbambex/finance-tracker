<?php

namespace App\Filament\Widgets;

use App\Currency;
use App\Models\Account;
use App\Models\Transaction;
use Filament\Widgets\ChartWidget;

class IncomeExpenseTrend extends ChartWidget
{
    protected ?string $heading = 'Income vs Expenses (last 6 months)';

    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    /**
     * Currency selector — amounts of different currencies must never be summed
     * together, so the trend is always scoped to a single currency.
     */
    protected function getFilters(): ?array
    {
        return Account::query()
            ->distinct()
            ->orderBy('currency')
            ->pluck('currency')
            ->mapWithKeys(fn ($code) => [$code => Currency::tryFrom($code)?->label() ?? $code])
            ->all();
    }

    protected function getData(): array
    {
        $currency = $this->filter ?? Account::query()->orderBy('currency')->value('currency') ?? 'USD';

        $labels = [];
        $income = [];
        $expense = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $labels[] = $month->format('M Y');

            $base = fn (string $type) => Transaction::query()
                ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
                ->where('accounts.currency', $currency)
                ->where('transactions.type', $type)
                ->whereYear('transactions.transaction_date', $month->year)
                ->whereMonth('transactions.transaction_date', $month->month)
                ->sum('transactions.amount') / 100;

            $income[] = $base('income');
            $expense[] = $base('expense');
        }

        return [
            'datasets' => [
                [
                    'label' => 'Income',
                    'data' => $income,
                    'backgroundColor' => 'rgba(0, 184, 166, 0.15)',
                    'borderColor' => '#00b8a6',
                    'fill' => true,
                    'tension' => 0.4,
                ],
                [
                    'label' => 'Expenses',
                    'data' => $expense,
                    'backgroundColor' => 'rgba(225, 29, 72, 0.1)',
                    'borderColor' => '#e11d48',
                    'fill' => true,
                    'tension' => 0.4,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
