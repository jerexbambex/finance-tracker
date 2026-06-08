<?php

namespace App\Filament\Resources\Goals\Widgets;

use App\Models\Goal;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class GoalsListStats extends StatsOverviewWidget
{
    protected ?string $pollingInterval = null;

    protected function getStats(): array
    {
        $data = Cache::remember('admin.goals.list.stats', now()->addMinutes(5), fn () => [
            'total' => Goal::count(),
            'active' => Goal::where('is_active', true)->where('is_completed', false)->count(),
            'completed' => Goal::where('is_completed', true)->count(),
        ]);

        return [
            Stat::make('Total Goals', number_format($data['total']))
                ->descriptionIcon('heroicon-m-flag')
                ->color('primary'),
            Stat::make('Active', number_format($data['active']))
                ->color('info'),
            Stat::make('Completed', number_format($data['completed']))
                ->descriptionIcon('heroicon-m-check-circle')
                ->color('success'),
        ];
    }
}
