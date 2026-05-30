<?php

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

it('rolls back the balance update when the surrounding transaction fails', function () {
    $user = User::factory()->create();
    $account = Account::create([
        'user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking',
        'balance' => 1000, 'currency' => 'USD', 'is_active' => true,
    ]);

    // Simulate a controller write that creates a transaction (observer adjusts
    // balance) and then fails before commit — both must roll back together.
    try {
        DB::transaction(function () use ($user, $account) {
            Transaction::create([
                'user_id' => $user->id,
                'account_id' => $account->id,
                'type' => 'expense',
                'amount' => 200,
                'currency' => 'USD',
                'description' => 'Will roll back',
                'transaction_date' => now(),
            ]);

            throw new RuntimeException('boom');
        });
    } catch (RuntimeException) {
        // expected
    }

    // Neither the transaction row nor the balance change persisted
    expect(Transaction::where('user_id', $user->id)->count())->toBe(0)
        ->and($account->fresh()->balance)->toEqual(1000);
});
