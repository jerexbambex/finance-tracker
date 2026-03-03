<?php

namespace App\Filament\Resources\AiToolRuns\Pages;

use App\Filament\Resources\AiToolRuns\AiToolRunResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListAiToolRuns extends ListRecords
{
    protected static string $resource = AiToolRunResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
