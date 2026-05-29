<?php

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;

it('transfer creates two transactions with type=transfer', function () {
    $user = User::factory()->create();
    $from = Account::create(['user_id' => $user->id, 'name' => 'From', 'type' => 'checking', 'balance' => 1000, 'currency' => 'USD', 'is_active' => true]);
    $to   = Account::create(['user_id' => $user->id, 'name' => 'To',   'type' => 'savings',  'balance' => 200,  'currency' => 'USD', 'is_active' => true]);

    $this->actingAs($user)->post('/transfers', [
        'from_account_id' => $from->id,
        'to_account_id'   => $to->id,
        'amount'          => '300.00',
        'transfer_date'   => now()->toDateString(),
    ]);

    $transactions = Transaction::where('user_id', $user->id)->get();

    expect($transactions)->toHaveCount(2)
        ->and($transactions->every(fn ($t) => $t->type === 'transfer'))->toBeTrue();
});

it('transfer decrements source account and increments destination', function () {
    $user = User::factory()->create();
    $from = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 1000, 'currency' => 'USD', 'is_active' => true]);
    $to   = Account::create(['user_id' => $user->id, 'name' => 'Savings',  'type' => 'savings',  'balance' => 500,  'currency' => 'USD', 'is_active' => true]);

    $this->actingAs($user)->post('/transfers', [
        'from_account_id' => $from->id,
        'to_account_id'   => $to->id,
        'amount'          => '400.00',
        'transfer_date'   => now()->toDateString(),
    ]);

    expect($from->fresh()->balance)->toEqual(600)
        ->and($to->fresh()->balance)->toEqual(900);
});

it('blocks cross-currency transfers and leaves balances untouched', function () {
    $user = User::factory()->create();
    $usd = Account::create(['user_id' => $user->id, 'name' => 'USD', 'type' => 'checking', 'balance' => 1000, 'currency' => 'USD', 'is_active' => true]);
    $ngn = Account::create(['user_id' => $user->id, 'name' => 'NGN', 'type' => 'savings',  'balance' => 5000, 'currency' => 'NGN', 'is_active' => true]);

    $this->actingAs($user)->from('/transfers/create')->post('/transfers', [
        'from_account_id' => $usd->id,
        'to_account_id'   => $ngn->id,
        'amount'          => '100.00',
        'transfer_date'   => now()->toDateString(),
    ])->assertSessionHasErrors('to_account_id');

    // No transactions created, balances unchanged
    expect(Transaction::where('user_id', $user->id)->count())->toBe(0)
        ->and($usd->fresh()->balance)->toEqual(1000)
        ->and($ngn->fresh()->balance)->toEqual(5000);
});

it('same-currency transfer legs are stamped with the account currency', function () {
    $user = User::factory()->create();
    $from = Account::create(['user_id' => $user->id, 'name' => 'A', 'type' => 'checking', 'balance' => 1000, 'currency' => 'NGN', 'is_active' => true]);
    $to   = Account::create(['user_id' => $user->id, 'name' => 'B', 'type' => 'savings',  'balance' => 0,    'currency' => 'NGN', 'is_active' => true]);

    $this->actingAs($user)->post('/transfers', [
        'from_account_id' => $from->id,
        'to_account_id'   => $to->id,
        'amount'          => '100.00',
        'transfer_date'   => now()->toDateString(),
    ]);

    expect(Transaction::where('user_id', $user->id)->where('currency', 'NGN')->count())->toBe(2);
});

it('deleting one transfer leg reverses both balances and removes both legs', function () {
    $user = User::factory()->create();
    $from = Account::create(['user_id' => $user->id, 'name' => 'A', 'type' => 'checking', 'balance' => 1000, 'currency' => 'USD', 'is_active' => true]);
    $to   = Account::create(['user_id' => $user->id, 'name' => 'B', 'type' => 'savings',  'balance' => 0,    'currency' => 'USD', 'is_active' => true]);

    $this->actingAs($user)->post('/transfers', [
        'from_account_id' => $from->id,
        'to_account_id'   => $to->id,
        'amount'          => '300.00',
        'transfer_date'   => now()->toDateString(),
    ]);

    expect($from->fresh()->balance)->toEqual(700)
        ->and($to->fresh()->balance)->toEqual(300);

    // Delete one leg via the transactions endpoint
    $leg = Transaction::where('user_id', $user->id)->where('type', 'transfer')->first();
    $this->actingAs($user)->delete("/transactions/{$leg->id}");

    // Both legs gone, both balances restored
    expect(Transaction::where('user_id', $user->id)->where('type', 'transfer')->count())->toBe(0)
        ->and($from->fresh()->balance)->toEqual(1000)
        ->and($to->fresh()->balance)->toEqual(0);
});

it('transfer transactions do not count as income or expense', function () {
    $user = User::factory()->create();
    $from = Account::create(['user_id' => $user->id, 'name' => 'A', 'type' => 'checking', 'balance' => 500, 'currency' => 'USD', 'is_active' => true]);
    $to   = Account::create(['user_id' => $user->id, 'name' => 'B', 'type' => 'savings',  'balance' => 0,   'currency' => 'USD', 'is_active' => true]);

    $this->actingAs($user)->post('/transfers', [
        'from_account_id' => $from->id,
        'to_account_id'   => $to->id,
        'amount'          => '100.00',
        'transfer_date'   => now()->toDateString(),
    ]);

    expect(Transaction::where('user_id', $user->id)->where('type', 'income')->count())->toBe(0)
        ->and(Transaction::where('user_id', $user->id)->where('type', 'expense')->count())->toBe(0);
});
