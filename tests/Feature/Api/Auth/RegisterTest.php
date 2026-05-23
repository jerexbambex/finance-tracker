<?php

use App\Models\RefreshToken;
use App\Models\User;

it('registers a user with phone + password and returns access + refresh tokens', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'phoneNumber' => '+2348012345678',
        'password' => 'sup3r-secret',
        'firstName' => 'Ada',
        'lastName' => 'Lovelace',
        'deviceName' => 'pixel-9',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.tokenType', 'Bearer')
        ->assertJsonPath('data.user.phoneNumber', '+2348012345678')
        ->assertJsonPath('data.user.firstName', 'Ada')
        ->assertJsonPath('data.user.lastName', 'Lovelace')
        ->assertJsonPath('data.user.subscriptionTier', 'free')
        ->assertJsonPath('data.user.isPremium', false)
        ->assertJsonStructure([
            'data' => ['accessToken', 'refreshToken', 'expiresIn', 'user' => ['id', 'phoneNumber', 'createdAt']],
        ]);

    expect(User::query()->where('phone_number', '+2348012345678')->exists())->toBeTrue();
    expect(RefreshToken::query()->count())->toBe(1);
});

it('rejects registration when phone number is missing', function () {
    $this->postJson('/api/v1/auth/register', [
        'password' => 'sup3r-secret',
    ])->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonStructure(['errors' => ['phoneNumber']]);
});

it('rejects registration when phone number already exists', function () {
    User::factory()->create(['phone_number' => '+2348012345678']);

    $this->postJson('/api/v1/auth/register', [
        'phoneNumber' => '+2348012345678',
        'password' => 'sup3r-secret',
    ])->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonStructure(['errors' => ['phoneNumber']]);
});

it('rejects short passwords', function () {
    $this->postJson('/api/v1/auth/register', [
        'phoneNumber' => '+2348011111111',
        'password' => 'short',
    ])->assertStatus(422)
        ->assertJsonStructure(['errors' => ['password']]);
});

it('hashes the password and stores it', function () {
    $this->postJson('/api/v1/auth/register', [
        'phoneNumber' => '+2348022222222',
        'password' => 'plaintext-here',
    ])->assertStatus(201);

    $user = User::query()->where('phone_number', '+2348022222222')->first();
    expect($user->password)->not->toBe('plaintext-here');
    expect(\Illuminate\Support\Facades\Hash::check('plaintext-here', $user->password))->toBeTrue();
});
