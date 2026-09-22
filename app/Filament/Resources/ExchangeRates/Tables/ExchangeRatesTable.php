<?php

namespace App\Filament\Resources\ExchangeRates\Tables;

use App\Currency;
use App\Models\ExchangeRate;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ExchangeRatesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('currency')
                    ->label('Currency')
                    ->formatStateUsing(fn (string $state) => trim((Currency::tryFrom($state)?->flag() ?? '').' '.$state))
                    ->description(fn (ExchangeRate $record) => Currency::tryFrom($record->currency)?->currencyName() ?? '')
                    ->weight('bold')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('rate_to_usd')
                    ->label('Rate')
                    ->formatStateUsing(fn (ExchangeRate $record) => self::forwardRate($record))
                    ->description(fn (ExchangeRate $record) => self::reverseRate($record))
                    ->fontFamily('mono')
                    ->sortable(),

                TextColumn::make('source')
                    ->badge()
                    ->color(fn (string $state) => $state === 'api' ? 'success' : 'gray'),

                TextColumn::make('fetched_at')
                    ->label('Last updated')
                    ->since()
                    ->dateTimeTooltip()
                    ->sortable()
                    ->placeholder('never')
                    // A rate more than 2 days stale means the daily
                    // exchangerates:update run has been failing silently —
                    // worth a glance rather than blending in as fine.
                    ->color(fn (?ExchangeRate $record) => $record?->fetched_at?->lt(now()->subDays(2)) ? 'danger' : null),
            ])
            ->defaultSort('currency')
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    /**
     * "1 NGN = $0.000625" — what the stored rate_to_usd actually is.
     */
    private static function forwardRate(ExchangeRate $record): string
    {
        return sprintf('1 %s = $%s', $record->currency, self::readable($record->rate_to_usd));
    }

    /**
     * "1 USD = ₦1,600.32" — the inverse, since that's the direction most
     * people actually think in for a non-USD currency.
     */
    private static function reverseRate(ExchangeRate $record): string
    {
        if ($record->currency === 'USD' || (float) $record->rate_to_usd === 0.0) {
            return '';
        }

        $currency = Currency::tryFrom($record->currency);
        $symbol = $currency?->symbol() ?? $record->currency.' ';
        $inverse = 1 / $record->rate_to_usd;

        return sprintf('1 USD = %s%s', $symbol, self::readable($inverse));
    }

    /**
     * Fixed 6 decimals reads as noise once a value clears 1 (1.147105 vs.
     * 1.1471). Scale precision to the value's own magnitude instead, and
     * add thousands separators for the large inverse rates (₦1,600.32).
     */
    private static function readable(float $value): string
    {
        $decimals = match (true) {
            $value >= 100 => 2,
            $value >= 1 => 4,
            default => 6,
        };

        return number_format($value, $decimals);
    }
}
