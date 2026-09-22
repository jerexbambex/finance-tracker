<?php

namespace App\Console\Commands;

use App\Currency;
use App\Models\ExchangeRate;
use App\Services\ExchangeRateProvider;
use Illuminate\Console\Command;

class UpdateExchangeRates extends Command
{
    protected $signature = 'exchangerates:update';

    protected $description = 'Refresh exchange rates from the configured provider (manual rates stand in for anything it fails to return)';

    public function handle(ExchangeRateProvider $provider): int
    {
        $usdRates = $provider->tryFetchUsdRates();

        // A failed fetch leaves whatever rates already exist (API or manual)
        // untouched rather than blanking anything out.
        if ($usdRates === null) {
            $this->warn('Exchange rate fetch failed; existing rates left untouched.');

            return self::FAILURE;
        }

        $updated = 0;
        $missing = [];

        foreach (Currency::cases() as $currency) {
            $code = $currency->value;

            // The provider is USD-based ("1 USD = X currency"); this table
            // stores the inverse ("1 currency = X USD").
            $unitsPerUsd = $usdRates[$code] ?? null;

            if ($code === 'USD') {
                $rateToUsd = 1.0;
            } elseif ($unitsPerUsd !== null && $unitsPerUsd > 0) {
                $rateToUsd = 1 / $unitsPerUsd;
            } else {
                // Provider doesn't cover this currency this run — keep
                // whatever manual/previous rate is on file, if any.
                $missing[] = $code;

                continue;
            }

            ExchangeRate::updateOrCreate(
                ['currency' => $code],
                ['rate_to_usd' => $rateToUsd, 'source' => 'api', 'fetched_at' => now()],
            );

            $updated++;
        }

        $this->info("Updated {$updated} exchange rate".($updated === 1 ? '' : 's').'.');

        if ($missing !== []) {
            $this->warn('Provider had no rate for: '.implode(', ', $missing).' — left as-is.');
        }

        return self::SUCCESS;
    }
}
