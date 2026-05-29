<?php

use App\Models\User;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\RateLimiter;

beforeEach(function () {
    Queue::fake(); // don't actually hit Bedrock
    RateLimiter::clear('ai-insights:'.($this->uid ?? ''));
});

it('accepts AI insight requests up to the daily cap then returns 429', function () {
    $user = User::factory()->create();
    RateLimiter::clear('ai-insights:'.$user->id);

    // First 5 dispatch successfully
    for ($i = 0; $i < 5; $i++) {
        $this->actingAs($user)
            ->postJson('/insights/ai')
            ->assertOk()
            ->assertJson(['status' => 'processing']);
    }

    // 6th is rate limited
    $this->actingAs($user)
        ->postJson('/insights/ai')
        ->assertStatus(429)
        ->assertJson(['status' => 'rate_limited']);
});

it('rate limit is isolated per user', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();
    RateLimiter::clear('ai-insights:'.$a->id);
    RateLimiter::clear('ai-insights:'.$b->id);

    for ($i = 0; $i < 5; $i++) {
        $this->actingAs($a)->postJson('/insights/ai')->assertOk();
    }
    $this->actingAs($a)->postJson('/insights/ai')->assertStatus(429);

    // User B is unaffected
    $this->actingAs($b)->postJson('/insights/ai')->assertOk();
});

it('status endpoint only returns the requesting user insights', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();

    \Illuminate\Support\Facades\Cache::put(
        \App\Jobs\GenerateAiInsights::cacheKey($a->id),
        ['status' => 'completed', 'insights' => 'A secret analysis'],
        now()->addDay()
    );

    // B must not see A's cached insights
    $this->actingAs($b)
        ->getJson('/insights/ai/status')
        ->assertOk()
        ->assertJsonMissing(['insights' => 'A secret analysis']);
});
