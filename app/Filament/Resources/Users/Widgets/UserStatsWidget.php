<?php

namespace App\Filament\Resources\Users\Widgets;

use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Model;

class UserStatsWidget extends StatsOverviewWidget
{
    public ?Model $record = null;

    protected function getStats(): array
    {
        return [
            Stat::make('Accounts', $this->record->accounts()->count())
                ->color('success')
                ->icon('heroicon-o-banknotes'),
            Stat::make('Transactions', $this->record->transactions()->count())
                ->color('primary')
                ->icon('heroicon-o-arrows-right-left'),
            Stat::make('Budgets', $this->record->budgets()->count())
                ->color('warning')
                ->icon('heroicon-o-calculator'),
            Stat::make('Goals', $this->record->goals()->count())
                ->color('info')
                ->icon('heroicon-o-flag'),
        ];
    }
}
