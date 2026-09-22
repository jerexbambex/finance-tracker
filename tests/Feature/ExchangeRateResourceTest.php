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

it('shows the currency flag, name, and both rate directions readably formatted', function () {
    ExchangeRate::create(['currency' => 'NGN', 'rate_to_usd' => 0.000625, 'source' => 'api', 'fetched_at' => now()]);
    ExchangeRate::create(['currency' => 'EUR', 'rate_to_usd' => 1.147105, 'source' => 'api', 'fetched_at' => now()]);
    ExchangeRate::create(['currency' => 'USD', 'rate_to_usd' => 1, 'source' => 'api', 'fetched_at' => now()]);

    Livewire::test(ListExchangeRates::class)
        ->assertOk()
        ->assertSeeHtml('🇳🇬')
        ->assertSee('Nigerian Naira')
        ->assertSee('1 NGN = $0.000625')
        ->assertSee('1 USD = ₦1,600.00') // the inverse of 0.000625, thousands-separated
        ->assertSee('1 EUR = $1.1471');  // scaled to 4 decimals once >= 1, not a flat 6
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
