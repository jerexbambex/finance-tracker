<?php

use App\Models\RefreshToken;
use App\Models\User;

function loginAndGetTokens(User $user, string $password = 'password'): array
{
    $response = test()->postJson('/api/v1/auth/login', [
        'phoneNumber' => $user->phone_number,
        'password' => $password,
    ])->assertOk();

    return [
        'access' => $response->json('data.accessToken'),
        'refresh' => $response->json('data.refreshToken'),
    ];
}

it('exchanges a valid refresh token for a new pair and revokes the old one', function () {
    $user = User::factory()->create([
        'phone_number' => '+2348012345678',
        'password' => 'password',
    ]);

    $tokens = loginAndGetTokens($user);
    expect(RefreshToken::query()->whereNull('revoked_at')->count())->toBe(1);

    $response = $this->postJson('/api/v1/auth/refresh', [
        'refreshToken' => $tokens['refresh'],
    ])->assertOk();

    $newRefresh = $response->json('data.refreshToken');
    expect($newRefresh)->not->toBe($tokens['refresh']);

    // Old token revoked, exactly one active token remains.
    expect(RefreshToken::query()->whereNull('revoked_at')->count())->toBe(1);
    expect(RefreshToken::query()->whereNotNull('revoked_at')->count())->toBe(1);
});

it('rejects an unknown refresh token with 401', function () {
    $this->postJson('/api/v1/auth/refresh', [
        'refreshToken' => 'nope|definitely-not-real',
    ])
        ->assertStatus(401)
        ->assertJsonPath('success', false);
});

it('rejects a malformed refresh token with 401', function () {
    $this->postJson('/api/v1/auth/refresh', [
        'refreshToken' => 'malformed-no-pipe',
    ])
        ->assertStatus(401);
});

it('rejects a refresh token after it has been used (rotation)', function () {
    $user = User::factory()->create([
        'phone_number' => '+2348012345678',
        'password' => 'password',
    ]);

    $tokens = loginAndGetTokens($user);

    $this->postJson('/api/v1/auth/refresh', ['refreshToken' => $tokens['refresh']])
        ->assertOk();

    // Reusing the original (now revoked) refresh token must fail.
    $this->postJson('/api/v1/auth/refresh', ['refreshToken' => $tokens['refresh']])
        ->assertStatus(401);
});

it('rejects an expired refresh token', function () {
    $user = User::factory()->create([
        'phone_number' => '+2348012345678',
        'password' => 'password',
    ]);

    loginAndGetTokens($user);

    // Force the row into the past.
    RefreshToken::query()->update(['expires_at' => now()->subDay()]);

    $tokens = loginAndGetTokens($user); // issue a fresh one then expire it
    RefreshToken::query()->update(['expires_at' => now()->subDay()]);

    $this->postJson('/api/v1/auth/refresh', ['refreshToken' => $tokens['refresh']])
        ->assertStatus(401);
});

it('requires the refreshToken field', function () {
    $this->postJson('/api/v1/auth/refresh', [])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['refreshToken']]);
});
