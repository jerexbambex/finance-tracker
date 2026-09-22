<?php

namespace App\Filament\Resources\ExchangeRates\Tables;

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
                    ->badge()
                    ->searchable()
                    ->sortable(),
                TextColumn::make('rate_to_usd')
                    ->label('Rate to USD')
                    ->numeric(decimalPlaces: 6)
                    ->sortable(),
                TextColumn::make('source')
                    ->badge()
                    ->color(fn (string $state) => $state === 'api' ? 'success' : 'gray'),
                TextColumn::make('fetched_at')
                    ->label('Last updated')
                    ->dateTime()
                    ->sortable()
                    ->placeholder('never'),
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
}
