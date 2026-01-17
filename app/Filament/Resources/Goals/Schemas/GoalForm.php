<?php

namespace App\Filament\Resources\Goals\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class GoalForm
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
                Textarea::make('description')
                    ->rows(3)
                    ->columnSpanFull(),
                TextInput::make('target_amount')
                    ->required()
                    ->numeric()
                    ->prefix('$')
                    ->step(0.01),
                TextInput::make('current_amount')
                    ->required()
                    ->numeric()
                    ->default(0)
                    ->prefix('$')
                    ->step(0.01),
                DatePicker::make('target_date')
                    ->label('Target Date (Optional)'),
                TextInput::make('category')
                    ->maxLength(255),
                Toggle::make('is_completed')
                    ->default(false),
                Toggle::make('is_active')
                    ->default(true),
            ]);
    }
}
