<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

it('expands splits into per-category spend without double counting', function () {
    $user = User::factory()->create();
    $account = Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    $food = Category::create(['name' => 'Food', 'type' => 'expense', 'is_active' => true, 'user_id' => $user->id]);
    $home = Category::create(['name' => 'Home', 'type' => 'expense', 'is_active' => true, 'user_id' => $user->id]);

    // Direct expense in Food
    Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'category_id' => $food->id, 'type' => 'expense', 'amount' => 40, 'currency' => 'USD', 'description' => 'Lunch', 'transaction_date' => now()]);

    // Split transaction across Food + Home
    $split = Transaction::create(['user_id' => $user->id, 'account_id' => $account->id, 'category_id' => null, 'type' => 'expense', 'amount' => 100, 'currency' => 'USD', 'description' => 'Costco', 'transaction_date' => now()]);
    $split->splits()->create(['category_id' => $food->id, 'amount' => 70]);
    $split->splits()->create(['category_id' => $home->id, 'amount' => 30]);

    $rows = Transaction::spendByCategory($user->id, now()->subDay(), now()->addDay());

    $byName = $rows->keyBy('name');
    expect($byName['Food']->amount)->toEqual(110)  // 40 direct + 70 split
        ->and($byName['Home']->amount)->toEqual(30)
        ->and($rows->sum('amount'))->toEqual(140); // total matches parent totals, no double count
});

it('is scoped to the requesting user', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $myAcct = Account::create(['user_id' => $me->id, 'name' => 'Mine', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    $theirAcct = Account::create(['user_id' => $other->id, 'name' => 'Theirs', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    $cat = Category::create(['name' => 'Food', 'type' => 'expense', 'is_active' => true, 'user_id' => null]);

    Transaction::create(['user_id' => $me->id, 'account_id' => $myAcct->id, 'category_id' => $cat->id, 'type' => 'expense', 'amount' => 10, 'currency' => 'USD', 'description' => 'Mine', 'transaction_date' => now()]);
    Transaction::create(['user_id' => $other->id, 'account_id' => $theirAcct->id, 'category_id' => $cat->id, 'type' => 'expense', 'amount' => 999, 'currency' => 'USD', 'description' => 'Theirs', 'transaction_date' => now()]);

    $rows = Transaction::spendByCategory($me->id, now()->subDay(), now()->addDay());

    expect($rows->sum('amount'))->toEqual(10);
});
