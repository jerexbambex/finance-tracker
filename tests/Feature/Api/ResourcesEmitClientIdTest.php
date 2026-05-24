<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\Goal;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;

/**
 * PR 7e.1: every syncable resource must emit `clientId`, `updatedAt`,
 * and `deletedAt` (where applicable) so the mobile pull path can
 * round-trip rows by their stable sync identity rather than the
 * Eloquent UUID primary key.
 */
it('TransactionResource emits clientId / updatedAt / deletedAt', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $account = $user->defaultAccount();
    $clientId = (string) Str::uuid();

    Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'client_id' => $clientId,
        'type' => 'expense',
        'amount' => 10,
        'description' => 't',
        'transaction_date' => '2026-05-24',
    ]);

    $row = $this->getJson('/api/v1/transactions/recent?limit=1')
        ->assertOk()
        ->json('data.0');

    expect($row)->toHaveKeys(['clientId', 'updatedAt', 'deletedAt']);
    expect($row['clientId'])->toBe($clientId);
    expect($row['deletedAt'])->toBeNull();
});

it('CategoryResource emits clientId / updatedAt / deletedAt', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $clientId = (string) Str::uuid();

    Category::create([
        'user_id' => $user->id,
        'client_id' => $clientId,
        'name' => 'Coffee',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $row = collect($this->getJson('/api/v1/categories')->json('data'))
        ->firstWhere('name', 'Coffee');

    expect($row)->toHaveKeys(['clientId', 'updatedAt', 'deletedAt']);
    expect($row['clientId'])->toBe($clientId);
});

it('BudgetResource emits clientId / updatedAt / deletedAt', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $cat = Category::create(['user_id' => $user->id, 'name' => 'Rent', 'type' => 'expense', 'is_active' => true]);
    $clientId = (string) Str::uuid();

    Budget::create([
        'user_id' => $user->id,
        'category_id' => $cat->id,
        'client_id' => $clientId,
        'amount' => 500,
        'period_type' => 'monthly',
        'period_year' => 2026,
        'period_month' => 5,
        'is_active' => true,
    ]);

    $row = collect($this->getJson('/api/v1/budgets?year=2026&month=5')->json('data'))->first();
    expect($row)->toHaveKeys(['clientId', 'updatedAt', 'deletedAt']);
    expect($row['clientId'])->toBe($clientId);
});

it('GoalResource emits clientId / updatedAt / deletedAt', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $clientId = (string) Str::uuid();

    Goal::create([
        'user_id' => $user->id,
        'client_id' => $clientId,
        'name' => 'Trip',
        'target_amount' => 1000,
        'current_amount' => 0,
        'is_active' => true,
        'is_completed' => false,
    ]);

    $row = collect($this->getJson('/api/v1/savings-goals')->json('data'))->first();
    expect($row)->toHaveKeys(['clientId', 'updatedAt', 'deletedAt']);
    expect($row['clientId'])->toBe($clientId);
});

it('RecurringTransactionResource emits clientId / updatedAt / deletedAt', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $clientId = (string) Str::uuid();

    RecurringTransaction::create([
        'user_id' => $user->id,
        'account_id' => $user->defaultAccount()->id,
        'client_id' => $clientId,
        'type' => 'expense',
        'amount' => 10,
        'description' => 'Netflix',
        'frequency' => 'monthly',
        'next_due_date' => '2026-06-01',
        'is_active' => true,
    ]);

    $row = collect($this->getJson('/api/v1/recurring-transactions')->json('data'))->first();
    expect($row)->toHaveKeys(['clientId', 'updatedAt', 'deletedAt']);
    expect($row['clientId'])->toBe($clientId);
});

it('emits clientId on the sync/pull payload too', function () {
    $user = User::factory()->premium()->create();
    Sanctum::actingAs($user);
    $clientId = (string) Str::uuid();

    Category::create([
        'user_id' => $user->id,
        'client_id' => $clientId,
        'name' => 'X',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $row = collect($this->getJson('/api/v1/sync/pull')->json('data.categories'))
        ->firstWhere('clientId', $clientId);

    expect($row)->not->toBeNull();
});
