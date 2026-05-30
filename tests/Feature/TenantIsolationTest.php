<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\User;

it('rejects referencing another users account when creating a transaction', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $theirAccount = Account::create(['user_id' => $other->id, 'name' => 'Theirs', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);

    $this->actingAs($me)->from('/transactions/create')->post('/transactions', [
        'account_id' => $theirAccount->id,
        'type' => 'expense',
        'amount' => '10.00',
        'description' => 'IDOR attempt',
        'transaction_date' => now()->toDateString(),
    ])->assertSessionHasErrors('account_id');

    expect($me->transactions()->count())->toBe(0)
        ->and($theirAccount->fresh()->balance)->toEqual(0);
});

it('rejects referencing another users category when creating a transaction', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $myAccount = Account::create(['user_id' => $me->id, 'name' => 'Mine', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    $theirCategory = Category::create(['name' => 'Secret', 'type' => 'expense', 'is_active' => true, 'user_id' => $other->id]);

    $this->actingAs($me)->from('/transactions/create')->post('/transactions', [
        'account_id' => $myAccount->id,
        'category_id' => $theirCategory->id,
        'type' => 'expense',
        'amount' => '10.00',
        'description' => 'IDOR attempt',
        'transaction_date' => now()->toDateString(),
    ])->assertSessionHasErrors('category_id');
});

it('allows global (system) categories with null user_id', function () {
    $me = User::factory()->create();
    $myAccount = Account::create(['user_id' => $me->id, 'name' => 'Mine', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    $globalCategory = Category::create(['name' => 'Groceries', 'type' => 'expense', 'is_active' => true, 'user_id' => null]);

    $this->actingAs($me)->post('/transactions', [
        'account_id' => $myAccount->id,
        'category_id' => $globalCategory->id,
        'type' => 'expense',
        'amount' => '10.00',
        'description' => 'Valid',
        'transaction_date' => now()->toDateString(),
    ])->assertRedirect();

    expect($me->transactions()->count())->toBe(1);
});

it('rejects creating a transfer through the generic transaction endpoint', function () {
    $me = User::factory()->create();
    $myAccount = Account::create(['user_id' => $me->id, 'name' => 'Mine', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);

    $this->actingAs($me)->from('/transactions/create')->post('/transactions', [
        'account_id' => $myAccount->id,
        'type' => 'transfer',
        'amount' => '10.00',
        'description' => 'Sneaky transfer',
        'transaction_date' => now()->toDateString(),
    ])->assertSessionHasErrors('type');
});

it('rejects another users category in a recurring transaction', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $myAccount = Account::create(['user_id' => $me->id, 'name' => 'Mine', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    $theirAccount = Account::create(['user_id' => $other->id, 'name' => 'Theirs', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);

    $this->actingAs($me)->from('/recurring-transactions/create')->post('/recurring-transactions', [
        'account_id' => $theirAccount->id,
        'type' => 'expense',
        'amount' => '10.00',
        'description' => 'IDOR',
        'frequency' => 'monthly',
        'next_due_date' => now()->addMonth()->toDateString(),
    ])->assertSessionHasErrors('account_id');
});
