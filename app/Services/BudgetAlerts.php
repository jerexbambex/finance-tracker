<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\User;
use App\Notifications\BudgetExceededNotification;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * Budget notifications that warn early and only once.
 *
 * Levels, in order: on pace to overspend → 80% used → over budget. Each is
 * sent at most once per budget period; the highest level sent is stored on
 * the budget (budgets.alert_level). If spending later drops (an edit or a
 * delete), the stored level drops with it so crossing again re-alerts —
 * except that it never drops below "pace", so the pace warning can't flicker
 * on and off as the month goes by.
 */
class BudgetAlerts
{
    public const NONE = 0;

    public const PACE = 1;

    public const WARNING = 2;

    public const EXCEEDED = 3;

    private const WARNING_PERCENT = 80;

    /** Projected spend at or above this share of the budget triggers the pace alert. */
    private const PACE_PROJECTION = 1.10;

    /** Too early in the period to project, or too little spent to be worth a nudge. */
    private const PACE_MIN_ELAPSED = 0.20;

    private const PACE_MIN_SPENT = 0.50;

    /**
     * Check every budget covering this category on this date.
     */
    public function checkCategory(User $user, ?string $categoryId, CarbonInterface|string $date): void
    {
        if (! $categoryId) {
            return;
        }

        $date = Carbon::parse($date);

        Budget::where('user_id', $user->id)
            ->where('category_id', $categoryId)
            ->where('period_year', $date->year)
            ->where(fn ($q) => $q->where('period_type', 'yearly')
                ->orWhere(fn ($q2) => $q2->where('period_type', 'monthly')->where('period_month', $date->month)))
            ->with('category')
            ->get()
            ->each(fn (Budget $budget) => $this->check($user, $budget));
    }

    /**
     * Check many (category, date) pairs at once, e.g. after an import,
     * evaluating each budget only once however many rows touched it.
     *
     * @param  iterable<array{0: ?string, 1: CarbonInterface|string}>  $pairs
     */
    public function checkMany(User $user, iterable $pairs): void
    {
        $seen = [];
        foreach ($pairs as [$categoryId, $date]) {
            $key = $categoryId.'|'.Carbon::parse($date)->format('Y-m');
            if ($categoryId && ! isset($seen[$key])) {
                $seen[$key] = true;
                $this->checkCategory($user, $categoryId, $date);
            }
        }
    }

    public function check(User $user, Budget $budget, ?CarbonInterface $now = null): void
    {
        if ($budget->amount <= 0) {
            return;
        }

        $spent = (float) $budget->getSpentAmount();
        $percentage = $spent / $budget->amount * 100;
        $projected = $this->projectedSpend($budget, $spent, $now ?? now());

        $level = match (true) {
            $percentage >= 100 => self::EXCEEDED,
            $percentage >= self::WARNING_PERCENT => self::WARNING,
            $projected !== null && $projected >= $budget->amount * self::PACE_PROJECTION => self::PACE,
            default => self::NONE,
        };

        $stored = (int) $budget->alert_level;

        if ($level > $stored) {
            $user->notify(new BudgetExceededNotification($budget, $spent, $percentage, $level, $projected));
            $budget->forceFill(['alert_level' => $level])->save();
        } elseif ($level < $stored) {
            $floor = max($level, min($stored, self::PACE));
            if ($floor !== $stored) {
                $budget->forceFill(['alert_level' => $floor])->save();
            }
        }
    }

    /**
     * Straight-line projection of spend to the end of the budget's period, or
     * null when it's too early (or the period isn't current) to project.
     */
    public function projectedSpend(Budget $budget, float $spent, CarbonInterface $now): ?float
    {
        $isMonthly = $budget->period_type === 'monthly' && $budget->period_month;
        $start = Carbon::create($budget->period_year, $isMonthly ? $budget->period_month : 1, 1)->startOfDay();
        $end = $isMonthly ? $start->copy()->endOfMonth() : $start->copy()->endOfYear();

        if ($now->lt($start) || $now->gt($end)) {
            return null;
        }

        $elapsed = ($start->diffInSeconds($now) + 1) / ($start->diffInSeconds($end) + 1);

        if ($elapsed < self::PACE_MIN_ELAPSED || $spent < $budget->amount * self::PACE_MIN_SPENT) {
            return null;
        }

        return round($spent / $elapsed, 2);
    }
}
