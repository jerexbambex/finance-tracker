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
        $totalBalance = Account::where('is_active', true)
            ->sum('balance') / 100;

        $thisMonthIncome = Transaction::where('type', 'income')
            ->whereYear('transaction_date', now()->year)
            ->whereMonth('transaction_date', now()->month)
            ->sum('amount') / 100;

        $thisMonthExpenses = Transaction::where('type', 'expense')
            ->whereYear('transaction_date', now()->year)
            ->whereMonth('transaction_date', now()->month)
            ->sum('amount') / 100;

        $activeBudgets = Budget::where('is_active', true)
            ->count();

        $activeGoals = Goal::where('is_active', true)
            ->where('is_completed', false)
            ->count();

        return [
            Stat::make('Total Balance', '$'.number_format($totalBalance, 2))
                ->description('Across all accounts')
                ->color('success'),

            Stat::make('This Month Income', '$'.number_format($thisMonthIncome, 2))
                ->description(now()->format('F Y'))
                ->color('success'),

            Stat::make('This Month Expenses', '$'.number_format($thisMonthExpenses, 2))
                ->description(now()->format('F Y'))
                ->color('danger'),

            Stat::make('Active Budgets', $activeBudgets)
                ->description('Currently tracking')
                ->color('info'),

            Stat::make('Active Goals', $activeGoals)
                ->description('In progress')
                ->color('warning'),
        ];
    }
}
