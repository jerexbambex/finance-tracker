<?php

use App\Models\Category;
use App\Models\User;
use App\Services\Api\DefaultCategoryProvisioner;
use Laravel\Sanctum\Sanctum;

it('seeds the full Nigerian taxonomy for the authenticated user', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/v1/categories/seed-defaults')->assertStatus(201);

    $expected = count(DefaultCategoryProvisioner::taxonomy());
    expect($response->json('data.created'))->toBe($expected);
    expect(Category::query()->where('user_id', $user->id)->count())->toBe($expected);
});

it('is idempotent (second call creates nothing new)', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/categories/seed-defaults')->assertStatus(201);
    $second = $this->postJson('/api/v1/categories/seed-defaults')->assertStatus(201);

    expect($second->json('data.created'))->toBe(0);

    $expected = count(DefaultCategoryProvisioner::taxonomy());
    expect(Category::query()->where('user_id', $user->id)->count())->toBe($expected);
});

it('does not seed for other users', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();
    Sanctum::actingAs($a);
    $this->postJson('/api/v1/categories/seed-defaults')->assertStatus(201);

    expect(Category::query()->where('user_id', $a->id)->count())->toBeGreaterThan(0);
    expect(Category::query()->where('user_id', $b->id)->count())->toBe(0);
});

it('keeps existing categories when seeding (no duplicates by name+type)', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    Category::create([
        'user_id' => $user->id,
        'name' => 'Rent',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/v1/categories/seed-defaults')->assertStatus(201);
    $expected = count(DefaultCategoryProvisioner::taxonomy()) - 1;

    expect($response->json('data.created'))->toBe($expected);
    expect(Category::query()
        ->where('user_id', $user->id)
        ->where('type', 'expense')
        ->where('name', 'Rent')
        ->count())->toBe(1);
});
