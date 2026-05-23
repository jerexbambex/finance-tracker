<?php

use App\Models\Category;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('lists user-owned + shared default categories', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    Category::create(['user_id' => null, 'name' => 'Shared', 'type' => 'expense', 'is_active' => true]);
    Category::create(['user_id' => $user->id, 'name' => 'Mine', 'type' => 'expense', 'is_active' => true]);
    Category::create(['user_id' => User::factory()->create()->id, 'name' => 'Theirs', 'type' => 'expense', 'is_active' => true]);

    $response = $this->getJson('/api/v1/categories')->assertOk();

    $names = collect($response->json('data'))->pluck('name')->all();
    expect($names)->toContain('Shared', 'Mine');
    expect($names)->not->toContain('Theirs');
});

it('creates a category with full mobile payload', function () {
    Sanctum::actingAs(User::factory()->create());

    $payload = [
        'name' => 'Aso-Ebi',
        'type' => 'expense',
        'budgetCategory' => 'wants',
        'icon' => 'checkroom',
        'color' => '#a855f7',
        'monthlyBudget' => 25.5,
        'order' => 3,
        'isArchived' => false,
    ];

    $response = $this->postJson('/api/v1/categories', $payload)
        ->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.name', 'Aso-Ebi')
        ->assertJsonPath('data.budgetCategory', 'wants')
        ->assertJsonPath('data.monthlyBudget', 25.5)
        ->assertJsonPath('data.order', 3)
        ->assertJsonPath('data.isArchived', false);

    $id = $response->json('data.id');
    expect(Category::find($id)->monthly_budget)->toBe(25.5);
    expect(\DB::table('categories')->where('id', $id)->value('monthly_budget'))->toBe(2550);
});

it('rejects an invalid budgetCategory enum', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/categories', [
        'name' => 'X',
        'type' => 'expense',
        'budgetCategory' => 'bogus',
    ])->assertStatus(422)
        ->assertJsonStructure(['errors' => ['budgetCategory']]);
});

it('updates a category and inverts isArchived to is_active', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $cat = Category::create([
        'user_id' => $user->id,
        'name' => 'Coffee',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $this->patchJson('/api/v1/categories/'.$cat->id, ['isArchived' => true])
        ->assertOk()
        ->assertJsonPath('data.isArchived', true);

    expect($cat->fresh()->is_active)->toBeFalse();
});

it('archives instead of hard-deleting on destroy', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $cat = Category::create([
        'user_id' => $user->id,
        'name' => 'Coffee',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $this->deleteJson('/api/v1/categories/'.$cat->id)
        ->assertOk()
        ->assertJsonPath('success', true);

    expect(Category::find($cat->id))->not->toBeNull();
    expect($cat->fresh()->is_active)->toBeFalse();
});

it('cannot mutate another user\'s category', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    Sanctum::actingAs($other);

    $cat = Category::create([
        'user_id' => $owner->id,
        'name' => 'Coffee',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $this->patchJson('/api/v1/categories/'.$cat->id, ['name' => 'Hijacked'])
        ->assertNotFound();
    $this->deleteJson('/api/v1/categories/'.$cat->id)
        ->assertNotFound();
});

it('cannot show another user\'s category but can show shared defaults', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    Sanctum::actingAs($other);

    $owned = Category::create([
        'user_id' => $owner->id,
        'name' => 'Owned',
        'type' => 'expense',
        'is_active' => true,
    ]);
    $shared = Category::create([
        'user_id' => null,
        'name' => 'Shared',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $this->getJson('/api/v1/categories/'.$owned->id)->assertNotFound();
    $this->getJson('/api/v1/categories/'.$shared->id)
        ->assertOk()
        ->assertJsonPath('data.name', 'Shared');
});

it('returns colors as Flutter-compatible ints', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    Category::create([
        'user_id' => $user->id,
        'name' => 'Hex',
        'type' => 'expense',
        'color' => '#ff00ff',
        'is_active' => true,
    ]);

    $color = $this->getJson('/api/v1/categories')
        ->json('data.0.color');

    expect($color)->toBe(0xFFFF00FF);
});

it('requires auth on category endpoints', function () {
    $this->getJson('/api/v1/categories')->assertUnauthorized();
    $this->postJson('/api/v1/categories', ['name' => 'x', 'type' => 'expense'])->assertUnauthorized();
});
