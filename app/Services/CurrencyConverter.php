<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ExchangeRate;
use Illuminate\Support\Facades\Cache;

/**
 * Converts amounts between currencies using USD as a pivot: every currency
 * has one stored rate (how many USD it's worth), so X -> Y is
 * amount * rateToUsd(X) / rateToUsd(Y) without an N^2 table of pairs.
 *
 * Rates are looked up from the exchange_rates table (kept warm by the
 * exchangerates:update schedule, with manual entries as a fallback for
 * whatever the API doesn't cover). A currency with no stored rate yet
 * converts to null rather than guessing — callers decide how to represent
 * "can't convert this one" (exclude it, flag it, etc.) rather than having
 * a silent wrong number baked in.
 */
class CurrencyConverter
{
    private const CACHE_KEY = 'exchange_rates.by_currency';

    private const CACHE_TTL = 3600;

    /**
     * @return array<string, float> currency => rate_to_usd
     */
    private function rates(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
            return ExchangeRate::query()->pluck('rate_to_usd', 'currency')->map(fn ($rate) => (float) $rate)->all();
        });
    }

    public function rateToUsd(string $currency): ?float
    {
        return $this->rates()[$currency] ?? null;
    }

    public function hasRate(string $currency): bool
    {
        return $this->rateToUsd($currency) !== null;
    }

    /**
     * Convert an amount from one currency to another. Returns null (never a
     * guess) if either side has no stored rate.
     */
    public function convert(float $amount, string $from, string $to): ?float
    {
        if ($from === $to) {
            return $amount;
        }

        $fromRate = $this->rateToUsd($from);
        $toRate = $this->rateToUsd($to);

        if ($fromRate === null || $toRate === null || $toRate === 0.0) {
            return null;
        }

        return $amount * $fromRate / $toRate;
    }

    /**
     * Sum a set of per-currency amounts into a single total in $to,
     * skipping (and reporting) any currency with no stored rate.
     *
     * @param  array<string, float>  $amountsByCurrency
     * @return array{total: float, excluded: list<string>}
     */
    public function sumTo(array $amountsByCurrency, string $to): array
    {
        $total = 0.0;
        $excluded = [];

        foreach ($amountsByCurrency as $currency => $amount) {
            $converted = $this->convert($amount, $currency, $to);

            if ($converted === null) {
                $excluded[] = $currency;

                continue;
            }

            $total += $converted;
        }

        return ['total' => $total, 'excluded' => $excluded];
    }

    public static function forgetCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
