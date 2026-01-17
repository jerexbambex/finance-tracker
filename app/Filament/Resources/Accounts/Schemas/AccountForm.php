<?php

namespace App\Filament\Resources\Accounts\Schemas;

use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class AccountForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required()
                    ->searchable()
                    ->preload(),
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Select::make('type')
                    ->required()
                    ->options([
                        'checking' => 'Checking',
                        'savings' => 'Savings',
                        'credit_card' => 'Credit Card',
                        'investment' => 'Investment',
                        'cash' => 'Cash',
                    ]),
                TextInput::make('balance')
                    ->required()
                    ->numeric()
                    ->default(0)
                    ->prefix('$')
                    ->step(0.01),
                TextInput::make('currency')
                    ->required()
                    ->default('USD')
                    ->maxLength(3)
                    ->datalist(['USD', 'CAD', 'EUR', 'GBP']),
                Toggle::make('is_active')
                    ->default(true),
                Textarea::make('description')
                    ->columnSpanFull()
                    ->rows(3),
            ]);
    }
}
