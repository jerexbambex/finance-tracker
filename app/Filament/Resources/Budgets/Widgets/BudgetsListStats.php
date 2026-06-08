<?php

namespace App\Filament\Resources\Budgets\Widgets;

use App\Models\Budget;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class BudgetsListStats extends StatsOverviewWidget
{
    protected ?string $pollingInterval = null;

    protected function getStats(): array
    {
        $data = Cache::remember('admin.budgets.list.stats', now()->addMinutes(5), fn () => [
            'total' => Budget::count(),
            'active' => Budget::where('is_active', true)->count(),
            'thisPeriod' => Budget::where('period_year', now()->year)
                ->where('period_month', now()->month)->count(),
        ]);

        return [
            Stat::make('Total Budgets', number_format($data['total']))
                ->descriptionIcon('heroicon-m-calculator')
                ->color('primary'),
            Stat::make('Active', number_format($data['active']))
                ->color('success'),
            Stat::make('This Month', number_format($data['thisPeriod']))
                ->description(now()->format('F Y'))
                ->color('info'),
        ];
    }
}
