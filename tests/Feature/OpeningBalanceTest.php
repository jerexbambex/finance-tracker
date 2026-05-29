<?php

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;

it('creating an account materializes an opening balance transaction', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/accounts', [
        'name' => 'Checking',
        'type' => 'checking',
        'balance' => '5000.00',
        'currency' => 'USD',
    ]);

    $account = $user->accounts()->first();
    $opening = Transaction::where('account_id', $account->id)->where('type', 'opening')->first();

    expect($opening)->not->toBeNull()
        ->and($opening->amount)->toEqual(5000)
        ->and($account->fresh()->balance)->toEqual(5000);
});

it('balance reconstructs from opening + income - expense', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/accounts', [
        'name' => 'Checking', 'type' => 'checking', 'balance' => '1000.00', 'currency' => 'USD',
    ]);
    $account = $user->accounts()->first();

    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'income', 'amount' => 300, 'currency' => 'USD', 'description' => 'Pay', 'transaction_date' => now()]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'expense', 'amount' => 120, 'currency' => 'USD', 'description' => 'Food', 'transaction_date' => now()]);

    // 1000 opening + 300 - 120 = 1180
    expect($account->fresh()->balance)->toEqual(1180);

    // And it reconstructs purely from the ledger
    $opening = (int) Transaction::where('account_id', $account->id)->where('type', 'opening')->sum('amount');
    $income = (int) Transaction::where('account_id', $account->id)->where('type', 'income')->sum('amount');
    $expense = (int) Transaction::where('account_id', $account->id)->where('type', 'expense')->sum('amount');
    expect(($opening + $income - $expense) / 100)->toEqual(1180.0);
});

it('opening balance is not counted as income', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/accounts', [
        'name' => 'Checking', 'type' => 'checking', 'balance' => '2000.00', 'currency' => 'USD',
    ]);
    $account = $user->accounts()->first();

    $incomeTotal = (int) Transaction::where('account_id', $account->id)->where('type', 'income')->sum('amount');

    expect($incomeTotal)->toBe(0);
});

it('zero opening balance creates no transaction', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/accounts', [
        'name' => 'Empty', 'type' => 'cash', 'balance' => '0', 'currency' => 'USD',
    ]);
    $account = $user->accounts()->first();

    expect(Transaction::where('account_id', $account->id)->count())->toBe(0)
        ->and($account->fresh()->balance)->toEqual(0);
});
