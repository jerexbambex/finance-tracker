<?php

use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('rejects free users with 402 on /sync/push', function () {
    Sanctum::actingAs(User::factory()->create()); // default tier = free

    $this->postJson('/api/v1/sync/push', [])
        ->assertStatus(402)
        ->assertJsonPath('success', false)
        ->assertJsonPath('data.subscriptionTier', 'free');
});

it('rejects free users with 402 on /sync/pull', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->getJson('/api/v1/sync/pull')->assertStatus(402);
});

it('rejects free users with 402 on /sync/status', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->getJson('/api/v1/sync/status')->assertStatus(402);
});

it('rejects expired-premium users with 402', function () {
    Sanctum::actingAs(User::factory()->premium()->create([
        'subscription_expires_at' => now()->subDay(),
    ]));

    $this->getJson('/api/v1/sync/status')->assertStatus(402);
});

it('lets active-premium users through', function () {
    Sanctum::actingAs(User::factory()->premium()->create());

    $this->getJson('/api/v1/sync/status')->assertOk()
        ->assertJsonPath('success', true);
});

it('rejects unauthenticated requests with 401', function () {
    $this->getJson('/api/v1/sync/status')->assertUnauthorized();
});
