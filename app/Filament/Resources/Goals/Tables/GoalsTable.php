<?php

namespace App\Filament\Resources\Goals\Tables;

use App\Models\Goal;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class GoalsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.name')
                    ->label('Owner')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('category')
                    ->badge()
                    ->placeholder('—')
                    ->searchable(),
                TextColumn::make('target_amount')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('current_amount')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('progress')
                    ->label('Progress')
                    ->badge()
                    ->state(fn (Goal $record) => round($record->getPercentageComplete()).'%')
                    ->color(fn (Goal $record) => $record->getPercentageComplete() >= 100 ? 'success' : 'info'),
                TextColumn::make('target_date')
                    ->date()
                    ->placeholder('—')
                    ->sortable(),
                IconColumn::make('is_completed')
                    ->boolean(),
                IconColumn::make('is_active')
                    ->boolean(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
