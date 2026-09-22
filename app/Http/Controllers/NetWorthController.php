<?php

namespace App\Http\Controllers;

use App\Currency;
use App\Services\CurrencyConverter;
use App\Services\NetWorthReconstructor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NetWorthController extends Controller
{
    public function index(Request $request, NetWorthReconstructor $reconstructor, CurrencyConverter $converter)
    {
        $user = $request->user();

        // First visit ever: nothing to chart yet. Reconstruct once from the
        // ledger so there's an immediate trend instead of an empty page
        // waiting on tonight's cron. Every visit after this is cheap — it
        // just reads what the nightly snapshot already wrote.
        if ($user->netWorthSnapshots()->doesntExist()) {
            $reconstructor->backfill($user, 365);
        }

        $range = (int) $request->input('range', 90);
        $range = in_array($range, [30, 90, 365], true) ? $range : 90;

        $base = $user->base_currency ?: 'USD';

        $snapshots = $user->netWorthSnapshots()
            ->where('date', '>=', now()->subDays($range)->toDateString())
            ->orderBy('date')
            ->get()
            ->groupBy(fn ($snapshot) => $snapshot->date->toDateString());

        $excludedCurrencies = [];

        $trend = $snapshots->map(function ($rows, $date) use ($converter, $base, &$excludedCurrencies) {
            $byCurrency = $rows->pluck('balance', 'currency')->all();
            ['total' => $total, 'excluded' => $excluded] = $converter->sumTo($byCurrency, $base);
            $excludedCurrencies = [...$excludedCurrencies, ...$excluded];

            return ['date' => $date, 'netWorth' => round($total, 2)];
        })->values()->sortBy('date')->values();

        $latestRows = $snapshots->last();
        $currentByCurrency = $latestRows ? $latestRows->pluck('balance', 'currency')->all() : [];
        ['total' => $currentTotal, 'excluded' => $currentExcluded] = $converter->sumTo($currentByCurrency, $base);

        $first = $trend->first();
        $changeAmount = $first ? $currentTotal - $first['netWorth'] : 0;
        $changePercent = $first && $first['netWorth'] != 0
            ? ($changeAmount / abs($first['netWorth'])) * 100
            : null;

        return Inertia::render('net-worth/Index', [
            'trend' => $trend,
            'currentTotal' => round($currentTotal, 2),
            'currentByCurrency' => $currentByCurrency,
            'baseCurrency' => $base,
            'excludedCurrencies' => array_values(array_unique([...$excludedCurrencies, ...$currentExcluded])),
            'range' => $range,
            'changeAmount' => round($changeAmount, 2),
            'changePercent' => $changePercent !== null ? round($changePercent, 1) : null,
            'currencies' => collect(Currency::cases())->map(fn ($c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ]),
        ]);
    }
}
