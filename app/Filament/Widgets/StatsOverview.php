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
    protected static ?int $sort = 1;

    // Don't poll — these are cached, heavy all-users aggregates.
    protected ?string $pollingInterval = null;

    protected function getStats(): array
    {
        // Count-only metrics (no currency mixing). Cached briefly since these scan
        // millions of rows and an admin overview needn't be real-time.
        $data = Cache::remember('admin.stats.counts', now()->addMinutes(5), function () {
            $monthStart = now()->startOfMonth()->toDateString();
            $monthEnd = now()->endOfMonth()->toDateString();

            return [
                'totalUsers' => User::count(),
                'activeUsers' => User::where('updated_at', '>=', now()->subDays(30))->count(),
                'totalAccounts' => Account::count(),
                'activeBudgets' => Budget::where('is_active', true)->count(),
                'activeGoals' => Goal::where('is_active', true)->where('is_completed', false)->count(),
                'monthTransactions' => Transaction::whereBetween('transaction_date', [$monthStart, $monthEnd])->count(),
            ];
        });

        return [
            Stat::make('Users', number_format($data['totalUsers']))
                ->description($data['activeUsers'].' active (30 days)')
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),

            Stat::make('Accounts', number_format($data['totalAccounts']))
                ->description('Across all users')
                ->descriptionIcon('heroicon-m-banknotes')
                ->color('info'),

            Stat::make('Transactions', number_format($data['monthTransactions']))
                ->description(now()->format('F Y'))
                ->descriptionIcon('heroicon-m-arrows-right-left')
                ->color('info'),

            Stat::make('Active Budgets', number_format($data['activeBudgets']))
                ->description($data['activeGoals'].' active goals')
                ->descriptionIcon('heroicon-m-calculator')
                ->color('warning'),
        ];
    }
}
