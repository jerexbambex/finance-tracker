<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Goal;
use App\Models\Transaction;
use App\Models\User;

/**
 * The Shield-generated policies were merged to allow "owner OR permission" so the
 * user-facing app keeps authorising by ownership. These tests lock that contract:
 * an owner can act on their own records, and a normal user cannot touch another
 * user's records (no Shield permission, not the owner).
 */
function ownedAccount(User $user): Account
{
    return Account::create([
        'user_id' => $user->id,
        'name' => 'Acct',
        'type' => 'checking',
        'balance' => 0,
        'currency' => 'USD',
        'is_active' => true,
    ]);
}

function ownedTransaction(User $user, Account $account): Transaction
{
    return Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'type' => 'expense',
        'amount' => '10.00',
        'currency' => 'USD',
        'description' => 'Test',
        'transaction_date' => now()->toDateString(),
    ]);
}

it('lets an owner delete their own transaction', function () {
    $me = User::factory()->create();
    $txn = ownedTransaction($me, ownedAccount($me));

    $this->actingAs($me)->delete("/transactions/{$txn->id}")->assertRedirect();

    expect(Transaction::whereKey($txn->id)->exists())->toBeFalse();
});

it('forbids deleting another users transaction', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $txn = ownedTransaction($other, ownedAccount($other));

    $this->actingAs($me)->delete("/transactions/{$txn->id}")->assertForbidden();

    expect(Transaction::whereKey($txn->id)->exists())->toBeTrue();
});

it('forbids updating another users account', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $account = ownedAccount($other);

    $this->actingAs($me)->put("/accounts/{$account->id}", [
        'name' => 'Hijacked',
        'type' => 'checking',
        'currency' => 'USD',
    ])->assertForbidden();

    expect($account->fresh()->name)->toBe('Acct');
});

it('forbids deleting another users budget', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $category = Category::create(['name' => 'Food', 'type' => 'expense', 'is_active' => true, 'user_id' => null]);
    $budget = Budget::create([
        'user_id' => $other->id,
        'category_id' => $category->id,
        'amount' => '100.00',
        'currency' => 'USD',
        'period_type' => 'monthly',
        'period_year' => now()->year,
        'period_month' => now()->month,
        'is_active' => true,
    ]);

    $this->actingAs($me)->delete("/budgets/{$budget->id}")->assertForbidden();

    expect(Budget::whereKey($budget->id)->exists())->toBeTrue();
});

it('forbids deleting another users goal', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $goal = Goal::create([
        'user_id' => $other->id,
        'name' => 'Theirs',
        'target_amount' => '1000.00',
        'current_amount' => '0.00',
        'is_active' => true,
        'is_completed' => false,
    ]);

    $this->actingAs($me)->delete("/goals/{$goal->id}")->assertForbidden();

    expect(Goal::whereKey($goal->id)->exists())->toBeTrue();
});
