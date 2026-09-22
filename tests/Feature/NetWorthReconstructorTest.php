<?php

use App\Models\Account;
use App\Models\NetWorthSnapshot;
use App\Models\Transaction;
use App\Models\User;
use App\Services\NetWorthReconstructor;

function nwAccount(User $user, string $currency = 'USD', float $openingBalance = 0): Account
{
    // Mirrors AccountObserver's real opening-balance transaction so the
    // reconstructor replays the exact same history a real account produces.
    $account = Account::create([
        'user_id' => $user->id,
        'name' => 'Test',
        'type' => 'checking',
        'balance' => 0,
        'currency' => $currency,
        'is_active' => true,
    ]);

    if ($openingBalance != 0) {
        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'type' => 'opening',
            'amount' => $openingBalance,
            'currency' => $currency,
            'description' => 'Opening balance',
            'transaction_date' => now()->subDays(30),
        ]);
    }

    return $account->fresh();
}

it('reconstructs a flat history when there are no transactions after opening', function () {
    $user = User::factory()->create();
    nwAccount($user, 'USD', 100);

    $history = app(NetWorthReconstructor::class)->reconstruct($user, 10);

    // Every day back to the opening (30 days ago) is capped at 10 by $days,
    // so all 11 days (today + 10 back) should show the same flat balance.
    expect($history)->toHaveCount(11);
    foreach ($history as $day) {
        expect($day['USD'])->toBe(10000); // $100 in cents
    }
});

it('replays a later expense correctly at each historical point', function () {
    $user = User::factory()->create();
    $account = nwAccount($user, 'USD', 100);

    Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'type' => 'expense',
        'amount' => 30,
        'currency' => 'USD',
        'description' => 'Groceries',
        'transaction_date' => now()->subDays(5),
    ]);

    $history = app(NetWorthReconstructor::class)->reconstruct($user, 10);

    expect($history[now()->toDateString()]['USD'])->toBe(7000) // 100 - 30 = 70
        ->and($history[now()->subDays(6)->toDateString()]['USD'])->toBe(10000) // before the expense
        ->and($history[now()->subDays(5)->toDateString()]['USD'])->toBe(7000); // on/after the expense
});

it('stops a currencys history at its own earliest transaction, not a flat pad to $days', function () {
    $user = User::factory()->create();
    nwAccount($user, 'USD', 50); // opened 30 days ago (helper default)

    $history = app(NetWorthReconstructor::class)->reconstruct($user, 90);

    expect($history)->toHaveKey(now()->subDays(30)->toDateString())
        ->and($history)->not->toHaveKey(now()->subDays(31)->toDateString());
});

it('keeps each currency on its own independent timeline', function () {
    $user = User::factory()->create();
    nwAccount($user, 'USD', 100);
    $ngn = Account::create(['user_id' => $user->id, 'name' => 'Naira', 'type' => 'checking', 'balance' => 0, 'currency' => 'NGN', 'is_active' => true]);
    Transaction::create([
        'user_id' => $user->id,
        'account_id' => $ngn->id,
        'type' => 'opening',
        'amount' => 5000,
        'currency' => 'NGN',
        'description' => 'Opening',
        'transaction_date' => now()->subDays(2),
    ]);

    $history = app(NetWorthReconstructor::class)->reconstruct($user, 90);

    // Key order isn't guaranteed (depends on SQL grouping), so compare
    // content with toEqual rather than the order-sensitive toBe.
    expect($history[now()->toDateString()])->toEqual(['USD' => 10000, 'NGN' => 500000])
        ->and($history[now()->subDays(3)->toDateString()])->toEqual(['USD' => 10000]) // NGN not born yet
        ->and($history[now()->subDays(2)->toDateString()]['NGN'])->toBe(500000);
});

it('replays a transfer leg using its direction like the live observer does', function () {
    $user = User::factory()->create();
    $a = nwAccount($user, 'USD', 100);
    $b = nwAccount($user, 'USD', 0);

    // Manually create the transfer legs the way TransferController does.
    Transaction::create(['user_id' => $user->id, 'account_id' => $a->id, 'type' => 'transfer', 'transfer_direction' => 'out', 'amount' => 40, 'currency' => 'USD', 'description' => 'Transfer out', 'transaction_date' => now()->subDay()]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $b->id, 'type' => 'transfer', 'transfer_direction' => 'in', 'amount' => 40, 'currency' => 'USD', 'description' => 'Transfer in', 'transaction_date' => now()->subDay()]);

    $history = app(NetWorthReconstructor::class)->reconstruct($user, 10);

    // Transfers net to zero across accounts of the same currency, at every point.
    expect($history[now()->toDateString()]['USD'])->toBe(10000)
        ->and($history[now()->subDays(2)->toDateString()]['USD'])->toBe(10000);
});

it('includes deactivated accounts, since deactivating does not empty them', function () {
    $user = User::factory()->create();
    $account = nwAccount($user, 'USD', 250);
    $account->update(['is_active' => false]);

    $history = app(NetWorthReconstructor::class)->reconstruct($user, 5);

    expect($history[now()->toDateString()]['USD'])->toBe(25000);
});

it('backfill persists rows that a fresh reconstruct can read straight back', function () {
    $user = User::factory()->create();
    nwAccount($user, 'USD', 80);

    $written = app(NetWorthReconstructor::class)->backfill($user, 5);

    expect($written)->toBeGreaterThan(0)
        ->and(NetWorthSnapshot::where('user_id', $user->id)->count())->toBe($written);

    $today = NetWorthSnapshot::where('user_id', $user->id)->where('date', now()->toDateString())->first();
    expect($today->balance)->toEqual(80);
});

it('backfill is idempotent (upsert, not duplicate rows)', function () {
    $user = User::factory()->create();
    nwAccount($user, 'USD', 80);

    $reconstructor = app(NetWorthReconstructor::class);
    $reconstructor->backfill($user, 5);
    $countAfterFirst = NetWorthSnapshot::where('user_id', $user->id)->count();

    $reconstructor->backfill($user, 5);
    $countAfterSecond = NetWorthSnapshot::where('user_id', $user->id)->count();

    expect($countAfterSecond)->toBe($countAfterFirst);
});

it('snapshotToday only writes todays row per currency', function () {
    $user = User::factory()->create();
    nwAccount($user, 'USD', 80);

    $written = app(NetWorthReconstructor::class)->snapshotToday($user);

    expect($written)->toBe(1)
        ->and(NetWorthSnapshot::where('user_id', $user->id)->pluck('date')->map->toDateString()->all())
        ->toBe([now()->toDateString()]);
});

it('never mixes histories across users', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    nwAccount($other, 'USD', 999);

    $history = app(NetWorthReconstructor::class)->reconstruct($me, 5);

    expect($history)->toBe([]);
});
