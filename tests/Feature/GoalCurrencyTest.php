<?php

use App\Models\Goal;
use App\Models\User;

it('defaults an existing goal created without a currency to USD', function () {
    $user = User::factory()->create();
    // No 'currency' key at all — mirrors a row from before the column existed.
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Legacy', 'target_amount' => 1000]);

    expect($goal->fresh()->currency)->toBe('USD');
});

it('requires a currency when creating a goal', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->from('/goals')->post('/goals', [
        'name' => 'Vacation',
        'target_amount' => '2000.00',
    ])->assertSessionHasErrors('currency');
});

it('stores the chosen currency on create and returns it from the index', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/goals', [
        'name' => 'Naija Fund',
        'target_amount' => '500000.00',
        'currency' => 'NGN',
    ]);

    $goal = $user->goals()->first();
    expect($goal->currency)->toBe('NGN');

    $this->actingAs($user)->get('/goals')
        ->assertInertia(fn ($page) => $page->where('goals.0.currency', 'NGN'));
});

it('requires a currency when updating a goal', function () {
    $user = User::factory()->create();
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Fund', 'target_amount' => 1000, 'currency' => 'USD']);

    $this->actingAs($user)->from('/goals')->put("/goals/{$goal->id}", [
        'name' => 'Fund',
        'target_amount' => '1000.00',
    ])->assertSessionHasErrors('currency');

    expect($goal->fresh()->currency)->toBe('USD');
});

it('can change a goals currency on update', function () {
    $user = User::factory()->create();
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Fund', 'target_amount' => 1000, 'currency' => 'USD']);

    $this->actingAs($user)->put("/goals/{$goal->id}", [
        'name' => 'Fund',
        'target_amount' => '1000.00',
        'currency' => 'EUR',
    ]);

    expect($goal->fresh()->currency)->toBe('EUR');
});

it('the goals index and edit pages expose the currency options', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/goals')
        ->assertInertia(fn ($page) => $page->has('currencies'));

    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Fund', 'target_amount' => 1000, 'currency' => 'GBP']);

    $this->actingAs($user)->get("/goals/{$goal->id}/edit")
        ->assertInertia(fn ($page) => $page
            ->has('currencies')
            ->where('goal.currency', 'GBP')
        );
});
