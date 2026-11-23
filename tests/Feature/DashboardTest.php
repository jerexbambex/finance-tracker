<?php

use App\Models\Account;
use App\Models\Goal;
use App\Models\Transaction;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get(route('dashboard'))->assertOk();
});

test('the dashboard exposes each goals own currency', function () {
    $user = User::factory()->create();
    Goal::create(['user_id' => $user->id, 'name' => 'USD Fund', 'target_amount' => 1000, 'currency' => 'USD', 'is_active' => true]);
    Goal::create(['user_id' => $user->id, 'name' => 'NGN Fund', 'target_amount' => 500000, 'currency' => 'NGN', 'is_active' => true]);

    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('goals', 2)
            ->where('goals.0.currency', 'USD')
            ->where('goals.1.currency', 'NGN')
        );
});

function dashboardTxn(Account $account, string $type, float $amount, string $date): void
{
    Transaction::factory()->create([
        'account_id' => $account->id,
        'user_id' => $account->user_id,
        'type' => $type,
        'amount' => $amount,
        'transaction_date' => $date,
    ]);
}

test('dashboard totals default to this month and compare against the same days last month', function () {
    $this->travelTo('2026-11-15 12:00:00');
    $account = Account::factory()->create(['currency' => 'USD']);

    dashboardTxn($account, 'expense', 100, '2026-11-10');
    dashboardTxn($account, 'expense', 80, '2026-10-10');  // same window last month
    dashboardTxn($account, 'expense', 999, '2026-10-20'); // after day 15 — excluded from comparison
    dashboardTxn($account, 'income', 500, '2026-11-01');

    $this->actingAs($account->user)->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('range', 'this-month')
            ->where('expensesByCurrency.USD', 100)
            ->where('previousExpensesByCurrency.USD', 80)
            ->where('incomeByCurrency.USD', 500)
            ->where('previousIncomeByCurrency', [])
        );
});

test('dashboard range switches the period used for income and expense totals', function () {
    $this->travelTo('2026-11-15 12:00:00');
    $account = Account::factory()->create(['currency' => 'USD']);

    dashboardTxn($account, 'expense', 100, '2026-11-10');
    dashboardTxn($account, 'expense', 40, '2026-10-20');  // inside last 30 days, outside this month
    dashboardTxn($account, 'expense', 25, '2026-07-01');  // inside 6 months only

    $this->actingAs($account->user)->get(route('dashboard', ['range' => 'last-30']))
        ->assertInertia(fn ($page) => $page
            ->where('range', 'last-30')
            ->where('expensesByCurrency.USD', 140)
        );

    $this->actingAs($account->user)->get(route('dashboard', ['range' => '6-months']))
        ->assertInertia(fn ($page) => $page
            ->where('range', '6-months')
            ->where('expensesByCurrency.USD', 165)
        );
});

test('an unknown dashboard range falls back to this month', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('dashboard', ['range' => 'forever']))
        ->assertInertia(fn ($page) => $page->where('range', 'this-month'));
});
