<?php

namespace App\Filament\Resources\Transactions\Widgets;

use App\Currency;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Database\Eloquent\Model;

class TransactionStatsWidget extends StatsOverviewWidget
{
    public ?Model $record = null;

    protected function getStats(): array
    {
        $transaction = $this->record;
        $symbol = Currency::tryFrom($transaction->currency)?->symbol() ?? '';

        $color = match ($transaction->type) {
            'income' => 'success',
            'expense' => 'danger',
            'transfer' => 'info',
            default => 'gray',
        };

        return [
            Stat::make('Amount', $symbol.number_format((float) $transaction->amount, 2))
                ->description(ucfirst($transaction->type))
                ->icon('heroicon-o-currency-dollar')
                ->color($color),

            Stat::make('Account', $transaction->account?->name ?? '—')
                ->description($symbol.number_format((float) ($transaction->account?->balance ?? 0), 2).' balance')
                ->icon('heroicon-o-banknotes')
                ->color('primary'),

            Stat::make('Splits', (string) $transaction->splits()->count())
                ->description($transaction->is_recurring ? 'Recurring' : 'One-off')
                ->icon('heroicon-o-square-2-stack')
                ->color('gray'),
        ];
    }
}
