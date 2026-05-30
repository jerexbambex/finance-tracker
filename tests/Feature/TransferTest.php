<?php

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;

function transferAccounts(User $user, float $from = 1000, float $to = 0, string $currency = 'USD'): array
{
    return [
        Account::factory()->create(['user_id' => $user->id, 'balance' => $from, 'currency' => $currency]),
        Account::factory()->create(['user_id' => $user->id, 'balance' => $to, 'currency' => $currency]),
    ];
}

function postTransfer($test, User $user, Account $from, Account $to, string $amount = '100.00')
{
    return $test->actingAs($user)->from('/transfers/create')->post('/transfers', [
        'from_account_id' => $from->id,
        'to_account_id' => $to->id,
        'amount' => $amount,
        'transfer_date' => now()->toDateString(),
    ]);
}

it('transfer creates two transactions with type=transfer', function () {
    $user = User::factory()->create();
    [$from, $to] = transferAccounts($user, 1000, 200);

    postTransfer($this, $user, $from, $to, '300.00');

    $transactions = Transaction::where('user_id', $user->id)->get();
    expect($transactions)->toHaveCount(2)
        ->and($transactions->every(fn ($t) => $t->type === 'transfer'))->toBeTrue();
});

it('transfer decrements source account and increments destination', function () {
    $user = User::factory()->create();
    [$from, $to] = transferAccounts($user, 1000, 500);

    postTransfer($this, $user, $from, $to, '400.00');

    expect($from->fresh()->balance)->toEqual(600)
        ->and($to->fresh()->balance)->toEqual(900);
});

it('blocks cross-currency transfers and leaves balances untouched', function () {
    $user = User::factory()->create();
    $usd = Account::factory()->create(['user_id' => $user->id, 'balance' => 1000, 'currency' => 'USD']);
    $ngn = Account::factory()->create(['user_id' => $user->id, 'balance' => 5000, 'currency' => 'NGN']);

    postTransfer($this, $user, $usd, $ngn)->assertSessionHasErrors('to_account_id');

    expect(Transaction::where('user_id', $user->id)->count())->toBe(0)
        ->and($usd->fresh()->balance)->toEqual(1000)
        ->and($ngn->fresh()->balance)->toEqual(5000);
});

it('same-currency transfer legs are stamped with the account currency', function () {
    $user = User::factory()->create();
    [$from, $to] = transferAccounts($user, 1000, 0, 'NGN');

    postTransfer($this, $user, $from, $to);

    expect(Transaction::where('user_id', $user->id)->where('currency', 'NGN')->count())->toBe(2);
});

it('deleting one transfer leg reverses both balances and removes both legs', function () {
    $user = User::factory()->create();
    [$from, $to] = transferAccounts($user, 1000, 0);

    postTransfer($this, $user, $from, $to, '300.00');
    expect($from->fresh()->balance)->toEqual(700)->and($to->fresh()->balance)->toEqual(300);

    $leg = Transaction::where('user_id', $user->id)->where('type', 'transfer')->first();
    $this->actingAs($user)->delete("/transactions/{$leg->id}");

    expect(Transaction::where('user_id', $user->id)->where('type', 'transfer')->count())->toBe(0)
        ->and($from->fresh()->balance)->toEqual(1000)
        ->and($to->fresh()->balance)->toEqual(0);
});

it('transfer transactions do not count as income or expense', function () {
    $user = User::factory()->create();
    [$from, $to] = transferAccounts($user, 500, 0);

    postTransfer($this, $user, $from, $to);

    expect(Transaction::where('user_id', $user->id)->where('type', 'income')->count())->toBe(0)
        ->and(Transaction::where('user_id', $user->id)->where('type', 'expense')->count())->toBe(0);
});
