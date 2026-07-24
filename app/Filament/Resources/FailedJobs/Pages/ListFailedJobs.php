<?php

namespace App\Filament\Resources\FailedJobs\Pages;

use App\Filament\Resources\FailedJobs\FailedJobResource;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\Artisan;

class ListFailedJobs extends ListRecords
{
    protected static string $resource = FailedJobResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('retryAll')
                ->label('Retry all')
                ->icon('heroicon-o-arrow-path')
                ->color('warning')
                ->requiresConfirmation()
                ->modalDescription('Re-queue every failed job. Needs a running queue worker to process them.')
                ->visible(fn () => FailedJobResource::getModel()::exists())
                ->action(function () {
                    $count = FailedJobResource::getModel()::count();
                    Artisan::call('queue:retry', ['id' => ['all']]);

                    Notification::make()
                        ->title($count.' failed job(s) re-queued')
                        ->success()
                        ->send();
                }),
        ];
    }
}
