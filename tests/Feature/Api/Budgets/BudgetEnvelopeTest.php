<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

it('returns null when no envelope is set for the month', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->getJson('/api/v1/budgets/envelope?year=2026&month=5')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data', null);
});

it('creates an envelope on first PUT', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->putJson('/api/v1/budgets/envelope', [
        'year' => 2026,
        'month' => 5,
        'amount' => 300000,
    ])->assertStatus(201);

    expect($response->json('data.year'))->toBe(2026);
    expect($response->json('data.month'))->toBe(5);
    expect((float) $response->json('data.amount'))->toBe(300000.0);
    expect($response->json('data.categoryId'))->toBeNull();

    expect(Budget::query()
        ->where('user_id', $user->id)
        ->whereNull('category_id')
        ->count())->toBe(1);
});

it('updates the existing envelope on second PUT (no duplicates)', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $first = $this->putJson('/api/v1/budgets/envelope', [
        'year' => 2026,
        'month' => 5,
        'amount' => 100,
    ])->assertStatus(201);

    $second = $this->putJson('/api/v1/budgets/envelope', [
        'year' => 2026,
        'month' => 5,
        'amount' => 250,
    ])->assertOk();

    expect($first->json('data.id'))->toBe($second->json('data.id'));
    expect((float) $second->json('data.amount'))->toBe(250.0);
    expect(Budget::query()->where('user_id', $user->id)->whereNull('category_id')->count())->toBe(1);
});

it('keeps envelopes per (user, year, month) distinct', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->putJson('/api/v1/budgets/envelope', ['year' => 2026, 'month' => 5, 'amount' => 100])->assertStatus(201);
    $this->putJson('/api/v1/budgets/envelope', ['year' => 2026, 'month' => 6, 'amount' => 200])->assertStatus(201);

    expect(Budget::query()->where('user_id', $user->id)->whereNull('category_id')->count())->toBe(2);

    expect((float) $this->getJson('/api/v1/budgets/envelope?year=2026&month=5')->json('data.amount'))->toBe(100.0);
    expect((float) $this->getJson('/api/v1/budgets/envelope?year=2026&month=6')->json('data.amount'))->toBe(200.0);
});

it('keeps envelopes isolated per user', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();

    Sanctum::actingAs($a);
    $this->putJson('/api/v1/budgets/envelope', ['year' => 2026, 'month' => 5, 'amount' => 100])->assertStatus(201);

    Sanctum::actingAs($b);
    $this->getJson('/api/v1/budgets/envelope?year=2026&month=5')
        ->assertOk()
        ->assertJsonPath('data', null);
});

it('envelope rows appear alongside category budgets in /budgets index', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $cat = Category::create(['user_id' => $user->id, 'name' => 'Rent', 'type' => 'expense', 'is_active' => true]);

    $this->putJson('/api/v1/budgets/envelope', ['year' => 2026, 'month' => 5, 'amount' => 300])->assertStatus(201);
    $this->postJson('/api/v1/budgets', ['categoryId' => $cat->id, 'year' => 2026, 'month' => 5, 'amount' => 100])->assertStatus(201);

    $rows = $this->getJson('/api/v1/budgets?year=2026&month=5')->json('data');
    expect($rows)->toHaveCount(2);

    $envelope = collect($rows)->firstWhere('categoryId', null);
    $category = collect($rows)->firstWhere('categoryId', $cat->id);
    expect($envelope)->not->toBeNull();
    expect($category)->not->toBeNull();
});

it('rejects invalid envelope payloads', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->putJson('/api/v1/budgets/envelope', [])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['year', 'month', 'amount']]);

    $this->putJson('/api/v1/budgets/envelope', ['year' => 2026, 'month' => 13, 'amount' => 100])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['month']]);

    $this->putJson('/api/v1/budgets/envelope', ['year' => 2026, 'month' => 5, 'amount' => -5])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['amount']]);
});

it('requires authentication', function () {
    $this->getJson('/api/v1/budgets/envelope?year=2026&month=5')->assertUnauthorized();
    $this->putJson('/api/v1/budgets/envelope', ['year' => 2026, 'month' => 5, 'amount' => 100])->assertUnauthorized();
});

it('sync push upserts an envelope when categoryClientId is null', function () {
    $user = User::factory()->premium()->create();
    Sanctum::actingAs($user);

    $clientId = (string) Str::uuid();
    $this->postJson('/api/v1/sync/push', [
        'budgets' => [[
            'clientId' => $clientId,
            'updatedAt' => now()->toIso8601String(),
            'categoryClientId' => null,
            'year' => 2026,
            'month' => 5,
            'amount' => 500,
        ]],
    ])->assertOk();

    $envelope = Budget::query()->where('client_id', $clientId)->first();
    expect($envelope)->not->toBeNull();
    expect($envelope->category_id)->toBeNull();
    expect((float) $envelope->amount)->toBe(500.0);
});
