<?php

use App\Filament\Pages\SystemStatus;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    config(['queue.default' => 'database']);

    Role::findOrCreate('admin', 'web');
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);
    Filament::setCurrentPanel(Filament::getPanel('admin'));
});

function seedFailedJob(): void
{
    DB::table('failed_jobs')->insert([
        'uuid' => (string) Str::uuid(),
        'connection' => 'database',
        'queue' => 'default',
        'payload' => '{}',
        'exception' => 'boom',
        'failed_at' => now(),
    ]);
}

function seedPendingJob(): void
{
    DB::table('jobs')->insert([
        'queue' => 'default',
        'payload' => '{}',
        'attempts' => 0,
        'reserved_at' => null,
        'available_at' => now()->timestamp,
        'created_at' => now()->timestamp,
    ]);
}

test('flush failed jobs action empties the failed_jobs table', function () {
    seedFailedJob();
    seedFailedJob();
    expect(DB::table('failed_jobs')->count())->toBe(2);

    Livewire::test(SystemStatus::class)
        ->callAction('flushFailed')
        ->assertHasNoActionErrors()
        ->assertNotified();

    expect(DB::table('failed_jobs')->count())->toBe(0);
});

test('clear pending jobs action empties the jobs table', function () {
    seedPendingJob();
    expect(DB::table('jobs')->count())->toBe(1);

    Livewire::test(SystemStatus::class)
        ->callAction('clearPending')
        ->assertHasNoActionErrors()
        ->assertNotified();

    expect(DB::table('jobs')->count())->toBe(0);
});

test('flush action is disabled when there are no failed jobs', function () {
    Livewire::test(SystemStatus::class)
        ->assertActionDisabled('flushFailed');
});
