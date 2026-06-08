<?php

namespace App\Filament\Widgets;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Goal;
use App\Models\Transaction;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class StatsOverview extends StatsOverviewWidget
{
    // Don't poll — these are cached, heavy all-users aggregates.
    protected ?string $pollingInterval = null;

    protected function getStats(): array
    {
        // These are all-users aggregates over potentially millions of rows, so cache
        // them briefly — the admin overview doesn't need to be real-time to the second.
        $data = Cache::remember('admin.stats.overview', now()->addMinutes(5), function () {
            $monthStart = now()->startOfMonth()->toDateString();
            $monthEnd = now()->endOfMonth()->toDateString();

            $sumByCurrency = fn (string $type) => Transaction::where('type', $type)
                ->whereBetween('transaction_date', [$monthStart, $monthEnd])
                ->selectRaw('currency, SUM(amount) as total')
                ->groupBy('currency')
                ->pluck('total', 'currency')
                ->map(fn ($v) => $v / 100)
                ->all();

            return [
                'balances' => Account::where('is_active', true)
                    ->selectRaw('currency, SUM(balance) as total')
                    ->groupBy('currency')
                    ->pluck('total', 'currency')
                    ->map(fn ($v) => $v / 100)
                    ->all(),
                'income' => $sumByCurrency('income'),
                'expense' => $sumByCurrency('expense'),
                'activeBudgets' => Budget::where('is_active', true)->count(),
                'activeGoals' => Goal::where('is_active', true)->where('is_completed', false)->count(),
                'totalUsers' => User::count(),
                'activeUsers' => User::where('updated_at', '>=', now()->subDays(30))->count(),
                'totalTransactions' => Transaction::whereBetween('transaction_date', [$monthStart, $monthEnd])->count(),
            ];
        });

        $balancesByCurrency = collect($data['balances']);
        $incomeByCurrency = collect($data['income']);
        $expensesByCurrency = collect($data['expense']);
        $activeBudgets = $data['activeBudgets'];
        $activeGoals = $data['activeGoals'];
        $totalUsers = $data['totalUsers'];
        $activeUsers = $data['activeUsers'];
        $totalTransactions = $data['totalTransactions'];

        // Format currency amounts
        $formatCurrencies = function ($amounts) {
            return $amounts->map(function ($amount, $currency) {
                $symbol = \App\Currency::tryFrom($currency)?->symbol() ?? $currency;

                return $symbol.number_format($amount, 2);
            })->join(', ');
        };

        return [
            Stat::make('Total Balance', $formatCurrencies($balancesByCurrency) ?: 'No accounts')
                ->description('By currency')
                ->color('success'),

            Stat::make('This Month Income', $formatCurrencies($incomeByCurrency) ?: 'No income')
                ->description(now()->format('F Y'))
                ->color('success'),

            Stat::make('This Month Expenses', $formatCurrencies($expensesByCurrency) ?: 'No expenses')
                ->description(now()->format('F Y'))
                ->color('danger'),

            Stat::make('Total Users', $totalUsers)
                ->description($activeUsers.' active (30 days)')
                ->color('primary'),

            Stat::make('Transactions', $totalTransactions)
                ->description('This month')
                ->color('info'),

            Stat::make('Active Budgets', $activeBudgets)
                ->description($activeGoals.' active goals')
                ->color('warning'),
        ];
    }
}
