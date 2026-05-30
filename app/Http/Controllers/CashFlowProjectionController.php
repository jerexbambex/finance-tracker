<?php

namespace App\Http\Controllers;

use App\Currency;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CashFlowProjectionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $horizon = 90;
        $today = now()->startOfDay();
        $end = $today->copy()->addDays($horizon);

        // Starting balance per currency (active accounts)
        $accounts = $user->accounts()->where('is_active', true)->get();
        $startByCurrency = $accounts->groupBy('currency')->map(fn ($accts) => $accts->sum('balance'));

        // Generate recurring events within the horizon
        $recurring = $user->recurringTransactions()
            ->where('is_active', true)
            ->with('account')
            ->get();

        $events = []; // [currency => [ ['date' => Carbon, 'delta' => float] ]]

        foreach ($recurring as $r) {
            $currency = $r->account?->currency;
            if (! $currency) {
                continue;
            }

            $cursor = Carbon::parse($r->next_due_date)->startOfDay();
            // Skip occurrences already in the past relative to today
            while ($cursor->lt($today)) {
                $cursor = $this->advance($cursor, $r->frequency);
            }

            while ($cursor->lte($end)) {
                $delta = $r->type === 'income' ? $r->amount : -$r->amount;
                $events[$currency][] = ['date' => $cursor->copy(), 'delta' => $delta];
                $cursor = $this->advance($cursor, $r->frequency);
            }
        }

        // Build a timeline + milestone projections per currency
        $currencies = $startByCurrency->keys()
            ->merge(array_keys($events))
            ->unique()
            ->values();

        $timelines = [];
        $milestones = [];

        foreach ($currencies as $currency) {
            $running = (float) ($startByCurrency[$currency] ?? 0);
            $currencyEvents = collect($events[$currency] ?? [])->sortBy(fn ($e) => $e['date']->timestamp)->values();

            $points = [[
                'date' => $today->toDateString(),
                'label' => $today->format('M d'),
                'balance' => round($running, 2),
            ]];

            $at30 = $at60 = $at90 = $running;

            foreach ($currencyEvents as $event) {
                $running += $event['delta'];
                $points[] = [
                    'date' => $event['date']->toDateString(),
                    'label' => $event['date']->format('M d'),
                    'balance' => round($running, 2),
                ];

                $daysOut = $today->diffInDays($event['date']);
                if ($daysOut <= 30) {
                    $at30 = $running;
                }
                if ($daysOut <= 60) {
                    $at60 = $running;
                }
                if ($daysOut <= 90) {
                    $at90 = $running;
                }
            }

            $timelines[$currency] = $points;
            $milestones[$currency] = [
                'start' => round((float) ($startByCurrency[$currency] ?? 0), 2),
                'day30' => round($at30, 2),
                'day60' => round($at60, 2),
                'day90' => round($at90, 2),
            ];
        }

        return Inertia::render('cash-flow/Index', [
            'timelines' => $timelines,
            'milestones' => $milestones,
            'horizon' => $horizon,
            'currencies' => collect(Currency::cases())->mapWithKeys(fn ($c) => [
                $c->value => ['symbol' => $c->symbol(), 'label' => $c->label()],
            ]),
        ]);
    }

    private function advance(Carbon $date, string $frequency): Carbon
    {
        return match ($frequency) {
            'daily' => $date->copy()->addDay(),
            'weekly' => $date->copy()->addWeek(),
            'biweekly' => $date->copy()->addWeeks(2),
            'monthly' => $date->copy()->addMonth(),
            'quarterly' => $date->copy()->addMonths(3),
            'yearly' => $date->copy()->addYear(),
            default => $date->copy()->addMonth(),
        };
    }
}
