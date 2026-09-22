<?php

use App\Models\ExchangeRate;
use App\Services\CurrencyConverter;

function rate(string $currency, float $rateToUsd): void
{
    ExchangeRate::create(['currency' => $currency, 'rate_to_usd' => $rateToUsd, 'source' => 'manual']);
}

it('returns the amount unchanged when converting a currency to itself, even with no rate on file', function () {
    expect(app(CurrencyConverter::class)->convert(100, 'XYZ', 'XYZ'))->toEqual(100.0);
});

it('converts between two currencies via usd as the pivot', function () {
    rate('USD', 1.0);
    rate('EUR', 1.08); // 1 EUR = 1.08 USD
    rate('NGN', 0.00062); // 1 NGN = 0.00062 USD

    $converter = app(CurrencyConverter::class);

    // 100 EUR -> USD: 100 * 1.08 = 108
    expect($converter->convert(100, 'EUR', 'USD'))->toEqual(108.0);

    // 100 USD -> EUR: 100 / 1.08
    expect(round($converter->convert(100, 'USD', 'EUR'), 4))->toEqual(round(100 / 1.08, 4));

    // Cross pivot: EUR -> NGN via USD
    expect(round($converter->convert(100, 'EUR', 'NGN'), 2))->toEqual(round(100 * 1.08 / 0.00062, 2));
});

it('returns null when either side has no stored rate', function () {
    rate('USD', 1.0);

    $converter = app(CurrencyConverter::class);

    expect($converter->convert(100, 'GBP', 'USD'))->toBeNull()
        ->and($converter->convert(100, 'USD', 'GBP'))->toBeNull()
        ->and($converter->hasRate('GBP'))->toBeFalse()
        ->and($converter->hasRate('USD'))->toBeTrue();
});

it('sumTo totals convertible currencies and reports the rest as excluded', function () {
    rate('USD', 1.0);
    rate('EUR', 1.08);

    $result = app(CurrencyConverter::class)->sumTo(['USD' => 100, 'EUR' => 50, 'NGN' => 5000], 'USD');

    expect($result['total'])->toEqual(100 + 50 * 1.08)
        ->and($result['excluded'])->toBe(['NGN']);
});

it('picks up a newly saved rate without a stale cache', function () {
    rate('USD', 1.0);
    $converter = app(CurrencyConverter::class);

    expect($converter->hasRate('EUR'))->toBeFalse();

    rate('EUR', 1.08); // triggers ExchangeRate::booted() cache invalidation

    expect($converter->hasRate('EUR'))->toBeTrue()
        ->and($converter->convert(10, 'EUR', 'USD'))->toEqual(10.8);
});
