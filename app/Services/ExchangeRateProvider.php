<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Fetches current exchange rates from the configured provider (default:
 * open.er-api.com, free and keyless). The response is USD-based
 * ("1 USD = X currency"), which UpdateExchangeRates inverts into this app's
 * rate_to_usd ("1 currency = X USD") storage.
 */
class ExchangeRateProvider
{
    /**
     * @return array<string, float> currency => units per 1 USD
     *
     * @throws RuntimeException on a network failure, non-2xx response, or a
     *                          payload missing the rates it promises — the caller (the
     *                          scheduled command) decides how to degrade, e.g. by leaving
     *                          existing rates untouched.
     */
    public function fetchUsdRates(): array
    {
        $url = config('services.exchange_rates.url');

        try {
            $response = Http::timeout(10)->get($url);
        } catch (\Throwable $e) {
            throw new RuntimeException("Exchange rate request to {$url} failed: {$e->getMessage()}", previous: $e);
        }

        if ($response->failed()) {
            throw new RuntimeException("Exchange rate provider returned HTTP {$response->status()}");
        }

        $rates = $response->json('rates');

        if (! is_array($rates) || $rates === []) {
            throw new RuntimeException('Exchange rate provider response had no usable rates.');
        }

        return array_map(fn ($rate) => (float) $rate, $rates);
    }

    /**
     * Convenience wrapper that logs and returns null instead of throwing, for
     * callers that want to degrade gracefully rather than handle the
     * exception themselves.
     *
     * @return array<string, float>|null
     */
    public function tryFetchUsdRates(): ?array
    {
        try {
            return $this->fetchUsdRates();
        } catch (\Throwable $e) {
            Log::warning('Exchange rate fetch failed', ['message' => $e->getMessage()]);

            return null;
        }
    }
}
