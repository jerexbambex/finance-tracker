<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Goal;
use App\Models\Transaction;
use App\Models\User;

it('returns nothing for a query shorter than 2 characters', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->getJson('/search?q=a')
        ->assertOk()
        ->assertJson(['transactions' => [], 'accounts' => [], 'budgets' => [], 'goals' => [], 'categories' => []]);
});

it('matches transactions, accounts, and goals by name', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Chase Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'expense', 'amount' => 42, 'currency' => 'USD', 'description' => 'Costco groceries', 'transaction_date' => now()]);
    Goal::create(['user_id' => $user->id, 'name' => 'Costco membership fund', 'target_amount' => 100, 'currency' => 'USD']);

    $response = $this->actingAs($user)->getJson('/search?q=costco')->assertOk();

    $response->assertJsonCount(1, 'transactions')
        ->assertJsonPath('transactions.0.label', 'Costco groceries')
        ->assertJsonCount(1, 'goals')
        ->assertJsonPath('goals.0.label', 'Costco membership fund')
        ->assertJsonCount(0, 'accounts');
});

it('matches budgets by their categorys name', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Groceries', 'type' => 'expense', 'is_active' => true, 'user_id' => $user->id]);
    Budget::create(['user_id' => $user->id, 'category_id' => $category->id, 'amount' => 500, 'currency' => 'USD', 'period_type' => 'monthly', 'period_year' => now()->year, 'period_month' => now()->month]);

    $this->actingAs($user)->getJson('/search?q=grocer')
        ->assertOk()
        ->assertJsonCount(1, 'budgets')
        ->assertJsonPath('budgets.0.label', 'Groceries');
});

it('finds a global system category with no owner', function () {
    $user = User::factory()->create();
    Category::create(['name' => 'Utilities', 'type' => 'expense', 'is_active' => true, 'user_id' => null]);

    $this->actingAs($user)->getJson('/search?q=util')
        ->assertOk()
        ->assertJsonCount(1, 'categories');
});

it('never returns another users data', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $theirAccount = Account::create(['user_id' => $other->id, 'name' => 'Secret Vault', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    Transaction::create(['user_id' => $other->id, 'account_id' => $theirAccount->id, 'type' => 'expense', 'amount' => 1, 'currency' => 'USD', 'description' => 'Secret purchase', 'transaction_date' => now()]);
    Goal::create(['user_id' => $other->id, 'name' => 'Secret goal', 'target_amount' => 100, 'currency' => 'USD']);

    $response = $this->actingAs($me)->getJson('/search?q=secret')->assertOk();

    $response->assertJsonCount(0, 'transactions')
        ->assertJsonCount(0, 'accounts')
        ->assertJsonCount(0, 'goals');
});

it('treats a percent sign in the query as a literal character, not a wildcard', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'expense', 'amount' => 10, 'currency' => 'USD', 'description' => 'Normal purchase', 'transaction_date' => now()]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'expense', 'amount' => 10, 'currency' => 'USD', 'description' => '50% off sale', 'transaction_date' => now()]);

    $this->actingAs($user)->getJson('/search?q=50%25')
        ->assertOk()
        ->assertJsonCount(1, 'transactions')
        ->assertJsonPath('transactions.0.label', '50% off sale');
});

it('guests get a redirect, not search results', function () {
    $this->getJson('/search?q=hello')->assertUnauthorized();
});
