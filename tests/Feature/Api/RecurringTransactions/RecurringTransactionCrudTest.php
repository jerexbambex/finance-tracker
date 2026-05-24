<?php

use App\Models\RecurringTransaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('creates a recurring transaction with default account auto-provisioned', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/v1/recurring-transactions', [
        'type' => 'expense',
        'amount' => 15.99,
        'description' => 'Netflix',
        'frequency' => 'monthly',
        'nextDueDate' => '2026-06-01',
    ])->assertStatus(201);

    expect($response->json('data.description'))->toBe('Netflix');
    expect((float) $response->json('data.amount'))->toBe(15.99);
    expect($response->json('data.frequency'))->toBe('monthly');
    expect($response->json('data.isActive'))->toBeTrue();
    expect($response->json('data.accountId'))->not->toBeNull();

    expect(RecurringTransaction::query()->where('user_id', $user->id)->count())->toBe(1);
});

it('lists recurring transactions ordered by next_due_date', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $account = $user->defaultAccount();

    foreach (['2026-07-01', '2026-06-01', '2026-08-01'] as $date) {
        RecurringTransaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'type' => 'expense',
            'amount' => 10,
            'description' => "due-$date",
            'frequency' => 'monthly',
            'next_due_date' => $date,
            'is_active' => true,
        ]);
    }

    $descs = collect($this->getJson('/api/v1/recurring-transactions')->json('data'))->pluck('description')->all();
    expect($descs)->toEqual(['due-2026-06-01', 'due-2026-07-01', 'due-2026-08-01']);
});

it('does not list other users\' recurring transactions', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();
    RecurringTransaction::create([
        'user_id' => $b->id,
        'account_id' => $b->defaultAccount()->id,
        'type' => 'expense',
        'amount' => 1,
        'description' => 'theirs',
        'frequency' => 'monthly',
        'next_due_date' => '2026-06-01',
        'is_active' => true,
    ]);

    Sanctum::actingAs($a);
    expect($this->getJson('/api/v1/recurring-transactions')->json('data'))->toBeEmpty();
});

it('updates a recurring transaction', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $rt = RecurringTransaction::create([
        'user_id' => $user->id,
        'account_id' => $user->defaultAccount()->id,
        'type' => 'expense',
        'amount' => 10,
        'description' => 'Orig',
        'frequency' => 'monthly',
        'next_due_date' => '2026-06-01',
        'is_active' => true,
    ]);

    $this->patchJson('/api/v1/recurring-transactions/'.$rt->id, [
        'amount' => 20,
        'description' => 'Updated',
        'isActive' => false,
    ])->assertOk()
        ->assertJsonPath('data.description', 'Updated')
        ->assertJsonPath('data.isActive', false);

    expect((float) $rt->fresh()->amount)->toBe(20.0);
});

it('soft-deletes via DELETE', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $rt = RecurringTransaction::create([
        'user_id' => $user->id,
        'account_id' => $user->defaultAccount()->id,
        'type' => 'expense',
        'amount' => 10,
        'description' => 'Bye',
        'frequency' => 'monthly',
        'next_due_date' => '2026-06-01',
        'is_active' => true,
    ]);

    $this->deleteJson('/api/v1/recurring-transactions/'.$rt->id)->assertOk();
    expect(RecurringTransaction::find($rt->id))->toBeNull();
    expect(RecurringTransaction::withTrashed()->find($rt->id))->not->toBeNull();
});

it('cannot mutate another user\'s recurring transaction', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $rt = RecurringTransaction::create([
        'user_id' => $owner->id,
        'account_id' => $owner->defaultAccount()->id,
        'type' => 'expense',
        'amount' => 10,
        'description' => 'Owned',
        'frequency' => 'monthly',
        'next_due_date' => '2026-06-01',
        'is_active' => true,
    ]);

    Sanctum::actingAs($other);
    $this->patchJson('/api/v1/recurring-transactions/'.$rt->id, ['description' => 'X'])->assertNotFound();
    $this->deleteJson('/api/v1/recurring-transactions/'.$rt->id)->assertNotFound();
});

it('validates store payload', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/recurring-transactions', [])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['type', 'amount', 'description', 'frequency', 'nextDueDate']]);

    $this->postJson('/api/v1/recurring-transactions', [
        'type' => 'expense',
        'amount' => 1,
        'description' => 'X',
        'frequency' => 'fortnightly',
        'nextDueDate' => '2026-06-01',
    ])->assertStatus(422)
        ->assertJsonStructure(['errors' => ['frequency']]);
});

it('skips the next occurrence per frequency step', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    foreach ([
        ['daily', '2026-06-01', '2026-06-02'],
        ['weekly', '2026-06-01', '2026-06-08'],
        ['biweekly', '2026-06-01', '2026-06-15'],
        ['monthly', '2026-06-01', '2026-07-01'],
        ['quarterly', '2026-06-01', '2026-09-01'],
        ['yearly', '2026-06-01', '2027-06-01'],
    ] as [$freq, $start, $expected]) {
        $rt = RecurringTransaction::create([
            'user_id' => $user->id,
            'account_id' => $user->defaultAccount()->id,
            'type' => 'expense',
            'amount' => 1,
            'description' => $freq,
            'frequency' => $freq,
            'next_due_date' => $start,
            'is_active' => true,
        ]);

        $this->postJson('/api/v1/recurring-transactions/'.$rt->id.'/skip-next')->assertOk();
        expect($rt->fresh()->next_due_date->toDateString())->toBe($expected);
    }
});

it('requires auth on all endpoints', function () {
    $this->getJson('/api/v1/recurring-transactions')->assertUnauthorized();
    $this->postJson('/api/v1/recurring-transactions', [])->assertUnauthorized();
});
