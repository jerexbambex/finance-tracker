<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\NetWorthSnapshot;
use App\Models\Transaction;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Reconstructs a user's historical net worth per currency by replaying
 * transactions backward from today's actual account balances — the same
 * signed-delta rule TransactionObserver applies live (Transaction::
 * signedBalanceDelta), just walked in reverse. This is exact, not
 * estimated: no fake jitter or interpolation, because the transaction
 * ledger already has everything needed to know what a balance was on any
 * past date.
 *
 * A currency's history stops at its own earliest transaction — there is no
 * meaningful net worth in NGN before the user's first NGN account existed,
 * so no row is produced for dates before that, rather than padding with a
 * flat guess.
 *
 * Balances include ALL accounts, active or not: deactivating an account
 * hides it from lists, it doesn't empty it, so its money still counts
 * toward net worth.
 */
class NetWorthReconstructor
{
    /**
     * @return array<string, array<string, int>> date (Y-m-d) => [currency => cents]
     */
    public function reconstruct(User $user, int $days): array
    {
        $today = CarbonImmutable::today();
        $earliestAllowed = $today->subDays($days)->toDateString();

        $currentByCurrency = DB::table('accounts')
            ->where('user_id', $user->id)
            ->selectRaw('currency, SUM(balance) as total')
            ->groupBy('currency')
            ->get()
            ->pluck('total', 'currency')
            ->map(fn ($value) => (int) $value)
            ->all();

        if ($currentByCurrency === []) {
            return [];
        }

        // Unbounded by $days: this only needs to know THAT a currency's
        // history reaches further back than the window, not the deltas
        // themselves, so it must not be limited to the window it's deciding
        // whether to truncate.
        $earliestByCurrency = DB::table('transactions')
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->where('transactions.user_id', $user->id)
            ->selectRaw('accounts.currency, MIN(transactions.transaction_date) as earliest')
            ->groupBy('accounts.currency')
            ->get()
            ->pluck('earliest', 'currency')
            ->map(fn ($date) => CarbonImmutable::parse($date)->toDateString())
            ->all();

        // Bounded by $earliestAllowed: dates outside the window never appear
        // in the output, so their individual deltas aren't needed.
        $rows = DB::table('transactions')
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->where('transactions.user_id', $user->id)
            ->where('transactions.transaction_date', '>=', $earliestAllowed)
            ->select(
                'transactions.transaction_date as date',
                'accounts.currency',
                'transactions.type',
                'transactions.transfer_direction',
                'transactions.amount',
            )
            ->get();

        $deltasByCurrencyDate = [];

        foreach ($rows as $row) {
            $date = CarbonImmutable::parse($row->date)->toDateString();
            $delta = Transaction::signedBalanceDelta($row->type, $row->transfer_direction, (int) $row->amount);

            $deltasByCurrencyDate[$row->currency][$date] = ($deltasByCurrencyDate[$row->currency][$date] ?? 0) + $delta;
        }

        $result = [$today->toDateString() => $currentByCurrency];

        foreach ($currentByCurrency as $currency => $runningBalance) {
            $earliest = $earliestByCurrency[$currency] ?? null;

            if ($earliest === null) {
                continue; // no transactions in this currency — today's total is all there is
            }

            $start = $earliest > $earliestAllowed ? $earliest : $earliestAllowed;

            // end_of_day(D) = end_of_day(D+1) - deltas_on(D+1). $date always
            // holds "D+1" for the $prevDate ("D") we're about to compute.
            $date = $today;
            $iterations = 0;

            while ($iterations++ < $days + 1) {
                $prevDate = $date->subDay();

                if ($prevDate->toDateString() < $start) {
                    break;
                }

                $deltaOnDatePlusOne = $deltasByCurrencyDate[$currency][$date->toDateString()] ?? 0;
                $runningBalance -= $deltaOnDatePlusOne;
                $result[$prevDate->toDateString()][$currency] = $runningBalance;
                $date = $prevDate;
            }
        }

        return $result;
    }

    /**
     * Reconstruct and persist the last $days of history (upsert — safe to
     * re-run, e.g. after a backdated transaction is added).
     */
    public function backfill(User $user, int $days): int
    {
        return $this->persist($user, $this->reconstruct($user, $days));
    }

    /**
     * Persist just today's totals — the fast path for the nightly schedule,
     * which doesn't need a full replay.
     */
    public function snapshotToday(User $user): int
    {
        return $this->persist($user, $this->reconstruct($user, 0));
    }

    /**
     * @param  array<string, array<string, int>>  $history
     */
    private function persist(User $user, array $history): int
    {
        $now = now();
        $rows = [];

        foreach ($history as $date => $balances) {
            foreach ($balances as $currency => $cents) {
                $rows[] = [
                    'id' => (string) Str::uuid(),
                    'user_id' => $user->id,
                    'date' => $date,
                    'currency' => $currency,
                    'balance' => $cents,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }
        }

        if ($rows === []) {
            return 0;
        }

        NetWorthSnapshot::query()->upsert($rows, ['user_id', 'date', 'currency'], ['balance', 'updated_at']);

        return count($rows);
    }
}
