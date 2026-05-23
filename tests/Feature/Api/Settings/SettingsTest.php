<?php

use App\Models\User;
use App\Models\UserSettings;
use Laravel\Sanctum\Sanctum;

it('lazily creates settings on first GET and returns defaults', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    expect(UserSettings::query()->where('user_id', $user->id)->exists())->toBeFalse();

    $this->getJson('/api/v1/settings')->assertOk()
        ->assertJsonPath('data.themeMode', 'system')
        ->assertJsonPath('data.currency', 'usd')
        ->assertJsonPath('data.dailyReminderHour', 21)
        ->assertJsonPath('data.dailyReminderEnabled', false)
        ->assertJsonPath('data.budgetAlertEnabled', true)
        ->assertJsonPath('data.cloudSyncEnabled', false);

    expect(UserSettings::query()->where('user_id', $user->id)->exists())->toBeTrue();
});

it('updates a subset of settings via PATCH', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->patchJson('/api/v1/settings', [
        'themeMode' => 'dark',
        'currency' => 'ngn',
        'dailyReminderEnabled' => true,
        'dailyReminderHour' => 8,
        'cloudSyncEnabled' => true,
    ])->assertOk()
        ->assertJsonPath('data.themeMode', 'dark')
        ->assertJsonPath('data.currency', 'ngn')
        ->assertJsonPath('data.dailyReminderEnabled', true)
        ->assertJsonPath('data.dailyReminderHour', 8)
        ->assertJsonPath('data.cloudSyncEnabled', true);
});

it('rejects unsupported themeMode', function () {
    Sanctum::actingAs(User::factory()->create());
    $this->patchJson('/api/v1/settings', ['themeMode' => 'neon'])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['themeMode']]);
});

it('rejects unsupported currency code', function () {
    Sanctum::actingAs(User::factory()->create());
    $this->patchJson('/api/v1/settings', ['currency' => 'xyz'])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['currency']]);
});

it('clamps hour and minute via validation', function () {
    Sanctum::actingAs(User::factory()->create());
    $this->patchJson('/api/v1/settings', ['dailyReminderHour' => 25])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['dailyReminderHour']]);
    $this->patchJson('/api/v1/settings', ['dailyReminderMinute' => 60])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['dailyReminderMinute']]);
});

it('keeps each user\'s settings isolated', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();

    Sanctum::actingAs($a);
    $this->patchJson('/api/v1/settings', ['currency' => 'ngn'])->assertOk();

    Sanctum::actingAs($b);
    $this->getJson('/api/v1/settings')
        ->assertOk()
        ->assertJsonPath('data.currency', 'usd');
});

it('requires authentication', function () {
    $this->getJson('/api/v1/settings')->assertUnauthorized();
    $this->patchJson('/api/v1/settings', ['themeMode' => 'dark'])->assertUnauthorized();
});
