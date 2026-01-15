<?php

namespace App\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\Budget;
use App\Models\Goal;

class StatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $user = auth()->user();
        
        $totalBalance = Account::where('user_id', $user->id)
            ->where('is_active', true)
            ->sum('balance');
        
        $thisMonthIncome = Transaction::where('user_id', $user->id)
            ->where('type', 'income')
            ->whereYear('transaction_date', now()->year)
            ->whereMonth('transaction_date', now()->month)
            ->sum('amount');
        
        $thisMonthExpenses = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->whereYear('transaction_date', now()->year)
            ->whereMonth('transaction_date', now()->month)
            ->sum('amount');
        
        $activeBudgets = Budget::where('user_id', $user->id)
            ->where('is_active', true)
            ->count();
        
        $activeGoals = Goal::where('user_id', $user->id)
            ->where('is_active', true)
            ->where('is_completed', false)
            ->count();
        
        return [
            Stat::make('Total Balance', '$' . number_format($totalBalance / 100, 2))
                ->description('Across all accounts')
                ->color('success'),
            
            Stat::make('This Month Income', '$' . number_format($thisMonthIncome / 100, 2))
                ->description(now()->format('F Y'))
                ->color('success'),
            
            Stat::make('This Month Expenses', '$' . number_format($thisMonthExpenses / 100, 2))
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
