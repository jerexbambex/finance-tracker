<?php

use App\Models\Goal;
use App\Models\GoalContribution;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('creates a savings goal', function () {
    Sanctum::actingAs(User::factory()->create());

    $response = $this->postJson('/api/v1/savings-goals', [
        'name' => 'Emergency Fund',
        'targetAmount' => 1500,
        'deadline' => now()->addMonths(6)->toDateString(),
    ])->assertStatus(201)
        ->assertJsonPath('data.name', 'Emergency Fund')
        ->assertJsonPath('data.isCompleted', false);

    expect((float) $response->json('data.targetAmount'))->toBe(1500.0);
    expect((float) $response->json('data.savedAmount'))->toBe(0.0);
    expect(Goal::find($response->json('data.id')))->not->toBeNull();
});

it('lists only the authenticated user\'s goals', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    Goal::create(['user_id' => $owner->id, 'name' => 'Mine', 'target_amount' => 100, 'current_amount' => 0, 'is_active' => true, 'is_completed' => false]);
    Goal::create(['user_id' => $other->id, 'name' => 'Theirs', 'target_amount' => 100, 'current_amount' => 0, 'is_active' => true, 'is_completed' => false]);

    Sanctum::actingAs($owner);
    $names = collect($this->getJson('/api/v1/savings-goals')->json('data'))->pluck('name')->all();
    expect($names)->toEqual(['Mine']);
});

it('updates a goal\'s target and deadline', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Trip', 'target_amount' => 500, 'current_amount' => 0, 'is_active' => true, 'is_completed' => false]);

    $response = $this->patchJson('/api/v1/savings-goals/'.$goal->id, [
        'targetAmount' => 750,
        'deadline' => now()->addYear()->toDateString(),
    ])->assertOk();

    expect((float) $response->json('data.targetAmount'))->toBe(750.0);
});

it('deletes a goal', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Bye', 'target_amount' => 100, 'current_amount' => 0, 'is_active' => true, 'is_completed' => false]);

    $this->deleteJson('/api/v1/savings-goals/'.$goal->id)->assertOk();
    expect(Goal::find($goal->id))->toBeNull();
});

it('rejects targetAmount of 0 or negative', function () {
    Sanctum::actingAs(User::factory()->create());
    $this->postJson('/api/v1/savings-goals', ['name' => 'X', 'targetAmount' => 0])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['targetAmount']]);
});

it('cannot mutate another user\'s goal', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $goal = Goal::create(['user_id' => $owner->id, 'name' => 'X', 'target_amount' => 100, 'current_amount' => 0, 'is_active' => true, 'is_completed' => false]);

    Sanctum::actingAs($other);
    $this->getJson('/api/v1/savings-goals/'.$goal->id)->assertNotFound();
    $this->patchJson('/api/v1/savings-goals/'.$goal->id, ['name' => 'Hijack'])->assertNotFound();
    $this->deleteJson('/api/v1/savings-goals/'.$goal->id)->assertNotFound();
});

it('contributes to a goal and updates current_amount', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Fund', 'target_amount' => 100, 'current_amount' => 0, 'is_active' => true, 'is_completed' => false]);

    $response = $this->postJson('/api/v1/savings-goals/'.$goal->id.'/contribute', ['amount' => 25.5])
        ->assertStatus(201);

    expect((float) $response->json('data.goal.savedAmount'))->toBe(25.5);
    expect(GoalContribution::query()->where('goal_id', $goal->id)->count())->toBe(1);
    expect($goal->fresh()->current_amount)->toBe(25.5);
});

it('marks the goal completed when contribution reaches target', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Fund', 'target_amount' => 100, 'current_amount' => 75, 'is_active' => true, 'is_completed' => false]);

    $this->postJson('/api/v1/savings-goals/'.$goal->id.'/contribute', ['amount' => 30])
        ->assertStatus(201)
        ->assertJsonPath('data.goal.isCompleted', true);

    expect($goal->fresh()->is_completed)->toBeTrue();
});

it('returns progress with monthsRemaining and requiredMonthly when a deadline is set', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $goal = Goal::create([
        'user_id' => $user->id,
        'name' => 'Trip',
        'target_amount' => 1200,
        'current_amount' => 200,
        'target_date' => now()->addMonths(10)->toDateString(),
        'is_active' => true,
        'is_completed' => false,
    ]);

    $data = $this->getJson('/api/v1/savings-goals/'.$goal->id.'/progress')
        ->assertOk()
        ->json('data');

    expect((float) $data['remaining'])->toBe(1000.0);
    expect($data['monthsRemaining'])->toBeGreaterThan(0);
    expect($data['requiredMonthly'])->toBeGreaterThan(0);
});

it('returns null requiredMonthly when no deadline is set', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $goal = Goal::create(['user_id' => $user->id, 'name' => 'X', 'target_amount' => 100, 'current_amount' => 0, 'is_active' => true, 'is_completed' => false]);

    $data = $this->getJson('/api/v1/savings-goals/'.$goal->id.'/progress')
        ->assertOk()
        ->json('data');

    expect($data['monthsRemaining'])->toBeNull();
    expect($data['requiredMonthly'])->toBeNull();
});
