<?php

use App\Models\Goal;
use App\Models\GoalContribution;
use App\Models\User;

it('current_amount starts at zero for a new goal', function () {
    $user = User::factory()->create();
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Emergency Fund', 'target_amount' => 1000, 'currency' => 'USD', 'is_active' => true, 'is_completed' => false]);

    expect($goal->current_amount)->toEqual(0);
});

it('current_amount reflects a single contribution', function () {
    $user = User::factory()->create();
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Vacation', 'target_amount' => 2000, 'currency' => 'USD', 'is_active' => true, 'is_completed' => false]);

    GoalContribution::create(['goal_id' => $goal->id, 'user_id' => $user->id, 'amount' => 300, 'contribution_date' => now()]);

    expect($goal->fresh()->current_amount)->toEqual(300);
});

it('current_amount sums multiple contributions', function () {
    $user = User::factory()->create();
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Car', 'target_amount' => 5000, 'currency' => 'USD', 'is_active' => true, 'is_completed' => false]);

    GoalContribution::create(['goal_id' => $goal->id, 'user_id' => $user->id, 'amount' => 100, 'contribution_date' => now()]);
    GoalContribution::create(['goal_id' => $goal->id, 'user_id' => $user->id, 'amount' => 250, 'contribution_date' => now()]);

    expect($goal->fresh()->current_amount)->toEqual(350);
});

it('current_amount decreases when a contribution is deleted', function () {
    $user = User::factory()->create();
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'House', 'target_amount' => 50000, 'currency' => 'USD', 'is_active' => true, 'is_completed' => false]);

    $c1 = GoalContribution::create(['goal_id' => $goal->id, 'user_id' => $user->id, 'amount' => 500, 'contribution_date' => now()]);
    $c2 = GoalContribution::create(['goal_id' => $goal->id, 'user_id' => $user->id, 'amount' => 200, 'contribution_date' => now()]);

    $c1->delete();

    expect($goal->fresh()->current_amount)->toEqual(200);
});

it('creating a goal with a starting amount records it as a contribution', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/goals', [
        'name' => 'Vacation',
        'target_amount' => '2000.00',
        'current_amount' => '500.00',
        'category' => 'Travel',
    ]);

    $goal = $user->goals()->first();

    expect($goal->contributions()->count())->toBe(1)
        ->and($goal->fresh()->current_amount)->toEqual(500);
});

it('editing a goal does not change its contribution-derived current_amount', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/goals', [
        'name' => 'Car', 'target_amount' => '5000.00', 'current_amount' => '1000.00',
    ]);
    $goal = $user->goals()->first();
    expect($goal->fresh()->current_amount)->toEqual(1000);

    // Try to tamper with current_amount via the update endpoint
    $this->actingAs($user)->put("/goals/{$goal->id}", [
        'name' => 'New Car',
        'target_amount' => '5000.00',
        'current_amount' => '9999.00', // should be ignored
    ]);

    $fresh = $goal->fresh();
    expect($fresh->name)->toBe('New Car')
        ->and($fresh->current_amount)->toEqual(1000);
});

it('lowering the target below progress marks the goal complete', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/goals', [
        'name' => 'Fund', 'target_amount' => '5000.00', 'current_amount' => '1000.00',
    ]);
    $goal = $user->goals()->first();
    expect($goal->fresh()->is_completed)->toBeFalse();

    $this->actingAs($user)->put("/goals/{$goal->id}", [
        'name' => 'Fund',
        'target_amount' => '800.00', // now below the 1000 already saved
    ]);

    expect($goal->fresh()->is_completed)->toBeTrue();
});

it('is_completed is set when contributions reach the target', function () {
    $user = User::factory()->create();
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Phone', 'target_amount' => 500, 'currency' => 'USD', 'is_active' => true, 'is_completed' => false]);

    GoalContribution::create(['goal_id' => $goal->id, 'user_id' => $user->id, 'amount' => 500, 'contribution_date' => now()]);

    expect($goal->fresh()->is_completed)->toBeTrue();
});
