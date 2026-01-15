<?php

namespace App\Filament\Resources\RecurringTransactions\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Hidden;
use Filament\Schemas\Schema;

class RecurringTransactionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Hidden::make('user_id')
                    ->default(auth()->id()),
                Select::make('account_id')
                    ->label('Account')
                    ->relationship('account', 'name')
                    ->required()
                    ->searchable()
                    ->preload(),
                Select::make('type')
                    ->required()
                    ->options([
                        'income' => 'Income',
                        'expense' => 'Expense',
                    ])
                    ->reactive(),
                Select::make('category_id')
                    ->label('Category')
                    ->relationship('category', 'name', fn ($query, $get) => 
                        $query->where('type', $get('type'))
                              ->where('is_active', true)
                    )
                    ->searchable()
                    ->preload(),
                TextInput::make('amount')
                    ->required()
                    ->numeric()
                    ->prefix('$')
                    ->step(0.01),
                Textarea::make('description')
                    ->required()
                    ->rows(2)
                    ->columnSpanFull(),
                Select::make('frequency')
                    ->required()
                    ->options([
                        'daily' => 'Daily',
                        'weekly' => 'Weekly',
                        'biweekly' => 'Bi-weekly',
                        'monthly' => 'Monthly',
                        'quarterly' => 'Quarterly',
                        'yearly' => 'Yearly',
                    ])
                    ->default('monthly'),
                DatePicker::make('next_due_date')
                    ->required()
                    ->default(now()->addMonth()),
                Toggle::make('is_active')
                    ->default(true),
            ]);
    }
}
