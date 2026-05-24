<?php

use App\Models\RecurringTransaction;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

it('upserts a recurring transaction via /sync/push', function () {
    $user = User::factory()->premium()->create();
    Sanctum::actingAs($user);

    $clientId = (string) Str::uuid();
    $this->postJson('/api/v1/sync/push', [
        'recurringTransactions' => [[
            'clientId' => $clientId,
            'updatedAt' => now()->toIso8601String(),
            'type' => 'expense',
            'amount' => 15.99,
            'description' => 'Netflix',
            'frequency' => 'monthly',
            'nextDueDate' => '2026-06-01',
            'isActive' => true,
        ]],
    ])->assertOk()
        ->assertJsonPath('data.applied.recurringTransactions.0.description', 'Netflix');

    expect(RecurringTransaction::query()->where('client_id', $clientId)->exists())->toBeTrue();
});

it('returns recurring transactions via /sync/pull', function () {
    $user = User::factory()->premium()->create();
    Sanctum::actingAs($user);

    RecurringTransaction::create([
        'user_id' => $user->id,
        'account_id' => $user->defaultAccount()->id,
        'client_id' => (string) Str::uuid(),
        'type' => 'expense',
        'amount' => 10,
        'description' => 'Rent',
        'frequency' => 'monthly',
        'next_due_date' => '2026-06-01',
        'is_active' => true,
    ]);

    $data = $this->getJson('/api/v1/sync/pull')->assertOk()->json('data');
    expect($data['recurringTransactions'])->toHaveCount(1);
    expect($data['recurringTransactions'][0]['description'])->toBe('Rent');
});

it('includes a recurringTransactions counter in /sync/status', function () {
    $user = User::factory()->premium()->create();
    Sanctum::actingAs($user);

    RecurringTransaction::create([
        'user_id' => $user->id,
        'account_id' => $user->defaultAccount()->id,
        'client_id' => (string) Str::uuid(),
        'type' => 'expense',
        'amount' => 10,
        'description' => 'X',
        'frequency' => 'monthly',
        'next_due_date' => '2026-06-01',
        'is_active' => true,
    ]);

    $status = $this->getJson('/api/v1/sync/status')->assertOk()->json('data');
    expect($status['counts']['recurringTransactions'])->toBe(1);
});

it('returns deleted client_ids for soft-deleted recurring rows on pull', function () {
    $user = User::factory()->premium()->create();
    Sanctum::actingAs($user);

    $clientId = (string) Str::uuid();
    $rt = RecurringTransaction::create([
        'user_id' => $user->id,
        'account_id' => $user->defaultAccount()->id,
        'client_id' => $clientId,
        'type' => 'expense',
        'amount' => 10,
        'description' => 'gone',
        'frequency' => 'monthly',
        'next_due_date' => '2026-06-01',
        'is_active' => true,
    ]);
    $rt->delete();

    $data = $this->getJson('/api/v1/sync/pull')->assertOk()->json('data');
    expect($data['deletedIds']['recurringTransactions'])->toContain($clientId);
});
