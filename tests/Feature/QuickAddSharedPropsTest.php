<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\User;

it('shares active accounts and categories for the quick-add fab on any authenticated page', function () {
    $user = User::factory()->create();
    Account::create(['user_id' => $user->id, 'name' => 'Checking', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);
    Account::create(['user_id' => $user->id, 'name' => 'Closed', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => false]);
    Category::create(['name' => 'Food', 'type' => 'expense', 'is_active' => true, 'user_id' => $user->id]);

    $this->actingAs($user)->get('/budgets')
        ->assertInertia(fn ($page) => $page
            ->has('quickAdd.accounts', 1)
            ->where('quickAdd.accounts.0.name', 'Checking')
            ->has('quickAdd.categories', 1)
        );
});

it('never shares another users accounts or categories', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    Account::create(['user_id' => $other->id, 'name' => 'Theirs', 'type' => 'checking', 'balance' => 0, 'currency' => 'USD', 'is_active' => true]);

    $this->actingAs($me)->get('/budgets')
        ->assertInertia(fn ($page) => $page->has('quickAdd.accounts', 0));
});

it('shares nothing for a guest', function () {
    $this->get('/')
        ->assertInertia(fn ($page) => $page->where('quickAdd', null));
});
