<?php

use App\Models\Goal;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get(route('dashboard'))->assertOk();
});

test('the dashboard exposes each goals own currency', function () {
    $user = User::factory()->create();
    Goal::create(['user_id' => $user->id, 'name' => 'USD Fund', 'target_amount' => 1000, 'currency' => 'USD', 'is_active' => true]);
    Goal::create(['user_id' => $user->id, 'name' => 'NGN Fund', 'target_amount' => 500000, 'currency' => 'NGN', 'is_active' => true]);

    $this->actingAs($user)->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('goals', 2)
            ->where('goals.0.currency', 'USD')
            ->where('goals.1.currency', 'NGN')
        );
});
