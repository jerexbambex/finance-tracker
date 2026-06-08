<?php

namespace App\Filament\Widgets;

use App\Currency;
use App\Models\Transaction;
use Filament\Widgets\ChartWidget;

class IncomeExpenseTrend extends ChartWidget
{
    protected ?string $heading = 'Income vs Expenses (last 6 months)';

    protected ?string $maxHeight = '280px';

    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    /**
     * Currency selector — amounts of different currencies must never be summed
     * together, so the trend is always scoped to a single currency. Sourced from
     * the enum (no DB query — a DISTINCT over all accounts is expensive at scale).
     */
    protected function getFilters(): ?array
    {
        return collect(Currency::cases())
            ->mapWithKeys(fn ($c) => [$c->value => $c->label()])
            ->all();
    }

    protected function getData(): array
    {
        $currency = $this->filter ?? Currency::cases()[0]->value;

        // Build the 6 month buckets up front
        $labels = [];
        $keys = [];
        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $labels[] = $month->format('M Y');
            $keys[] = $month->format('Y-n');
        }
        $start = now()->subMonths(5)->startOfMonth();

        // One grouped query, filtering on the transactions.currency column directly
        // (no join to accounts). Cached briefly — admin trend needn't be real-time.
        $rows = \Illuminate\Support\Facades\Cache::remember(
            "admin.trend.{$currency}",
            now()->addMinutes(5),
            fn () => Transaction::query()
                ->where('currency', $currency)
                ->whereIn('type', ['income', 'expense'])
                ->where('transaction_date', '>=', $start->toDateString())
                ->selectRaw('YEAR(transaction_date) as yr, MONTH(transaction_date) as mo, type, SUM(amount) as total')
                ->groupBy('yr', 'mo', 'type')
                ->get(),
        );

        $income = array_fill(0, 6, 0);
        $expense = array_fill(0, 6, 0);
        $indexByKey = array_flip($keys);

        foreach ($rows as $row) {
            $key = $row->yr.'-'.$row->mo;
            if (! isset($indexByKey[$key])) {
                continue;
            }
            $i = $indexByKey[$key];
            if ($row->type === 'income') {
                $income[$i] = $row->total / 100;
            } else {
                $expense[$i] = $row->total / 100;
            }
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
