<?php

use App\Models\ExchangeRate;
use Illuminate\Support\Facades\Http;

it('stores the inverse of the providers usd-based rates', function () {
    Http::fake([
        'open.er-api.com/*' => Http::response([
            'result' => 'success',
            'rates' => ['USD' => 1, 'EUR' => 0.92, 'NGN' => 1600],
        ]),
    ]);

    $this->artisan('exchangerates:update')->assertSuccessful();

    expect(ExchangeRate::where('currency', 'USD')->first()->rate_to_usd)->toEqual(1.0)
        ->and(round(ExchangeRate::where('currency', 'EUR')->first()->rate_to_usd, 6))->toEqual(round(1 / 0.92, 6))
        ->and(round(ExchangeRate::where('currency', 'NGN')->first()->rate_to_usd, 8))->toEqual(round(1 / 1600, 8));

    expect(ExchangeRate::where('currency', 'EUR')->first()->source)->toBe('api');
});

it('leaves existing rates untouched when the provider has no rate for a currency', function () {
    ExchangeRate::create(['currency' => 'NGN', 'rate_to_usd' => 0.00061, 'source' => 'manual']);

    Http::fake([
        'open.er-api.com/*' => Http::response([
            'result' => 'success',
            'rates' => ['USD' => 1, 'EUR' => 0.92], // no NGN this time
        ]),
    ]);

    $this->artisan('exchangerates:update')->assertSuccessful();

    expect(ExchangeRate::where('currency', 'NGN')->first())
        ->rate_to_usd->toEqual(0.00061)
        ->source->toBe('manual');
});

it('leaves all existing rates untouched when the fetch fails entirely', function () {
    ExchangeRate::create(['currency' => 'EUR', 'rate_to_usd' => 1.05, 'source' => 'manual']);

    Http::fake([
        'open.er-api.com/*' => Http::response(['error' => 'down'], 500),
    ]);

    $this->artisan('exchangerates:update')->assertFailed();

    expect(ExchangeRate::where('currency', 'EUR')->first()->rate_to_usd)->toEqual(1.05);
});
