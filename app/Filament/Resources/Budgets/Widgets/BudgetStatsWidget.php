<?php

namespace App\Filament\Resources\Budgets\Widgets;

use App\Currency;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Model;

class BudgetStatsWidget extends StatsOverviewWidget
{
    public ?Model $record = null;

    protected function getStats(): array
    {
        $budget = $this->record;
        $symbol = Currency::tryFrom($budget->currency)?->symbol() ?? '';

        $spent = $budget->getSpentAmount();
        $remaining = $budget->amount - $spent;
        $percentage = $budget->amount > 0 ? ($spent / $budget->amount) * 100 : 0;

        $fmt = fn ($v) => $symbol.number_format((float) $v, 2);

        return [
            Stat::make('Budgeted', $fmt($budget->amount))
                ->description($budget->period_type)
                ->icon('heroicon-o-banknotes')
                ->color('primary'),

            Stat::make('Spent', $fmt($spent))
                ->description(round($percentage).'% of budget')
                ->icon('heroicon-o-arrow-trending-down')
                ->color($percentage >= 100 ? 'danger' : ($percentage >= 80 ? 'warning' : 'success')),

            Stat::make('Remaining', $fmt($remaining))
                ->description($remaining >= 0 ? 'On track' : 'Over budget')
                ->icon('heroicon-o-wallet')
                ->color($remaining >= 0 ? 'success' : 'danger'),
        ];
    }
}
