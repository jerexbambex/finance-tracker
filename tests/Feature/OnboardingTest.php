<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Goal;
use App\Models\Transaction;
use App\Models\User;

test('a new user sees the checklist with nothing done', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('onboarding.completed', 0)
            ->where('onboarding.total', 5)
            ->has('onboarding.steps', 5)
        );
});

test('steps complete from the user\'s own data, and opening balances do not count as spending', function () {
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);
    Transaction::factory()->create(['user_id' => $user->id, 'account_id' => $account->id, 'type' => 'opening', 'amount' => 100]);

    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('onboarding.completed', 1)
            ->where('onboarding.steps.1.id', 'account')
            ->where('onboarding.steps.1.done', true)
            ->where('onboarding.steps.2.id', 'transaction')
            ->where('onboarding.steps.2.done', false)
        );
});

test('confirming a currency saves it and ticks the step', function () {
    $user = User::factory()->create(['base_currency' => 'USD']);

    $this->actingAs($user)->post(route('onboarding.currency'), ['base_currency' => 'NGN'])->assertRedirect();

    $user->refresh();
    expect($user->base_currency)->toBe('NGN')
        ->and($user->onboarding['currency_confirmed_at'])->not->toBeNull();

    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->where('onboarding.steps.0.done', true));
});

test('an unknown currency is rejected', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('onboarding.currency'), ['base_currency' => 'XYZ'])
        ->assertSessionHasErrors('base_currency');
});

test('saving a currency in profile settings also ticks the step', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->patch(route('profile.update'), [
        'name' => $user->name,
        'email' => $user->email,
        'base_currency' => 'GBP',
    ]);

    expect($user->fresh()->onboarding['currency_confirmed_at'] ?? null)->not->toBeNull();
});

test('dismissing hides the checklist for good', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post(route('onboarding.dismiss'))->assertRedirect();

    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->where('onboarding', null));
});

test('the checklist disappears once every step is done', function () {
    $user = User::factory()->create(['onboarding' => ['currency_confirmed_at' => now()->toIso8601String()]]);
    $account = Account::factory()->create(['user_id' => $user->id]);
    $category = Category::factory()->create(['user_id' => $user->id]);
    Transaction::factory()->create(['user_id' => $user->id, 'account_id' => $account->id]);
    Budget::create([
        'user_id' => $user->id, 'category_id' => $category->id, 'amount' => 100,
        'currency' => 'USD', 'period_type' => 'monthly', 'period_year' => 2026, 'period_month' => 11,
    ]);
    Goal::create(['user_id' => $user->id, 'name' => 'Trip', 'target_amount' => 1000, 'currency' => 'USD', 'is_active' => true]);

    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page->where('onboarding', null));
});

test('new accounts default to the user\'s main currency', function () {
    $user = User::factory()->create(['base_currency' => 'NGN']);

    $this->actingAs($user)->get(route('accounts.create'))
        ->assertInertia(fn ($page) => $page->where('defaultCurrency', 'NGN'));
});
