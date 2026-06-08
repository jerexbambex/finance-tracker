<?php

namespace App\Filament\Widgets;

use App\Currency;
use App\Models\Account;
use App\Models\Transaction;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\Cache;

class CurrencyOverview extends Widget
{
    protected string $view = 'filament.widgets.currency-overview';

    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected ?string $pollingInterval = null;

    /**
     * One row per currency — balance plus this month's income / expenses / net.
     * Amounts of different currencies are never summed together.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getRows(): array
    {
        return Cache::remember('admin.currency.overview', now()->addMinutes(5), function () {
            $monthStart = now()->startOfMonth()->toDateString();
            $monthEnd = now()->endOfMonth()->toDateString();

            $balances = Account::where('is_active', true)
                ->selectRaw('currency, SUM(balance) as total')
                ->groupBy('currency')->pluck('total', 'currency');

            $sum = fn (string $type) => Transaction::where('type', $type)
                ->whereBetween('transaction_date', [$monthStart, $monthEnd])
                ->selectRaw('currency, SUM(amount) as total')
                ->groupBy('currency')->pluck('total', 'currency');

            $income = $sum('income');
            $expense = $sum('expense');

            $codes = collect($balances->keys())
                ->merge($income->keys())
                ->merge($expense->keys())
                ->unique()->sort()->values();

            return $codes->map(function ($code) use ($balances, $income, $expense) {
                $bal = (float) ($balances[$code] ?? 0) / 100;
                $inc = (float) ($income[$code] ?? 0) / 100;
                $exp = (float) ($expense[$code] ?? 0) / 100;
                $symbol = Currency::tryFrom($code)?->symbol() ?? $code;

                return [
                    'currency' => $code,
                    'balance' => $symbol.number_format($bal, 2),
                    'income' => $symbol.number_format($inc, 2),
                    'expense' => $symbol.number_format($exp, 2),
                    'net' => $symbol.number_format($inc - $exp, 2),
                    'net_positive' => ($inc - $exp) >= 0,
                ];
            })->all();
        });
    }
}
