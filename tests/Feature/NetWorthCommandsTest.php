<?php

use App\Models\Account;
use App\Models\NetWorthSnapshot;
use App\Models\Transaction;
use App\Models\User;

it('networth:snapshot writes todays row for every user with an account', function () {
    $withAccount = User::factory()->create();
    $withoutAccount = User::factory()->create();

    $account = Account::create(['user_id' => $withAccount->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    Transaction::create(['user_id' => $withAccount->id, 'account_id' => $account->id, 'type' => 'opening', 'amount' => 120, 'currency' => 'USD', 'description' => 'Opening', 'transaction_date' => now()]);

    $this->artisan('networth:snapshot')
        ->expectsOutputToContain('Snapshotted 1 currency balance across 1 users.')
        ->assertSuccessful();

    expect(NetWorthSnapshot::where('user_id', $withAccount->id)->count())->toBe(1)
        ->and(NetWorthSnapshot::where('user_id', $withoutAccount->id)->count())->toBe(0);
});

it('networth:backfill reconstructs history for every user with an account', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'opening', 'amount' => 200, 'currency' => 'USD', 'description' => 'Opening', 'transaction_date' => now()->subDays(10)]);

    $this->artisan('networth:backfill', ['--days' => 30])->assertSuccessful();

    expect(NetWorthSnapshot::where('user_id', $user->id)->count())->toBe(11); // today back through the opening date
});
