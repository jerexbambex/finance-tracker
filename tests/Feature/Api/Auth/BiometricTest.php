<?php

use App\Models\User;

it('enrolls a biometric token while authenticated and toggles the flag', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test')->plainTextToken;

    $this->withHeader('Authorization', 'Bearer '.$token)
        ->postJson('/api/v1/auth/biometric/enroll', [
            'biometricToken' => 'a-long-random-device-token-1234567890',
        ])
        ->assertOk()
        ->assertJsonPath('success', true);

    $user->refresh();
    expect($user->biometric_enabled)->toBeTrue();
    expect($user->biometric_token_hash)
        ->toBe(hash('sha256', 'a-long-random-device-token-1234567890'));
});

it('rejects enroll without authentication', function () {
    $this->postJson('/api/v1/auth/biometric/enroll', [
        'biometricToken' => 'a-long-random-device-token-1234567890',
    ])->assertUnauthorized();
});

it('verifies a previously-enrolled biometric token and issues fresh tokens', function () {
    $user = User::factory()->create(['phone_number' => '+2348012345678']);
    $secret = 'a-long-random-device-token-1234567890';
    $user->forceFill([
        'biometric_enabled' => true,
        'biometric_token_hash' => hash('sha256', $secret),
    ])->save();

    $this->postJson('/api/v1/auth/biometric/verify', [
        'phoneNumber' => '+2348012345678',
        'biometricToken' => $secret,
    ])
        ->assertOk()
        ->assertJsonStructure([
            'data' => ['accessToken', 'refreshToken', 'user'],
        ]);
});

it('rejects biometric verify with a mismatched token', function () {
    $user = User::factory()->create(['phone_number' => '+2348012345678']);
    $user->forceFill([
        'biometric_enabled' => true,
        'biometric_token_hash' => hash('sha256', 'the-real-secret-1234567890'),
    ])->save();

    $this->postJson('/api/v1/auth/biometric/verify', [
        'phoneNumber' => '+2348012345678',
        'biometricToken' => 'wrong-token-but-long-enough-x',
    ])
        ->assertUnauthorized()
        ->assertJsonPath('success', false);
});

it('rejects biometric verify when biometric is not enabled for the user', function () {
    User::factory()->create(['phone_number' => '+2348012345678']);

    $this->postJson('/api/v1/auth/biometric/verify', [
        'phoneNumber' => '+2348012345678',
        'biometricToken' => 'whatever-long-enough-token123',
    ])
        ->assertUnauthorized();
});

it('rejects biometric verify when phoneNumber is omitted', function () {
    $this->postJson('/api/v1/auth/biometric/verify', [
        'biometricToken' => 'whatever-long-enough-token123',
    ])
        ->assertStatus(422)
        ->assertJsonPath('success', false);
});
