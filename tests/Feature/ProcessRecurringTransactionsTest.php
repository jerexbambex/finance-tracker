<?php

use App\Console\Commands\ProcessRecurringTransactions;
use App\Models\Account;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;

it('creates a transaction for each due recurring transaction', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'NGN Account', 'type' => 'checking', 'balance' => 0, 'currency' => 'NGN', 'is_active' => true]);

    RecurringTransaction::create([
        'user_id'       => $user->id,
        'account_id'    => $account->id,
        'type'          => 'expense',
        'amount'        => 50,
        'description'   => 'Rent',
        'frequency'     => 'monthly',
        'next_due_date' => now()->subDay(),
        'is_active'     => true,
    ]);

    $this->artisan('transactions:process-recurring')->assertExitCode(0);

    expect(Transaction::where('user_id', $user->id)->count())->toBe(1);
});

it('created transaction inherits currency from the account', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'NGN Account', 'type' => 'checking', 'balance' => 0, 'currency' => 'NGN', 'is_active' => true]);

    RecurringTransaction::create([
        'user_id'       => $user->id,
        'account_id'    => $account->id,
        'type'          => 'expense',
        'amount'        => 100,
        'description'   => 'Subscription',
        'frequency'     => 'monthly',
        'next_due_date' => now()->subDay(),
        'is_active'     => true,
    ]);

    $this->artisan('transactions:process-recurring');

    $transaction = Transaction::where('user_id', $user->id)->first();

    expect($transaction->currency)->toBe('NGN');
});

it('advances next_due_date after processing', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    $dueDate = now()->subDay()->startOfDay();

    $recurring = RecurringTransaction::create([
        'user_id'       => $user->id,
        'account_id'    => $account->id,
        'type'          => 'expense',
        'amount'        => 50,
        'description'   => 'Netflix',
        'frequency'     => 'monthly',
        'next_due_date' => $dueDate,
        'is_active'     => true,
    ]);

    $this->artisan('transactions:process-recurring');

    expect($recurring->fresh()->next_due_date->gt($dueDate))->toBeTrue();
});

it('skips inactive recurring transactions', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);

    RecurringTransaction::create([
        'user_id'       => $user->id,
        'account_id'    => $account->id,
        'type'          => 'expense',
        'amount'        => 50,
        'description'   => 'Old sub',
        'frequency'     => 'monthly',
        'next_due_date' => now()->subDay(),
        'is_active'     => false,
    ]);

    $this->artisan('transactions:process-recurring');

    expect(Transaction::where('user_id', $user->id)->count())->toBe(0);
});
