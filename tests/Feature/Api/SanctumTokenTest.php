<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Route::middleware(['api', 'auth:sanctum'])->prefix('api/v1')->group(function () {
        Route::get('/_test/me', function (\Illuminate\Http\Request $request) {
            return response()->apiSuccess([
                'id' => $request->user()->id,
                'tier' => $request->user()->subscription_tier,
            ]);
        });
    });
});

it('rejects unauthenticated requests to a sanctum-protected route', function () {
    $this->getJson('/api/v1/_test/me')
        ->assertUnauthorized()
        ->assertJsonPath('success', false);
});

it('accepts requests authenticated with a sanctum personal access token', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-device')->plainTextToken;

    $this->withHeader('Authorization', 'Bearer '.$token)
        ->getJson('/api/v1/_test/me')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.tier', 'free');
});

it('persists the token row against the uuid user via uuidMorphs', function () {
    $user = User::factory()->create();
    $user->createToken('test-device');

    $row = \DB::table('personal_access_tokens')->latest('id')->first();

    expect($row->tokenable_type)->toBe(User::class);
    expect($row->tokenable_id)->toBe($user->id);
    expect($row->tokenable_id)->toMatch('/^[0-9a-f-]{36}$/i');
});

it('reflects premium status via the User::isPremium helper', function () {
    $free = User::factory()->create();
    $premium = User::factory()->premium()->create();
    $expired = User::factory()->premium()->create(['subscription_expires_at' => now()->subDay()]);

    expect($free->isPremium())->toBeFalse();
    expect($premium->isPremium())->toBeTrue();
    expect($expired->isPremium())->toBeFalse();
});

it('uses Sanctum::actingAs() with the API guard', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->getJson('/api/v1/_test/me')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id);
});
