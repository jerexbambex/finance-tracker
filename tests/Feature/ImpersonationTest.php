<?php

use App\Models\User;
use Filament\Facades\Filament;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use STS\FilamentImpersonate\Facades\Impersonation;

beforeEach(function () {
    Role::findOrCreate('admin', 'web');
    $this->admin = User::factory()->create();
    $this->admin->assignRole('admin');
    $this->user = User::factory()->create();

    $this->actingAs($this->admin);
});

it('shares no impersonation banner data for a normal session', function () {
    $this->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page->where('impersonating', null));
});

it('flags the impersonated user to the frontend and restores the admin on leave', function () {
    expect(Impersonation::enter($this->admin, $this->user, 'web'))->toBeTrue();

    $this->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->where('impersonating.email', $this->user->email)
            ->where('auth.user.id', $this->user->id));

    $this->get(route('filament-impersonate.leave'))->assertRedirect();

    $this->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->where('impersonating', null)
            ->where('auth.user.id', $this->admin->id));
});

it('lets a non-admin reach the panel only while being impersonated', function () {
    $panel = Filament::getPanel('admin');

    expect($this->user->canAccessPanel($panel))->toBeFalse();

    Impersonation::enter($this->admin, $this->user, 'web');

    expect($this->user->canAccessPanel($panel))->toBeTrue();
});
