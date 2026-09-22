<?php

use App\Models\User;

it('renders the edit page for a reminder the user owns', function () {
    $user = User::factory()->create();
    $reminder = $user->reminders()->create(['title' => 'Electric Bill', 'due_date' => now()->addDay()]);

    $this->actingAs($user)->get("/reminders/{$reminder->id}/edit")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reminders/Edit')
            ->where('reminder.id', $reminder->id)
        );
});

it('updates a reminder', function () {
    $user = User::factory()->create();
    $reminder = $user->reminders()->create(['title' => 'Electric Bill', 'due_date' => now()->addDay()]);

    $this->actingAs($user)->put("/reminders/{$reminder->id}", [
        'title' => 'Electric Bill (updated)',
        'due_date' => now()->addWeek()->toDateString(),
    ])->assertRedirect('/reminders');

    expect($reminder->fresh()->title)->toBe('Electric Bill (updated)');
});

it('rejects editing another users reminder', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $theirs = $other->reminders()->create(['title' => 'Theirs', 'due_date' => now()->addDay()]);

    $this->actingAs($me)->get("/reminders/{$theirs->id}/edit")->assertForbidden();
});

it('rejects updating another users reminder', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $theirs = $other->reminders()->create(['title' => 'Theirs', 'due_date' => now()->addDay()]);

    $this->actingAs($me)->put("/reminders/{$theirs->id}", [
        'title' => 'Hijacked',
        'due_date' => now()->addWeek()->toDateString(),
    ])->assertForbidden();

    expect($theirs->fresh()->title)->toBe('Theirs');
});

it('rejects deleting another users reminder', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    $theirs = $other->reminders()->create(['title' => 'Theirs', 'due_date' => now()->addDay()]);

    $this->actingAs($me)->delete("/reminders/{$theirs->id}")->assertForbidden();

    expect($theirs->fresh())->not->toBeNull();
});
