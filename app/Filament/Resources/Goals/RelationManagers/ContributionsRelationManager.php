<?php

namespace App\Filament\Resources\Goals\RelationManagers;

use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ContributionsRelationManager extends RelationManager
{
    protected static string $relationship = 'contributions';

    protected static ?string $title = 'Contributions';

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('note')
            ->defaultSort('contribution_date', 'desc')
            ->columns([
                TextColumn::make('contribution_date')
                    ->date()
                    ->sortable(),
                TextColumn::make('amount')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('note')
                    ->limit(60)
                    ->placeholder('—')
                    ->searchable(),
            ]);
    }
}
