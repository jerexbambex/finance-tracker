<?php

namespace App\Filament\Widgets;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Goal;
use App\Models\Transaction;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        // Get balances by currency
        $balancesByCurrency = Account::where('is_active', true)
            ->selectRaw('currency, SUM(balance) as total')
            ->groupBy('currency')
            ->get()
            ->mapWithKeys(fn($item) => [$item->currency => $item->total / 100]);

        // Get income by currency
        $incomeByCurrency = Transaction::where('transactions.type', 'income')
            ->whereYear('transaction_date', now()->year)
            ->whereMonth('transaction_date', now()->month)
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->selectRaw('accounts.currency, SUM(transactions.amount) as total')
            ->groupBy('accounts.currency')
            ->get()
            ->mapWithKeys(fn($item) => [$item->currency => $item->total / 100]);

        // Get expenses by currency
        $expensesByCurrency = Transaction::where('transactions.type', 'expense')
            ->whereYear('transaction_date', now()->year)
            ->whereMonth('transaction_date', now()->month)
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->selectRaw('accounts.currency, SUM(transactions.amount) as total')
            ->groupBy('accounts.currency')
            ->get()
            ->mapWithKeys(fn($item) => [$item->currency => $item->total / 100]);

        $activeBudgets = Budget::where('is_active', true)->count();
        $activeGoals = Goal::where('is_active', true)->where('is_completed', false)->count();
        $totalUsers = \App\Models\User::count();

        // Format currency amounts
        $formatCurrencies = function($amounts) {
            return $amounts->map(function($amount, $currency) {
                $symbol = \App\Currency::tryFrom($currency)?->symbol() ?? $currency;
                return $symbol . number_format($amount, 2);
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
                ->description('Registered users')
                ->color('primary'),

            Stat::make('Active Budgets', $activeBudgets)
                ->description('Currently tracking')
                ->color('info'),

            Stat::make('Active Goals', $activeGoals)
                ->description('In progress')
                ->color('warning'),
        ];
    }
}
