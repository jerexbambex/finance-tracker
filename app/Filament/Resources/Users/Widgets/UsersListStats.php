<?php

namespace App\Filament\Resources\Users\Widgets;

use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class UsersListStats extends StatsOverviewWidget
{
    protected ?string $pollingInterval = null;

    protected function getStats(): array
    {
        $data = Cache::remember('admin.users.list.stats', now()->addMinutes(5), function () {
            $monthStart = now()->startOfMonth();

            return [
                'total' => User::count(),
                'verified' => User::whereNotNull('email_verified_at')->count(),
                'new' => User::where('created_at', '>=', $monthStart)->count(),
                'unverified' => User::whereNull('email_verified_at')->count(),
            ];
        });

        $verifiedPct = $data['total'] > 0
            ? round($data['verified'] / $data['total'] * 100)
            : 0;

        return [
            Stat::make('Total Users', number_format($data['total']))
                ->descriptionIcon('heroicon-m-users')
                ->color('primary'),
            Stat::make('Verified', number_format($data['verified']))
                ->description($verifiedPct.'% of users')
                ->descriptionIcon('heroicon-m-check-badge')
                ->color('success'),
            Stat::make('New This Month', number_format($data['new']))
                ->description(now()->format('F Y'))
                ->descriptionIcon('heroicon-m-user-plus')
                ->color('info'),
            Stat::make('Unverified', number_format($data['unverified']))
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color('warning'),
        ];
    }
}
