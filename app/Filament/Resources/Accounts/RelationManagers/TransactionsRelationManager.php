<?php

namespace App\Filament\Resources\Accounts\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TransactionsRelationManager extends RelationManager
{
    protected static string $relationship = 'transactions';

    protected static ?string $title = 'Transactions';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('description')
            ->defaultSort('transaction_date', 'desc')
            ->columns([
                TextColumn::make('transaction_date')
                    ->date()
                    ->sortable(),
                TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state) => match ($state) {
                        'income' => 'success',
                        'expense' => 'danger',
                        'transfer' => 'info',
                        default => 'gray',
                    }),
                TextColumn::make('category.name')
                    ->label('Category')
                    ->placeholder('Uncategorized'),
                TextColumn::make('amount')
                    ->money(fn ($record) => $record->currency ?? 'USD')
                    ->sortable(),
                TextColumn::make('description')
                    ->limit(40)
                    ->searchable(),
            ]);
    }
}
