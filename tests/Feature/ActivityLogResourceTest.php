<?php

use App\Models\User;
use Jacobtims\FilamentLogger\Resources\ActivityResource\Pages\ListActivities;
use Livewire\Livewire;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('super_admin', 'web');
    $admin = User::factory()->create();
    $admin->assignRole('super_admin');

    $this->actingAs($admin);
});

it('renders the activity log before any filter has been applied', function () {
    $this->get('/admin/activity-logs')->assertOk();
});

it('filters the activity log by old and new attribute values', function () {
    $matching = activity()->withProperties(['old' => ['name' => 'Rent'], 'attributes' => ['name' => 'Housing']])->log('updated');
    $other = activity()->withProperties(['old' => ['name' => 'Fuel'], 'attributes' => ['name' => 'Transport']])->log('updated');

    Livewire::test(ListActivities::class)
        ->filterTable('properties->old', ['old' => 'Rent'])
        ->assertCanSeeTableRecords([$matching])
        ->assertCanNotSeeTableRecords([$other]);

    Livewire::test(ListActivities::class)
        ->filterTable('properties->attributes', ['new' => 'Transport'])
        ->assertCanSeeTableRecords([$other])
        ->assertCanNotSeeTableRecords([$matching]);
});
