<?php

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('creates a transaction and auto-provisions a default account when none exists', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    expect(Account::query()->where('user_id', $user->id)->count())->toBe(0);

    $response = $this->postJson('/api/v1/transactions', [
        'amount' => 12.50,
        'type' => 'expense',
        'description' => 'Lunch',
        'date' => '2026-05-23',
    ])->assertStatus(201);

    $response->assertJsonPath('data.amount', 12.5)
        ->assertJsonPath('data.type', 'expense')
        ->assertJsonPath('data.description', 'Lunch');

    expect(Account::query()->where('user_id', $user->id)->count())->toBe(1);
    expect(\DB::table('transactions')->where('id', $response->json('data.id'))->value('amount'))->toBe(1250);
});

it('reuses an existing active account if the user has one', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $account = $user->accounts()->create([
        'name' => 'Wallet',
        'type' => 'cash',
        'balance' => 0,
        'currency' => 'NGN',
        'is_active' => true,
    ]);

    $this->postJson('/api/v1/transactions', [
        'amount' => 1.00,
        'type' => 'expense',
        'description' => 'Test',
    ])->assertStatus(201)->assertJsonPath('data.accountId', $account->id);

    expect(Account::query()->where('user_id', $user->id)->count())->toBe(1);
});

it('returns 404 when storing a transaction for another user\'s account', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $otherAccount = $other->accounts()->create([
        'name' => 'Theirs',
        'type' => 'cash',
        'balance' => 0,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    Sanctum::actingAs($user);

    $this->postJson('/api/v1/transactions', [
        'amount' => 1.00,
        'type' => 'expense',
        'description' => 'Steal',
        'accountId' => $otherAccount->id,
    ])->assertNotFound();
});

it('updates an existing transaction', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $account = $user->defaultAccount();

    $tx = Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'type' => 'expense',
        'amount' => 10,
        'description' => 'Orig',
        'transaction_date' => '2026-05-01',
    ]);

    $this->patchJson('/api/v1/transactions/'.$tx->id, [
        'amount' => 12.34,
        'description' => 'Updated',
        'date' => '2026-05-02',
    ])->assertOk()
        ->assertJsonPath('data.amount', 12.34)
        ->assertJsonPath('data.description', 'Updated');

    expect(\DB::table('transactions')->where('id', $tx->id)->value('amount'))->toBe(1234);
});

it('deletes a transaction', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $account = $user->defaultAccount();

    $tx = Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'type' => 'expense',
        'amount' => 10,
        'description' => 'Bye',
        'transaction_date' => '2026-05-01',
    ]);

    $this->deleteJson('/api/v1/transactions/'.$tx->id)
        ->assertOk()
        ->assertJsonPath('success', true);

    expect(Transaction::find($tx->id))->toBeNull();
});

it('cannot read or mutate another user\'s transaction', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $account = $owner->defaultAccount();
    $tx = Transaction::create([
        'user_id' => $owner->id,
        'account_id' => $account->id,
        'type' => 'expense',
        'amount' => 10,
        'description' => 'Owned',
        'transaction_date' => '2026-05-01',
    ]);

    Sanctum::actingAs($other);

    $this->getJson('/api/v1/transactions/'.$tx->id)->assertNotFound();
    $this->patchJson('/api/v1/transactions/'.$tx->id, ['description' => 'X'])->assertNotFound();
    $this->deleteJson('/api/v1/transactions/'.$tx->id)->assertNotFound();
});

it('requires auth on transaction endpoints', function () {
    $this->getJson('/api/v1/transactions')->assertUnauthorized();
    $this->postJson('/api/v1/transactions', ['amount' => 1, 'type' => 'expense'])->assertUnauthorized();
});

it('validates amount and type on store', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/transactions', [])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['amount', 'type']]);

    $this->postJson('/api/v1/transactions', ['amount' => -5, 'type' => 'expense'])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['amount']]);

    $this->postJson('/api/v1/transactions', ['amount' => 5, 'type' => 'transfer'])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['type']]);
});
