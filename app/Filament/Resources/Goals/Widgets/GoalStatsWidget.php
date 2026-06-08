<?php

namespace App\Filament\Resources\Goals\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Model;

class GoalStatsWidget extends StatsOverviewWidget
{
    public ?Model $record = null;

    protected function getStats(): array
    {
        $goal = $this->record;

        $remaining = max($goal->target_amount - $goal->current_amount, 0);
        $percentage = $goal->getPercentageComplete();

        $fmt = fn ($v) => number_format((float) $v, 2);

        return [
            Stat::make('Target', $fmt($goal->target_amount))
                ->icon('heroicon-o-flag')
                ->color('primary'),

            Stat::make('Saved', $fmt($goal->current_amount))
                ->description(round($percentage).'% complete')
                ->icon('heroicon-o-banknotes')
                ->color($goal->is_completed || $percentage >= 100 ? 'success' : 'info'),

            Stat::make('Remaining', $fmt($remaining))
                ->description($remaining > 0 ? 'To go' : 'Reached')
                ->icon('heroicon-o-arrow-trending-up')
                ->color($remaining > 0 ? 'warning' : 'success'),
        ];
    }
}
