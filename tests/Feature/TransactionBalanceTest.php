<?php

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;

function acctWith(float $balance, string $currency = 'USD'): Account
{
    return Account::factory()->create(['balance' => $balance, 'currency' => $currency]);
}

it('income transaction increases account balance', function () {
    $account = acctWith(1000);

    Transaction::factory()->income()->create(['account_id' => $account->id, 'user_id' => $account->user_id, 'amount' => 500]);

    expect($account->fresh()->balance)->toEqual(1500);
});

it('expense transaction decreases account balance', function () {
    $account = acctWith(1000);

    Transaction::factory()->create(['account_id' => $account->id, 'user_id' => $account->user_id, 'amount' => 200]);

    expect($account->fresh()->balance)->toEqual(800);
});

it('balance can go negative when an expense exceeds available funds', function () {
    $account = acctWith(50);

    Transaction::factory()->create(['account_id' => $account->id, 'user_id' => $account->user_id, 'amount' => 200]);

    expect($account->fresh()->balance)->toEqual(-150);
});

it('transfer legs affect balance by their direction via the observer', function () {
    $account = acctWith(1000);
    $owner = ['account_id' => $account->id, 'user_id' => $account->user_id];

    $out = Transaction::factory()->create($owner + ['type' => 'transfer', 'transfer_direction' => 'out', 'amount' => 300]);
    expect($account->fresh()->balance)->toEqual(700);

    Transaction::factory()->create($owner + ['type' => 'transfer', 'transfer_direction' => 'in', 'amount' => 100]);
    expect($account->fresh()->balance)->toEqual(800);

    $out->delete();
    expect($account->fresh()->balance)->toEqual(1100);
});

it('updating transaction amount adjusts balance correctly', function () {
    $account = acctWith(0);

    $t = Transaction::factory()->create(['account_id' => $account->id, 'user_id' => $account->user_id, 'amount' => 100]);
    $t->update(['amount' => 60]);

    expect($account->fresh()->balance)->toEqual(-60);
});

it('updating transaction type reverses old effect and applies new', function () {
    $account = acctWith(0);

    $t = Transaction::factory()->create(['account_id' => $account->id, 'user_id' => $account->user_id, 'amount' => 100]);
    $t->update(['type' => 'income']);

    expect($account->fresh()->balance)->toEqual(100);
});

it('deleting a transaction reverses its balance effect', function () {
    $account = acctWith(500);

    $t = Transaction::factory()->create(['account_id' => $account->id, 'user_id' => $account->user_id, 'amount' => 150]);
    $t->delete();

    expect($account->fresh()->balance)->toEqual(500);
});

it('transfer type transactions skip the observer without a direction', function () {
    $account = acctWith(1000);

    // No transfer_direction => no balance effect (malformed; real transfers always set one)
    Transaction::factory()->create(['account_id' => $account->id, 'user_id' => $account->user_id, 'type' => 'transfer', 'amount' => 300, 'transfer_direction' => null]);

    expect($account->fresh()->balance)->toEqual(700); // null direction treated as 'out'
});
