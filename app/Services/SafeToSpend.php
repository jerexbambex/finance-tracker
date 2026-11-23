<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;

/**
 * "How much can I spend before month end without missing a bill?"
 *
 *   spending money (checking + cash, main currency)
 *   − bills due by month end (unpaid reminders + recurring expenses
 *     from those accounts, including anything overdue)
 *   = safe to spend, and that spread over the days left.
 *
 * Deliberately conservative: expected income is ignored, and savings,
 * credit cards and investments are not treated as spendable. When a reminder
 * and a recurring expense look like the same bill (same amount, due within
 * three days) it is counted once.
 */
class SafeToSpend
{
    private const SPENDING_ACCOUNT_TYPES = ['checking', 'cash'];

    private const SAME_BILL_WINDOW_DAYS = 3;

    /** Guards against runaway loops on bad data (e.g. a daily bill years overdue). */
    private const MAX_OCCURRENCES = 62;

    /**
     * Null when the user has no spending account in their main currency.
     *
     * @return array<string, mixed>|null
     */
    public function for(User $user, ?Carbon $today = null): ?array
    {
        $today = ($today ?? now())->copy()->startOfDay();
        $periodEnd = $today->copy()->endOfMonth()->startOfDay();
        $currency = $user->base_currency ?: 'USD';

        $accounts = $user->accounts()
            ->where('is_active', true)
            ->where('currency', $currency)
            ->whereIn('type', self::SPENDING_ACCOUNT_TYPES)
            ->get(['id', 'balance']);

        if ($accounts->isEmpty()) {
            return null;
        }

        $balance = round((float) $accounts->sum('balance'), 2);
        $bills = [...$this->recurringBills($user, $accounts->pluck('id')->all(), $periodEnd)];
        $bills = [...$bills, ...$this->reminderBills($user, $periodEnd, $bills)];

        usort($bills, fn ($a, $b) => [$a['due_date'], $a['name']] <=> [$b['due_date'], $b['name']]);
        $bills = array_map(fn ($bill) => $bill + ['overdue' => $bill['due_date'] < $today->toDateString()], $bills);

        $billsTotal = round(array_sum(array_column($bills, 'amount')), 2);
        $available = round($balance - $billsTotal, 2);
        $daysLeft = (int) $today->diffInDays($periodEnd) + 1;

        return [
            'currency' => $currency,
            'balance' => $balance,
            'bills_total' => $billsTotal,
            'available' => $available,
            'per_day' => $available > 0 ? round($available / $daysLeft, 2) : 0.0,
            'days_left' => $daysLeft,
            'period_end' => $periodEnd->toDateString(),
            'bills' => $bills,
        ];
    }

    /**
     * Every occurrence of each active recurring expense up to the period end.
     *
     * @param  list<string>  $accountIds
     * @return list<array{name: string, amount: float, due_date: string}>
     */
    private function recurringBills(User $user, array $accountIds, Carbon $periodEnd): array
    {
        $bills = [];

        $recurring = $user->recurringTransactions()
            ->where('is_active', true)
            ->where('type', 'expense')
            ->whereIn('account_id', $accountIds)
            ->whereDate('next_due_date', '<=', $periodEnd)
            ->get();

        foreach ($recurring as $item) {
            $date = $item->next_due_date->copy()->startOfDay();
            for ($i = 0; $i < self::MAX_OCCURRENCES && $date->lte($periodEnd); $i++) {
                $bills[] = ['name' => $item->description, 'amount' => (float) $item->amount, 'due_date' => $date->toDateString()];
                $date = $this->advance($date, $item->frequency);
            }
        }

        return $bills;
    }

    /**
     * Unpaid reminders with an amount, skipping any that duplicate a recurring bill.
     *
     * @param  list<array{name: string, amount: float, due_date: string}>  $recurringBills
     * @return list<array{name: string, amount: float, due_date: string}>
     */
    private function reminderBills(User $user, Carbon $periodEnd, array $recurringBills): array
    {
        $bills = [];

        $reminders = $user->reminders()
            ->where('is_completed', false)
            ->whereNotNull('amount')
            ->whereDate('due_date', '<=', $periodEnd)
            ->get();

        foreach ($reminders as $reminder) {
            $amount = (float) $reminder->amount;
            $due = $reminder->due_date->copy()->startOfDay();

            $alreadyCounted = collect($recurringBills)->contains(
                fn ($bill) => abs($bill['amount'] - $amount) < 0.005
                    && abs(Carbon::parse($bill['due_date'])->diffInDays($due, false)) <= self::SAME_BILL_WINDOW_DAYS
            );

            if ($amount > 0 && ! $alreadyCounted) {
                $bills[] = ['name' => $reminder->title, 'amount' => $amount, 'due_date' => $due->toDateString()];
            }
        }

        return $bills;
    }

    /** Mirrors ProcessRecurringTransactions::calculateNextDueDate. */
    private function advance(Carbon $date, ?string $frequency): Carbon
    {
        return match ($frequency) {
            'daily' => $date->copy()->addDay(),
            'weekly' => $date->copy()->addWeek(),
            'biweekly' => $date->copy()->addWeeks(2),
            'quarterly' => $date->copy()->addMonths(3),
            'yearly' => $date->copy()->addYear(),
            default => $date->copy()->addMonth(),
        };
    }
}
