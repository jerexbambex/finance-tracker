<?php

use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Sanctum\PersonalAccessToken;

it('returns the current user from /auth/me', function () {
    $user = User::factory()->create([
        'phone_number' => '+2348011112222',
        'first_name' => 'Ada',
        'last_name' => 'Lovelace',
        'goal' => 'finance',
    ]);

    $token = $user->createToken('test')->plainTextToken;

    $this->withHeader('Authorization', 'Bearer '.$token)
        ->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonPath('data.id', $user->id)
        ->assertJsonPath('data.phoneNumber', '+2348011112222')
        ->assertJsonPath('data.firstName', 'Ada')
        ->assertJsonPath('data.lastName', 'Lovelace')
        ->assertJsonPath('data.goal', 'finance');
});

it('rejects /auth/me without a token', function () {
    $this->getJson('/api/v1/auth/me')
        ->assertUnauthorized()
        ->assertJsonPath('success', false);
});

it('logout deletes the current access token and revokes the user\'s refresh tokens', function () {
    $user = User::factory()->create([
        'phone_number' => '+2348011112222',
        'password' => 'password',
    ]);

    $login = $this->postJson('/api/v1/auth/login', [
        'phoneNumber' => '+2348011112222',
        'password' => 'password',
    ])->assertOk();

    $access = $login->json('data.accessToken');

    expect(PersonalAccessToken::query()->count())->toBe(1);
    expect(RefreshToken::query()->whereNull('revoked_at')->count())->toBe(1);

    $this->withHeader('Authorization', 'Bearer '.$access)
        ->postJson('/api/v1/auth/logout')
        ->assertOk()
        ->assertJsonPath('success', true);

    expect(PersonalAccessToken::query()->count())->toBe(0);
    expect(RefreshToken::query()->whereNull('revoked_at')->count())->toBe(0);

    // Clear Laravel's per-test auth-singleton cache; otherwise the same
    // resolved user is reused across sub-requests within one test, masking
    // the fact that the token row was deleted. In production each request
    // is a fresh process so this is purely a test-harness concern.
    Auth::forgetGuards();

    // Reusing the access token must now fail.
    $this->withHeader('Authorization', 'Bearer '.$access)
        ->getJson('/api/v1/auth/me')
        ->assertUnauthorized();
});

it('does not expose biometric_token_hash anywhere', function () {
    $user = User::factory()->create();
    $user->forceFill([
        'biometric_enabled' => true,
        'biometric_token_hash' => hash('sha256', 'secret'),
    ])->save();

    $token = $user->createToken('test')->plainTextToken;

    $body = $this->withHeader('Authorization', 'Bearer '.$token)
        ->getJson('/api/v1/auth/me')
        ->assertOk()
        ->json();

    expect(json_encode($body))->not->toContain('biometric_token_hash');
});
