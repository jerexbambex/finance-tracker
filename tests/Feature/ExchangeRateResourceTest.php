<?php

use App\Filament\Resources\ExchangeRates\Pages\ListExchangeRates;
use App\Models\ExchangeRate;
use App\Models\User;
use Filament\Facades\Filament;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('admin', 'web');
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin);
    Filament::setCurrentPanel(Filament::getPanel('admin'));
});

it('lists exchange rates in the admin panel', function () {
    ExchangeRate::create(['currency' => 'EUR', 'rate_to_usd' => 1.08, 'source' => 'api', 'fetched_at' => now()]);

    Livewire::test(ListExchangeRates::class)
        ->assertOk()
        ->assertCanSeeTableRecords(ExchangeRate::all());
});

it('stamps a manually created rate with source manual and a fresh fetched_at', function () {
    Livewire::test(\App\Filament\Resources\ExchangeRates\Pages\CreateExchangeRate::class)
        ->fillForm(['currency' => 'GBP', 'rate_to_usd' => 1.27])
        ->call('create')
        ->assertHasNoFormErrors();

    $rate = ExchangeRate::where('currency', 'GBP')->first();

    expect($rate->source)->toBe('manual')
        ->and($rate->fetched_at)->not->toBeNull();
});
