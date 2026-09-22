<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Budget;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Facades\DB;

/**
 * Carries budgets forward into the next period.
 *
 * Budgets are keyed to a concrete period (period_year + period_month), so
 * without this a user's budgets silently vanish from the dashboard on the 1st
 * of every month.
 */
class BudgetRollover
{
    /**
     * Copy budgets from one period into another, on request.
     *
     * A target period that already has a budget for the source's category is
     * left untouched, so copying twice is a no-op rather than a conflict.
     *
     * @param  int|null  $fromMonth  null means the yearly budgets of that year
     * @param  int|null  $toMonth  null means the yearly budgets of that year
     * @return int how many budgets were created
     */
    public function copy(User $user, int $fromYear, ?int $fromMonth, int $toYear, ?int $toMonth): int
    {
        $periodType = $toMonth === null ? 'yearly' : 'monthly';

        $sources = $this->budgetsFor($user, $periodType, $fromYear, $fromMonth)->get();

        return $this->create($user, $sources, $periodType, $toYear, $toMonth);
    }

    /**
     * Carry a user's budgets into the period containing $now: last month's
     * monthly budgets into this month, last year's yearly budgets into this
     * year.
     *
     * Only budgets with auto_rollover set are considered, and each source is
     * stamped once it has produced its successor — so this is safe to run on
     * any schedule and will not recreate a copy the user has deleted.
     *
     * @return int how many budgets were created
     */
    public function rollForward(User $user, CarbonInterface $now): int
    {
        $previousMonth = $now->copy()->subMonthNoOverflow();

        $monthly = $this->rollPeriod(
            $user,
            'monthly',
            $previousMonth->year,
            $previousMonth->month,
            $now->year,
            $now->month,
        );

        $yearly = $this->rollPeriod(
            $user,
            'yearly',
            $now->year - 1,
            null,
            $now->year,
            null,
        );

        return $monthly + $yearly;
    }

    /**
     * Copy one period's auto-rollover budgets forward and stamp the sources.
     */
    private function rollPeriod(
        User $user,
        string $periodType,
        int $fromYear,
        ?int $fromMonth,
        int $toYear,
        ?int $toMonth,
    ): int {
        $sources = $this->budgetsFor($user, $periodType, $fromYear, $fromMonth)
            ->where('auto_rollover', true)
            ->whereNull('rolled_over_at')
            ->get();

        if ($sources->isEmpty()) {
            return 0;
        }

        return DB::transaction(function () use ($user, $sources, $periodType, $toYear, $toMonth) {
            $created = $this->create($user, $sources, $periodType, $toYear, $toMonth);

            // Stamp every source, including ones whose target already existed:
            // they have had their chance at this period and must not be retried.
            Budget::whereIn('id', $sources->pluck('id'))->update(['rolled_over_at' => now()]);

            return $created;
        });
    }

    /**
     * Write the target-period copies, skipping categories already budgeted there.
     *
     * @param  \Illuminate\Database\Eloquent\Collection<int, Budget>  $sources
     */
    private function create(User $user, $sources, string $periodType, int $toYear, ?int $toMonth): int
    {
        if ($sources->isEmpty()) {
            return 0;
        }

        // One budget per category per period (enforced by the budget_unique index),
        // so the existing categories are all we need to skip on.
        $taken = $this->budgetsFor($user, $periodType, $toYear, $toMonth)
            ->pluck('category_id')
            ->all();

        $created = 0;

        foreach ($sources as $source) {
            if (in_array($source->category_id, $taken, true)) {
                continue;
            }

            $user->budgets()->create([
                'category_id' => $source->category_id,
                // Accessor returns major units; the mutator converts back to cents.
                'amount' => $source->amount,
                'currency' => $source->currency,
                'period_type' => $periodType,
                'period_year' => $toYear,
                'period_month' => $toMonth,
                'is_active' => $source->is_active,
                'auto_rollover' => $source->auto_rollover,
            ]);

            $created++;
        }

        return $created;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder<Budget>
     */
    private function budgetsFor(User $user, string $periodType, int $year, ?int $month)
    {
        return $user->budgets()
            ->where('period_type', $periodType)
            ->where('period_year', $year)
            ->where('period_month', $month);
    }
}
