<?php

use App\Models\Category;
use App\Models\Goal;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

function premiumPullUser(): User
{
    $user = User::factory()->premium()->create();
    Sanctum::actingAs($user);

    return $user;
}

it('returns all rows when lastSyncAt is omitted', function () {
    $user = premiumPullUser();

    Category::create(['user_id' => $user->id, 'client_id' => Str::uuid(), 'name' => 'A', 'type' => 'expense', 'is_active' => true]);
    Category::create(['user_id' => $user->id, 'client_id' => Str::uuid(), 'name' => 'B', 'type' => 'expense', 'is_active' => true]);

    $data = $this->getJson('/api/v1/sync/pull')->assertOk()->json('data');
    expect($data['categories'])->toHaveCount(2);
    expect($data)->toHaveKeys(['transactions', 'categories', 'budgets', 'savingsGoals', 'settings', 'deletedIds', 'serverTime']);
});

it('returns only rows changed after lastSyncAt', function () {
    $user = premiumPullUser();

    $old = Category::create(['user_id' => $user->id, 'client_id' => Str::uuid(), 'name' => 'Old', 'type' => 'expense', 'is_active' => true]);
    $old->forceFill(['updated_at' => now()->subDays(2)])->save();

    $new = Category::create(['user_id' => $user->id, 'client_id' => Str::uuid(), 'name' => 'New', 'type' => 'expense', 'is_active' => true]);
    $new->forceFill(['updated_at' => now()])->save();

    $data = $this->getJson('/api/v1/sync/pull?lastSyncAt='.urlencode(now()->subDay()->toIso8601String()))
        ->assertOk()
        ->json('data');

    $names = collect($data['categories'])->pluck('name')->all();
    expect($names)->toEqual(['New']);
});

it('returns soft-deleted client_ids in deletedIds', function () {
    $user = premiumPullUser();
    $clientId = (string) Str::uuid();

    $cat = Category::create([
        'user_id' => $user->id,
        'client_id' => $clientId,
        'name' => 'Goner',
        'type' => 'expense',
        'is_active' => true,
    ]);
    $cat->delete();

    $data = $this->getJson('/api/v1/sync/pull')->assertOk()->json('data');
    expect($data['deletedIds']['categories'])->toContain($clientId);
    expect(collect($data['categories'])->pluck('id')->all())->not->toContain($cat->id);
});

it('only returns the authenticated user\'s rows', function () {
    $user = premiumPullUser();
    $other = User::factory()->premium()->create();

    Category::create(['user_id' => $other->id, 'client_id' => Str::uuid(), 'name' => 'Theirs', 'type' => 'expense', 'is_active' => true]);

    expect($this->getJson('/api/v1/sync/pull')->json('data.categories'))->toBeEmpty();
});

it('includes settings only when they have been updated', function () {
    $user = premiumPullUser();
    expect($this->getJson('/api/v1/sync/pull')->json('data.settings'))->toBeNull();

    $user->settings()->create([
        'user_id' => $user->id,
        'theme_mode' => 'dark',
    ]);

    expect($this->getJson('/api/v1/sync/pull')->json('data.settings.themeMode'))->toBe('dark');
});

it('updates user.last_synced_at after a pull', function () {
    $user = premiumPullUser();
    $this->getJson('/api/v1/sync/pull')->assertOk();

    expect($user->fresh()->last_synced_at)->not->toBeNull();
});

it('returns counts and lastSyncAt from /sync/status', function () {
    $user = premiumPullUser();
    $user->forceFill(['last_synced_at' => now()])->save();

    Category::create(['user_id' => $user->id, 'client_id' => Str::uuid(), 'name' => 'A', 'type' => 'expense', 'is_active' => true]);
    Goal::create(['user_id' => $user->id, 'client_id' => Str::uuid(), 'name' => 'G', 'target_amount' => 100, 'current_amount' => 0, 'is_active' => true, 'is_completed' => false]);

    $status = $this->getJson('/api/v1/sync/status')->assertOk()->json('data');
    expect($status['counts']['categories'])->toBe(1);
    expect($status['counts']['savingsGoals'])->toBe(1);
    expect($status['isPremium'])->toBeTrue();
    expect($status['lastSyncAt'])->not->toBeNull();
});

it('round-trips: push then pull returns the pushed row', function () {
    $user = premiumPullUser();
    $clientId = (string) Str::uuid();

    $this->postJson('/api/v1/sync/push', [
        'categories' => [[
            'clientId' => $clientId,
            'updatedAt' => now()->toIso8601String(),
            'name' => 'Pushed',
            'type' => 'expense',
        ]],
    ])->assertOk();

    $rows = $this->getJson('/api/v1/sync/pull?lastSyncAt='.urlencode(now()->subMinute()->toIso8601String()))
        ->json('data.categories');

    expect(collect($rows)->pluck('name')->all())->toContain('Pushed');
});
