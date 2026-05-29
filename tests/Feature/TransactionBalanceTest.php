<?php

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;

// Use direct model operations to test the observer in isolation

it('income transaction increases account balance', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 1000, 'currency' => 'USD', 'is_active' => true]);

    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'income', 'amount' => 500, 'currency' => 'USD', 'description' => 'Salary', 'transaction_date' => now()]);

    expect($account->fresh()->balance)->toEqual(1500);
});

it('expense transaction decreases account balance', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 1000, 'currency' => 'USD', 'is_active' => true]);

    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'expense', 'amount' => 200, 'currency' => 'USD', 'description' => 'Groceries', 'transaction_date' => now()]);

    expect($account->fresh()->balance)->toEqual(800);
});

it('updating transaction amount adjusts balance correctly', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);

    $transaction = Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'expense', 'amount' => 100, 'currency' => 'USD', 'description' => 'Dinner', 'transaction_date' => now()]);

    // Observer fired on create: balance = -100
    $transaction->update(['amount' => 60]);
    // Observer fired on update: reverses -100 (+100), applies -60. Balance = -60

    expect($account->fresh()->balance)->toEqual(-60);
});

it('updating transaction type reverses old effect and applies new', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);

    $transaction = Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'expense', 'amount' => 100, 'currency' => 'USD', 'description' => 'Test', 'transaction_date' => now()]);

    // Balance = -100 after expense
    $transaction->update(['type' => 'income']);
    // Observer reverses expense (-100→+100), applies income (+100). Net: -100 + 200 = +100.

    expect($account->fresh()->balance)->toEqual(100);
});

it('deleting a transaction reverses its balance effect', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 500, 'currency' => 'USD', 'is_active' => true]);

    $transaction = Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'expense', 'amount' => 150, 'currency' => 'USD', 'description' => 'Shoes', 'transaction_date' => now()]);

    // Balance = 350 after expense
    $transaction->delete();
    // Observer reverses expense: balance restored to 500

    expect($account->fresh()->balance)->toEqual(500);
});

it('transfer legs affect balance by their direction via the observer', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 1000, 'currency' => 'USD', 'is_active' => true]);

    // 'out' leg decrements
    $out = Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'transfer', 'transfer_direction' => 'out', 'amount' => 300, 'currency' => 'USD', 'description' => 'Transfer out', 'transaction_date' => now()]);
    expect($account->fresh()->balance)->toEqual(700);

    // 'in' leg increments
    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'transfer', 'transfer_direction' => 'in', 'amount' => 100, 'currency' => 'USD', 'description' => 'Transfer in', 'transaction_date' => now()]);
    expect($account->fresh()->balance)->toEqual(800);

    // deleting the out leg restores it
    $out->delete();
    expect($account->fresh()->balance)->toEqual(1100);
});
