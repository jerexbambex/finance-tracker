<?php

namespace App\Filament\Resources\Accounts\Widgets;

use App\Currency;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Model;

class AccountStatsWidget extends StatsOverviewWidget
{
    public ?Model $record = null;

    protected function getStats(): array
    {
        $account = $this->record;
        $symbol = Currency::tryFrom($account->currency)?->symbol() ?? '';
        $fmt = fn ($v) => $symbol.number_format((float) $v, 2);

        $income = $account->transactions()->where('type', 'income')->sum('amount') / 100;
        $expense = $account->transactions()->where('type', 'expense')->sum('amount') / 100;
        $count = $account->transactions()->count();

        return [
            Stat::make('Balance', $fmt($account->balance))
                ->description($account->is_active ? 'Active' : 'Inactive')
                ->icon('heroicon-o-wallet')
                ->color($account->balance >= 0 ? 'success' : 'danger'),

            Stat::make('Total Income', $fmt($income))
                ->icon('heroicon-o-arrow-trending-up')
                ->color('success'),

            Stat::make('Total Expenses', $fmt($expense))
                ->icon('heroicon-o-arrow-trending-down')
                ->color('danger'),

            Stat::make('Transactions', (string) $count)
                ->icon('heroicon-o-arrows-right-left')
                ->color('primary'),
        ];
    }
}
