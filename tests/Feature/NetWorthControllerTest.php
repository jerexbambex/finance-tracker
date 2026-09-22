<?php

use App\Models\Account;
use App\Models\ExchangeRate;
use App\Models\Transaction;
use App\Models\User;

it('lazily backfills on first visit so the trend is never empty', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'opening', 'amount' => 500, 'currency' => 'USD', 'description' => 'Opening', 'transaction_date' => now()->subDays(10)]);

    $this->actingAs($user)->get('/net-worth')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('net-worth/Index')
            ->where('currentTotal', 500)
            ->where('baseCurrency', 'USD')
            ->has('trend', 11)
        );

    expect($user->netWorthSnapshots()->count())->toBe(11);
});

it('does not re-backfill on a later visit', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'opening', 'amount' => 500, 'currency' => 'USD', 'description' => 'Opening', 'transaction_date' => now()]);

    $this->actingAs($user)->get('/net-worth');
    $countAfterFirst = $user->netWorthSnapshots()->count();

    $this->actingAs($user)->get('/net-worth');
    expect($user->netWorthSnapshots()->count())->toBe($countAfterFirst);
});

it('converts a multi-currency net worth to the users base currency', function () {
    ExchangeRate::create(['currency' => 'USD', 'rate_to_usd' => 1, 'source' => 'manual']);
    ExchangeRate::create(['currency' => 'EUR', 'rate_to_usd' => 1.10, 'source' => 'manual']);

    $user = User::factory()->create(['base_currency' => 'USD']);
    $usd = Account::create(['user_id' => $user->id, 'name' => 'USD', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    $eur = Account::create(['user_id' => $user->id, 'name' => 'EUR', 'type' => 'checking', 'balance' => 0, 'currency' => 'EUR', 'is_active' => true]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $usd->id, 'type' => 'opening', 'amount' => 100, 'currency' => 'USD', 'description' => 'Opening', 'transaction_date' => now()]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $eur->id, 'type' => 'opening', 'amount' => 50, 'currency' => 'EUR', 'description' => 'Opening', 'transaction_date' => now()]);

    $this->actingAs($user)->get('/net-worth')
        ->assertInertia(fn ($page) => $page
            ->where('currentTotal', 155) // 100 + 50 * 1.10
            ->where('excludedCurrencies', [])
        );
});

it('flags a currency with no exchange rate as excluded rather than dropping it silently', function () {
    $user = User::factory()->create(['base_currency' => 'USD']);
    $account = Account::create(['user_id' => $user->id, 'name' => 'NGN', 'type' => 'checking', 'balance' => 0, 'currency' => 'NGN', 'is_active' => true]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'opening', 'amount' => 5000, 'currency' => 'NGN', 'description' => 'Opening', 'transaction_date' => now()]);

    $this->actingAs($user)->get('/net-worth')
        ->assertInertia(fn ($page) => $page
            ->where('currentTotal', 0)
            ->where('excludedCurrencies', ['NGN'])
        );
});

it('never leaks one users net worth into anothers page', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $theirAccount = Account::create(['user_id' => $other->id, 'name' => 'Theirs', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    Transaction::create(['user_id' => $other->id, 'account_id' => $theirAccount->id, 'type' => 'opening', 'amount' => 99999, 'currency' => 'USD', 'description' => 'Opening', 'transaction_date' => now()]);

    $this->actingAs($me)->get('/net-worth')
        ->assertInertia(fn ($page) => $page->where('currentTotal', 0));
});
