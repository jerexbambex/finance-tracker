<?php

namespace App\Filament\Resources\FailedJobs\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Artisan;

class FailedJobsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('failed_at', 'desc')
            ->columns([
                TextColumn::make('display_name')
                    ->label('Job')
                    ->weight('medium')
                    ->searchable(query: fn ($query, $search) => $query->where('payload', 'like', "%{$search}%"))
                    ->wrap(),
                TextColumn::make('queue')
                    ->badge()
                    ->color('gray')
                    ->sortable(),
                TextColumn::make('exception')
                    ->label('Error')
                    ->formatStateUsing(fn (?string $state) => str(strtok($state ?? '', "\n"))->limit(80))
                    ->tooltip(fn (?string $state) => str($state ?? '')->limit(500))
                    ->color('danger')
                    ->wrap(),
                TextColumn::make('failed_at')
                    ->dateTime()
                    ->since()
                    ->sortable(),
                TextColumn::make('uuid')
                    ->label('UUID')
                    ->copyable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('queue')
                    ->options(fn () => \App\Models\FailedJob::query()
                        ->distinct()
                        ->pluck('queue', 'queue')
                        ->all()),
            ])
            ->recordActions([
                Action::make('retry')
                    ->label('Retry')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->modalDescription('Re-queue this job so a worker picks it up again.')
                    ->action(function ($record) {
                        Artisan::call('queue:retry', ['id' => [$record->uuid]]);

                        Notification::make()
                            ->title('Job re-queued')
                            ->success()
                            ->send();
                    }),
                Action::make('forget')
                    ->label('Delete')
                    ->icon('heroicon-o-trash')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalDescription('Permanently delete this failed job record. This cannot be undone.')
                    ->action(function ($record) {
                        Artisan::call('queue:forget', ['id' => $record->uuid]);

                        Notification::make()
                            ->title('Failed job deleted')
                            ->success()
                            ->send();
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('retrySelected')
                        ->label('Retry selected')
                        ->icon('heroicon-o-arrow-path')
                        ->color('warning')
                        ->requiresConfirmation()
                        ->action(function (Collection $records) {
                            Artisan::call('queue:retry', [
                                'id' => $records->pluck('uuid')->all(),
                            ]);

                            Notification::make()
                                ->title($records->count().' job(s) re-queued')
                                ->success()
                                ->send();
                        })
                        ->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ])
            ->emptyStateHeading('No failed jobs')
            ->emptyStateDescription('The failed_jobs table is empty.')
            ->emptyStateIcon('heroicon-o-check-circle');
    }
}
