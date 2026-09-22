<?php

namespace App\Filament\Widgets;

use App\Models\PageVisit;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class VisitorStats extends StatsOverviewWidget
{
    protected static ?int $sort = 0;

    protected ?string $pollingInterval = null;

    protected function getStats(): array
    {
        $data = Cache::remember('admin.stats.visitors', now()->addMinutes(5), function () {
            $todayStart = now()->startOfDay();
            $weekStart = now()->subDays(6)->startOfDay();

            return [
                'visitsToday' => PageVisit::where('visited_at', '>=', $todayStart)->count(),
                'visitorsToday' => PageVisit::where('visited_at', '>=', $todayStart)->distinct('visitor_hash')->count('visitor_hash'),
                'visitsWeek' => PageVisit::where('visited_at', '>=', $weekStart)->count(),
                'visitorsWeek' => PageVisit::where('visited_at', '>=', $weekStart)->distinct('visitor_hash')->count('visitor_hash'),
            ];
        });

        return [
            Stat::make('Page Views Today', number_format($data['visitsToday']))
                ->descriptionIcon('heroicon-m-eye')
                ->color('info'),

            Stat::make('Unique Visitors Today', number_format($data['visitorsToday']))
                ->descriptionIcon('heroicon-m-user-group')
                ->color('success'),

            Stat::make('Page Views (7 days)', number_format($data['visitsWeek']))
                ->descriptionIcon('heroicon-m-eye')
                ->color('info'),

            Stat::make('Unique Visitors (7 days)', number_format($data['visitorsWeek']))
                ->descriptionIcon('heroicon-m-user-group')
                ->color('success'),
        ];
    }
}
