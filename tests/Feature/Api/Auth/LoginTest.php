<?php

use App\Models\User;

it('logs in with phone number + password and returns tokens', function () {
    User::factory()->create([
        'phone_number' => '+2348012345678',
        'password' => 'right-password',
    ]);

    $this->postJson('/api/v1/auth/login', [
        'phoneNumber' => '+2348012345678',
        'password' => 'right-password',
    ])
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonStructure([
            'data' => ['accessToken', 'refreshToken', 'tokenType', 'user'],
        ]);
});

it('rejects login with wrong password as 422', function () {
    User::factory()->create([
        'phone_number' => '+2348012345678',
        'password' => 'right-password',
    ]);

    $this->postJson('/api/v1/auth/login', [
        'phoneNumber' => '+2348012345678',
        'password' => 'wrong-password',
    ])
        ->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonStructure(['errors' => ['phoneNumber']]);
});

it('rejects login for an unknown phone number', function () {
    $this->postJson('/api/v1/auth/login', [
        'phoneNumber' => '+2349999999999',
        'password' => 'whatever',
    ])
        ->assertStatus(422)
        ->assertJsonPath('success', false);
});

it('does not leak whether the phone number exists in error messages', function () {
    User::factory()->create([
        'phone_number' => '+2348012345678',
        'password' => 'right-password',
    ]);

    $bad1 = $this->postJson('/api/v1/auth/login', [
        'phoneNumber' => '+2348012345678',
        'password' => 'wrong-password',
    ])->json('errors.phoneNumber.0');

    $bad2 = $this->postJson('/api/v1/auth/login', [
        'phoneNumber' => '+2340000000000',
        'password' => 'wrong-password',
    ])->json('errors.phoneNumber.0');

    expect($bad1)->toBe($bad2);
});
