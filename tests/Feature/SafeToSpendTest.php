<?php

use App\Models\Account;
use App\Models\RecurringTransaction;
use App\Models\Reminder;
use App\Models\User;
use App\Services\SafeToSpend;

beforeEach(function () {
    $this->travelTo('2026-11-20 09:00:00'); // 11 days left including today
    $this->user = User::factory()->create(['base_currency' => 'NGN']);
});

function spendAccount(User $user, array $attrs = []): Account
{
    return Account::factory()->create($attrs + ['user_id' => $user->id, 'currency' => 'NGN', 'type' => 'checking']);
}

function recurringBill(Account $account, float $amount, string $due, string $frequency = 'monthly', string $type = 'expense'): void
{
    RecurringTransaction::create([
        'user_id' => $account->user_id, 'account_id' => $account->id, 'type' => $type,
        'amount' => $amount, 'description' => 'Bill', 'frequency' => $frequency,
        'next_due_date' => $due, 'is_active' => true,
    ]);
}

function reminderBill(User $user, float $amount, string $due, bool $completed = false): void
{
    Reminder::create([
        'user_id' => $user->id, 'title' => 'Reminder', 'amount' => $amount,
        'due_date' => $due, 'is_completed' => $completed,
    ]);
}

test('nothing to show without a spending account in the main currency', function () {
    spendAccount($this->user, ['type' => 'savings', 'balance' => 1000]);
    spendAccount($this->user, ['currency' => 'USD', 'balance' => 1000]);

    expect((new SafeToSpend)->for($this->user))->toBeNull();
});

test('subtracts bills due by month end from checking and cash, spread over the days left', function () {
    $checking = spendAccount($this->user, ['balance' => 100000]);
    spendAccount($this->user, ['type' => 'cash', 'balance' => 10000]);
    spendAccount($this->user, ['type' => 'savings', 'balance' => 999999]); // not spendable

    recurringBill($checking, 20000, '2026-11-25');        // counted
    recurringBill($checking, 5000, '2026-12-01');         // next month: not counted
    reminderBill($this->user, 1000, '2026-11-28');        // counted
    reminderBill($this->user, 700, '2026-11-15');         // overdue and unpaid: counted
    reminderBill($this->user, 300, '2026-11-22', true);   // already paid: not counted

    $result = (new SafeToSpend)->for($this->user);

    expect($result['balance'])->toEqual(110000)
        ->and($result['bills_total'])->toEqual(21700)
        ->and($result['available'])->toEqual(88300)
        ->and($result['days_left'])->toBe(11)
        ->and($result['per_day'])->toEqual(round(88300 / 11, 2))
        ->and(collect($result['bills'])->firstWhere('due_date', '2026-11-15')['overdue'])->toBeTrue();
});

test('counts every occurrence of a frequent bill before month end', function () {
    $checking = spendAccount($this->user, ['balance' => 10000]);
    recurringBill($checking, 100, '2026-11-21', 'weekly'); // 21st and 28th

    expect((new SafeToSpend)->for($this->user)['bills_total'])->toEqual(200);
});

test('ignores recurring income and bills paid from other accounts', function () {
    $checking = spendAccount($this->user, ['balance' => 10000]);
    $card = spendAccount($this->user, ['type' => 'credit_card']);
    recurringBill($checking, 5000, '2026-11-25', 'monthly', 'income');
    recurringBill($card, 3000, '2026-11-25');

    expect((new SafeToSpend)->for($this->user)['bills_total'])->toEqual(0);
});

test('a reminder for the same bill as a recurring expense is counted once', function () {
    $checking = spendAccount($this->user, ['balance' => 10000]);
    recurringBill($checking, 2500, '2026-11-25');
    reminderBill($this->user, 2500, '2026-11-24'); // same bill, a day apart
    reminderBill($this->user, 2500, '2026-11-01'); // same amount but weeks earlier: a different bill

    expect((new SafeToSpend)->for($this->user)['bills_total'])->toEqual(5000);
});

test('per-day is zero, not negative, when bills exceed the balance', function () {
    $checking = spendAccount($this->user, ['balance' => 1000]);
    recurringBill($checking, 4000, '2026-11-25');

    $result = (new SafeToSpend)->for($this->user);

    expect($result['available'])->toEqual(-3000)->and($result['per_day'])->toEqual(0);
});

test('the dashboard exposes it', function () {
    spendAccount($this->user, ['balance' => 500]);

    $this->actingAs($this->user)->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->where('safeToSpend.available', 500)->where('safeToSpend.currency', 'NGN'));
});
