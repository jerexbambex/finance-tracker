<?php

namespace App\Filament\Resources\Users\RelationManagers;

use Filament\Actions\AssociateAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\DissociateAction;
use Filament\Actions\DissociateBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class BudgetsRelationManager extends RelationManager
{
    protected static string $relationship = 'budgets';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->columns([
                TextColumn::make('category.name')
                    ->label('Category')
                    ->badge()
                    ->searchable(),
                TextColumn::make('amount')
                    ->money(fn ($record) => $record->currency ?? 'USD')
                    ->sortable(),
                TextColumn::make('period_type')
                    ->label('Period')
                    ->badge(),
                TextColumn::make('period_year')
                    ->label('Year')
                    ->toggleable(),
                TextColumn::make('period_month')
                    ->label('Month')
                    ->toggleable(),
                TextColumn::make('is_active')
                    ->label('Active')
                    ->badge()
                    ->color(fn ($state) => $state ? 'success' : 'gray'),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
