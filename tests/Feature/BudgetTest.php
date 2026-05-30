<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

it('getSpentAmount returns zero when no transactions exist', function () {
    $user = User::factory()->create();
    $category = Category::create(['name' => 'Food', 'type' => 'expense', 'is_active' => true, 'user_id' => $user->id]);

    $budget = Budget::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount' => 500,
        'currency' => 'USD',
        'period_type' => 'monthly',
        'period_year' => now()->year,
        'period_month' => now()->month,
    ]);

    expect($budget->getSpentAmount())->toEqual(0);
});

it('getSpentAmount sums only transactions matching the budget currency', function () {
    $user = User::factory()->create();
    $usdAccount = Account::create(['user_id' => $user->id, 'name' => 'USD', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    $ngnAccount = Account::create(['user_id' => $user->id, 'name' => 'NGN', 'type' => 'checking', 'balance' => 0, 'currency' => 'NGN', 'is_active' => true]);
    $category = Category::create(['name' => 'Food', 'type' => 'expense', 'is_active' => true, 'user_id' => $user->id]);

    $budget = Budget::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount' => 500,
        'currency' => 'USD',
        'period_type' => 'monthly',
        'period_year' => now()->year,
        'period_month' => now()->month,
    ]);

    // USD expenses — must count
    Transaction::create(['user_id' => $user->id, 'account_id' => $usdAccount->id, 'category_id' => $category->id, 'type' => 'expense', 'amount' => 80,   'currency' => 'USD', 'description' => 'A', 'transaction_date' => now()]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $usdAccount->id, 'category_id' => $category->id, 'type' => 'expense', 'amount' => 20,   'currency' => 'USD', 'description' => 'B', 'transaction_date' => now()]);
    // NGN expense — must NOT count against USD budget
    Transaction::create(['user_id' => $user->id, 'account_id' => $ngnAccount->id, 'category_id' => $category->id, 'type' => 'expense', 'amount' => 5000, 'currency' => 'NGN', 'description' => 'C', 'transaction_date' => now()]);

    expect($budget->getSpentAmount())->toEqual(100);
});

it('getSpentAmount excludes income transactions', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    $category = Category::create(['name' => 'Food', 'type' => 'expense', 'is_active' => true, 'user_id' => $user->id]);

    $budget = Budget::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount' => 500,
        'currency' => 'USD',
        'period_type' => 'monthly',
        'period_year' => now()->year,
        'period_month' => now()->month,
    ]);

    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $category->id, 'type' => 'expense', 'amount' => 50,  'currency' => 'USD', 'description' => 'Lunch',  'transaction_date' => now()]);
    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $category->id, 'type' => 'income', 'amount' => 200, 'currency' => 'USD', 'description' => 'Refund', 'transaction_date' => now()]);

    expect($budget->getSpentAmount())->toEqual(50);
});

it('getSpentAmount counts split portions and avoids double counting', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    $food = Category::create(['name' => 'Food', 'type' => 'expense', 'is_active' => true, 'user_id' => $user->id]);
    $home = Category::create(['name' => 'Home', 'type' => 'expense', 'is_active' => true, 'user_id' => $user->id]);

    $budget = Budget::create([
        'user_id' => $user->id, 'category_id' => $food->id, 'amount' => 500, 'currency' => 'USD',
        'period_type' => 'monthly', 'period_year' => now()->year, 'period_month' => now()->month,
    ]);

    // Direct non-split expense in Food
    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $food->id, 'type' => 'expense', 'amount' => 40, 'currency' => 'USD', 'description' => 'Lunch', 'transaction_date' => now()]);

    // A split transaction (no own category) split across Food + Home
    $split = Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'category_id' => null, 'type' => 'expense', 'amount' => 100, 'currency' => 'USD', 'description' => 'Costco', 'transaction_date' => now()]);
    $split->splits()->create(['category_id' => $food->id, 'amount' => 70, 'description' => 'groceries']);
    $split->splits()->create(['category_id' => $home->id, 'amount' => 30, 'description' => 'supplies']);

    // Food spend = 40 direct + 70 split = 110 (NOT 140, the parent total isn't double counted)
    expect($budget->getSpentAmount())->toEqual(110);
});

it('getPercentageUsed uses dollar amounts not raw cents', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    $category = Category::create(['name' => 'Food', 'type' => 'expense', 'is_active' => true, 'user_id' => $user->id]);

    $budget = Budget::create([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount' => 100,
        'currency' => 'USD',
        'period_type' => 'monthly',
        'period_year' => now()->year,
        'period_month' => now()->month,
    ]);

    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $category->id, 'type' => 'expense', 'amount' => 80, 'currency' => 'USD', 'description' => 'Groceries', 'transaction_date' => now()]);

    // Must be 80%, not 8000%
    expect($budget->getPercentageUsed())->toEqual(80);
});
