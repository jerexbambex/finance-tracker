<?php

namespace App\Filament\Resources\Budgets\Schemas;

use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class BudgetForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Hidden::make('user_id')
                    ->default(auth()->id()),
                Select::make('category_id')
                    ->label('Category')
                    ->required()
                    ->relationship('category', 'name', fn ($query) => $query->where('type', 'expense')
                        ->where('is_active', true)
                    )
                    ->searchable()
                    ->preload(),
                TextInput::make('amount')
                    ->required()
                    ->numeric()
                    ->prefix('$')
                    ->step(0.01),
                Select::make('period_type')
                    ->required()
                    ->options([
                        'monthly' => 'Monthly',
                        'yearly' => 'Yearly',
                    ])
                    ->default('monthly')
                    ->reactive(),
                TextInput::make('period_year')
                    ->required()
                    ->numeric()
                    ->default(now()->year)
                    ->minValue(2020)
                    ->maxValue(2100),
                TextInput::make('period_month')
                    ->numeric()
                    ->minValue(1)
                    ->maxValue(12)
                    ->default(now()->month)
                    ->visible(fn ($get) => $get('period_type') === 'monthly'),
                Toggle::make('is_active')
                    ->default(true),
            ]);
    }
}
