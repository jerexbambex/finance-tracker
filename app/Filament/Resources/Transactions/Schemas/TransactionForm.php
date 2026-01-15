<?php

namespace App\Filament\Resources\Transactions\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Hidden;
use Filament\Schemas\Schema;
use App\Models\Account;
use App\Models\Category;

class TransactionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Hidden::make('user_id')
                    ->default(auth()->id()),
                Select::make('account_id')
                    ->label('Account')
                    ->required()
                    ->relationship('account', 'name')
                    ->searchable()
                    ->preload(),
                Select::make('type')
                    ->required()
                    ->options([
                        'income' => 'Income',
                        'expense' => 'Expense',
                        'transfer' => 'Transfer',
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
                DatePicker::make('transaction_date')
                    ->required()
                    ->default(now()),
                Textarea::make('notes')
                    ->rows(2)
                    ->columnSpanFull(),
                Toggle::make('is_recurring')
                    ->default(false),
            ]);
    }
}
