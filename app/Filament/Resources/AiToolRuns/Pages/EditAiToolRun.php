<?php

namespace App\Filament\Resources\AiToolRuns\Pages;

use App\Filament\Resources\AiToolRuns\AiToolRunResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditAiToolRun extends EditRecord
{
    protected static string $resource = AiToolRunResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
