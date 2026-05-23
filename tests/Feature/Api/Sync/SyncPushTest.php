<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

function premiumUser(): User
{
    $user = User::factory()->premium()->create();
    Sanctum::actingAs($user);

    return $user;
}

it('inserts a brand-new category via push', function () {
    $user = premiumUser();
    $clientId = (string) Str::uuid();

    $this->postJson('/api/v1/sync/push', [
        'categories' => [[
            'clientId' => $clientId,
            'updatedAt' => now()->toIso8601String(),
            'name' => 'Coffee',
            'type' => 'expense',
            'budgetCategory' => 'wants',
        ]],
    ])->assertOk();

    expect(Category::query()->where('user_id', $user->id)->where('client_id', $clientId)->exists())->toBeTrue();
});

it('inserts a transaction with a category reference via clientId', function () {
    $user = premiumUser();
    $catClient = (string) Str::uuid();
    $txClient = (string) Str::uuid();

    $this->postJson('/api/v1/sync/push', [
        'categories' => [[
            'clientId' => $catClient,
            'updatedAt' => now()->toIso8601String(),
            'name' => 'Food',
            'type' => 'expense',
        ]],
        'transactions' => [[
            'clientId' => $txClient,
            'updatedAt' => now()->toIso8601String(),
            'type' => 'expense',
            'amount' => 12.50,
            'description' => 'Lunch',
            'date' => '2026-05-23',
            'categoryClientId' => $catClient,
        ]],
    ])->assertOk();

    $tx = Transaction::query()->where('client_id', $txClient)->first();
    expect($tx)->not->toBeNull();
    expect($tx->category->client_id)->toBe($catClient);
    expect((float) $tx->amount)->toBe(12.5);
});

it('returns a conflict when the server row is newer', function () {
    $user = premiumUser();
    $clientId = (string) Str::uuid();

    Category::create([
        'user_id' => $user->id,
        'client_id' => $clientId,
        'name' => 'Server',
        'type' => 'expense',
        'is_active' => true,
    ])->forceFill(['updated_at' => now()])->save();

    $response = $this->postJson('/api/v1/sync/push', [
        'categories' => [[
            'clientId' => $clientId,
            'updatedAt' => now()->subHour()->toIso8601String(),
            'name' => 'Stale Client',
            'type' => 'expense',
        ]],
    ])->assertOk();

    expect($response->json('data.conflicts.categories'))->toHaveCount(1);
    expect($response->json('data.applied.categories'))->toBeEmpty();
    expect(Category::query()->where('client_id', $clientId)->value('name'))->toBe('Server');
});

it('updates a row when the client is newer', function () {
    $user = premiumUser();
    $clientId = (string) Str::uuid();

    Category::create([
        'user_id' => $user->id,
        'client_id' => $clientId,
        'name' => 'Old Name',
        'type' => 'expense',
        'is_active' => true,
    ])->forceFill(['updated_at' => now()->subDay()])->save();

    $this->postJson('/api/v1/sync/push', [
        'categories' => [[
            'clientId' => $clientId,
            'updatedAt' => now()->toIso8601String(),
            'name' => 'New Name',
            'type' => 'expense',
        ]],
    ])->assertOk();

    expect(Category::query()->where('client_id', $clientId)->value('name'))->toBe('New Name');
});

it('soft-deletes a row when deletedAt is supplied', function () {
    $user = premiumUser();
    $clientId = (string) Str::uuid();

    Category::create([
        'user_id' => $user->id,
        'client_id' => $clientId,
        'name' => 'Bye',
        'type' => 'expense',
        'is_active' => true,
    ])->forceFill(['updated_at' => now()->subHour()])->save();

    $this->postJson('/api/v1/sync/push', [
        'categories' => [[
            'clientId' => $clientId,
            'updatedAt' => now()->toIso8601String(),
            'deletedAt' => now()->toIso8601String(),
            'name' => 'Bye',
            'type' => 'expense',
        ]],
    ])->assertOk();

    expect(Category::query()->where('client_id', $clientId)->exists())->toBeFalse();
    expect(Category::withTrashed()->where('client_id', $clientId)->exists())->toBeTrue();
});

it('resurrects a soft-deleted row when the client re-creates it', function () {
    $user = premiumUser();
    $clientId = (string) Str::uuid();

    $cat = Category::create([
        'user_id' => $user->id,
        'client_id' => $clientId,
        'name' => 'Resurrect',
        'type' => 'expense',
        'is_active' => true,
    ]);
    $cat->delete();
    // Backdate AFTER the delete — `$cat->delete()` triggers a save that
    // refreshes updated_at to now, which would otherwise tie/beat the
    // incoming client timestamp and trip the stale check.
    \DB::table('categories')->where('id', $cat->id)
        ->update(['updated_at' => now()->subDay()]);

    $this->postJson('/api/v1/sync/push', [
        'categories' => [[
            'clientId' => $clientId,
            'updatedAt' => now()->toIso8601String(),
            'name' => 'Resurrect',
            'type' => 'expense',
        ]],
    ])->assertOk();

    expect(Category::query()->where('client_id', $clientId)->exists())->toBeTrue();
});

it('updates user.last_synced_at after a push', function () {
    $user = premiumUser();
    expect($user->last_synced_at)->toBeNull();

    $this->postJson('/api/v1/sync/push', [])->assertOk();

    expect($user->fresh()->last_synced_at)->not->toBeNull();
});

it('rejects rows missing clientId or updatedAt', function () {
    premiumUser();

    $this->postJson('/api/v1/sync/push', [
        'categories' => [['name' => 'no-keys']],
    ])->assertStatus(422)
        ->assertJsonStructure(['errors']);
});

it('upserts settings via push and ignores stale settings', function () {
    $user = premiumUser();
    // Pre-existing settings with "now" timestamp.
    $user->settings()->create([
        'user_id' => $user->id,
        'theme_mode' => 'dark',
    ])->forceFill(['updated_at' => now()])->save();

    // Client sends an older snapshot.
    $this->postJson('/api/v1/sync/push', [
        'settings' => [
            'updatedAt' => now()->subHour()->toIso8601String(),
            'themeMode' => 'light',
        ],
    ])->assertOk();

    expect($user->fresh()->settings->theme_mode)->toBe('dark');

    // Client sends a fresh snapshot.
    $this->postJson('/api/v1/sync/push', [
        'settings' => [
            'updatedAt' => now()->addHour()->toIso8601String(),
            'themeMode' => 'light',
        ],
    ])->assertOk();

    expect($user->fresh()->settings->theme_mode)->toBe('light');
});
