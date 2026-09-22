<?php

namespace App\Filament\Resources\ExchangeRates\Schemas;

use App\Currency;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class ExchangeRateForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('currency')
                    ->options(collect(Currency::cases())->mapWithKeys(fn ($c) => [$c->value => $c->label()]))
                    ->required()
                    ->unique(ignoreRecord: true)
                    // The currency is this row's identity — changing it on an
                    // existing rate would silently orphan whatever pointed at
                    // the old code, so it's fixed after creation.
                    ->disabledOn('edit'),
                TextInput::make('rate_to_usd')
                    ->label('Rate to USD')
                    ->helperText('How many US dollars equal 1 unit of this currency. USD itself is always 1.')
                    ->numeric()
                    ->step(0.0000000001)
                    ->minValue(0)
                    ->required(),
                DateTimePicker::make('fetched_at')
                    ->label('Last updated')
                    ->disabled()
                    ->dehydrated(false)
                    ->visibleOn('edit'),
            ]);
    }
}
