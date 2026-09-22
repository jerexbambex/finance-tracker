<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\User;

function makeRecurringAccount(User $user): Account
{
    return Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
}

it('renders the edit page for a recurring transaction the user owns', function () {
    $user = User::factory()->create();
    $account = makeRecurringAccount($user);
    $recurring = $user->recurringTransactions()->create([
        'account_id' => $account->id,
        'type' => 'expense',
        'amount' => 9.99,
        'description' => 'Netflix',
        'frequency' => 'monthly',
        'next_due_date' => now()->addDay(),
        'is_active' => true,
    ]);

    $this->actingAs($user)->get("/recurring-transactions/{$recurring->id}/edit")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('recurring-transactions/Edit')
            ->where('recurringTransaction.id', $recurring->id)
        );
});

it('updates a recurring transaction', function () {
    $user = User::factory()->create();
    $account = makeRecurringAccount($user);
    $recurring = $user->recurringTransactions()->create([
        'account_id' => $account->id,
        'type' => 'expense',
        'amount' => 9.99,
        'description' => 'Netflix',
        'frequency' => 'monthly',
        'next_due_date' => now()->addDay(),
        'is_active' => true,
    ]);

    $this->actingAs($user)->put("/recurring-transactions/{$recurring->id}", [
        'account_id' => $account->id,
        'type' => 'expense',
        'amount' => '15.00',
        'description' => 'Netflix Premium',
        'frequency' => 'monthly',
        'next_due_date' => now()->addWeek()->toDateString(),
    ])->assertRedirect('/recurring-transactions');

    expect($recurring->fresh()->description)->toBe('Netflix Premium')
        ->and($recurring->fresh()->amount)->toEqual(15.0);
});

it('rejects editing another users recurring transaction', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $account = makeRecurringAccount($other);
    $theirs = $other->recurringTransactions()->create([
        'account_id' => $account->id,
        'type' => 'expense',
        'amount' => 9.99,
        'description' => 'Netflix',
        'frequency' => 'monthly',
        'next_due_date' => now()->addDay(),
        'is_active' => true,
    ]);

    $this->actingAs($me)->get("/recurring-transactions/{$theirs->id}/edit")->assertForbidden();
});
