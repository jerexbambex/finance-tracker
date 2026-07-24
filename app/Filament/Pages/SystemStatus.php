<?php

namespace App\Filament\Pages;

use App\Services\HealthCheck;
use BackedEnum;
use Filament\Actions\Action;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use UnitEnum;

class SystemStatus extends Page
{
    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-signal';

    protected static string|UnitEnum|null $navigationGroup = 'System';

    protected static ?string $title = 'System Status';

    protected static ?int $navigationSort = 90;

    protected string $view = 'filament.pages.system-status';

    /**
     * Panel access is already gated to admins via User::canAccessPanel().
     */
    public static function canAccess(): bool
    {
        return true;
    }

    /**
     * @return array<Action>
     */
    protected function getHeaderActions(): array
    {
        $isDatabaseQueue = config('queue.default') === 'database';

        return [
            Action::make('retryFailed')
                ->label('Retry failed jobs')
                ->icon('heroicon-o-arrow-path')
                ->color('warning')
                ->requiresConfirmation()
                ->modalHeading('Retry failed jobs')
                ->modalDescription('Re-queue every failed job so a worker picks them up again. Needs a running queue worker to process them.')
                ->visible($isDatabaseQueue)
                ->badge(fn () => ($count = DB::table('failed_jobs')->count()) > 0 ? $count : null)
                ->disabled(fn () => DB::table('failed_jobs')->count() === 0)
                ->action(function () {
                    $count = DB::table('failed_jobs')->count();
                    Artisan::call('queue:retry', ['id' => ['all']]);

                    Notification::make()
                        ->title('Failed jobs re-queued')
                        ->body($count.' failed job'.($count === 1 ? '' : 's').' pushed back onto the queue.')
                        ->success()
                        ->send();
                }),

            Action::make('flushFailed')
                ->label('Flush failed jobs')
                ->icon('heroicon-o-trash')
                ->color('danger')
                ->requiresConfirmation()
                ->modalHeading('Flush failed jobs')
                ->modalDescription('Permanently delete every row from the failed_jobs table. This cannot be undone.')
                ->visible($isDatabaseQueue)
                ->badge(fn () => ($count = DB::table('failed_jobs')->count()) > 0 ? $count : null)
                ->disabled(fn () => DB::table('failed_jobs')->count() === 0)
                ->action(function () {
                    $count = DB::table('failed_jobs')->count();
                    Artisan::call('queue:flush');

                    Notification::make()
                        ->title('Failed jobs flushed')
                        ->body($count.' failed job'.($count === 1 ? '' : 's').' cleared.')
                        ->success()
                        ->send();
                }),

            Action::make('clearPending')
                ->label('Clear pending jobs')
                ->icon('heroicon-o-backspace')
                ->color('gray')
                ->requiresConfirmation()
                ->modalHeading('Clear pending jobs')
                ->modalDescription('Delete all queued jobs waiting to run. Any work they represent will not be processed.')
                ->visible($isDatabaseQueue)
                ->badge(fn () => ($count = DB::table('jobs')->count()) > 0 ? $count : null)
                ->disabled(fn () => DB::table('jobs')->count() === 0)
                ->action(function () {
                    $count = DB::table('jobs')->count();
                    Artisan::call('queue:clear', ['--force' => true]);

                    Notification::make()
                        ->title('Pending jobs cleared')
                        ->body($count.' pending job'.($count === 1 ? '' : 's').' removed.')
                        ->success()
                        ->send();
                }),
        ];
    }

    public function getViewData(): array
    {
        $health = app(HealthCheck::class);
        $components = $health->components();

        return [
            'components' => $components,
            'overall' => $health->overall($components),
            'checkedAt' => now(),
            'system' => $this->systemInfo(),
            'queue' => $this->queueStats(),
        ];
    }

    private function systemInfo(): array
    {
        $disk = base_path();

        return [
            'App version' => config('app.version', 'n/a'),
            'Laravel' => app()->version(),
            'PHP' => PHP_VERSION,
            'Environment' => app()->environment(),
            'Debug mode' => config('app.debug') ? 'on' : 'off',
            'Database driver' => config('database.default'),
            'Cache driver' => config('cache.default'),
            'Queue driver' => config('queue.default'),
            'Disk free' => $this->humanBytes(@disk_free_space($disk) ?: 0),
        ];
    }

    private function queueStats(): array
    {
        if (config('queue.default') !== 'database') {
            return ['pending' => null, 'failed' => null];
        }

        return [
            'pending' => DB::table('jobs')->count(),
            'failed' => DB::table('failed_jobs')->count(),
        ];
    }

    private function humanBytes(float $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 1).' '.$units[$i];
    }
}
