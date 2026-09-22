<?php

namespace App\Filament\Resources\ExchangeRates\Pages;

use App\Filament\Resources\ExchangeRates\ExchangeRateResource;
use Filament\Resources\Pages\CreateRecord;

class CreateExchangeRate extends CreateRecord
{
    protected static string $resource = ExchangeRateResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // Anything entered here is manual by definition, and dated now so the
        // "no rate on file" excluded-currency check treats it as current.
        $data['source'] = 'manual';
        $data['fetched_at'] = now();

        return $data;
    }
}
