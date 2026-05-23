<?php

use App\Models\Transaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('bulk creates transactions in one shot', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/v1/transactions/bulk', [
        'transactions' => [
            ['amount' => 1.50, 'type' => 'expense', 'description' => 'a'],
            ['amount' => 2.00, 'type' => 'income', 'description' => 'b'],
            ['amount' => 3.25, 'type' => 'expense', 'description' => 'c'],
        ],
    ])->assertStatus(201);

    expect($response->json('data.created'))->toBe(3);
    expect(Transaction::query()->where('user_id', $user->id)->count())->toBe(3);
});

it('rolls back the whole bulk import if any row is invalid', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/transactions/bulk', [
        'transactions' => [
            ['amount' => 1.50, 'type' => 'expense', 'description' => 'ok'],
            ['amount' => 'bad', 'type' => 'expense', 'description' => 'broken'],
        ],
    ])->assertStatus(422);

    expect(Transaction::query()->where('user_id', $user->id)->count())->toBe(0);
});

it('rejects empty bulk payload', function () {
    Sanctum::actingAs(User::factory()->create());
    $this->postJson('/api/v1/transactions/bulk', ['transactions' => []])
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['transactions']]);
});

it('returns income/expense/net totals from /transactions/summary', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $account = $user->defaultAccount();

    foreach ([
        ['income', 100, '2026-05-01'],
        ['income', 50, '2026-05-15'],
        ['expense', 30, '2026-05-10'],
        ['expense', 20, '2026-04-25'], // outside window
    ] as [$type, $amount, $date]) {
        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'type' => $type,
            'amount' => $amount,
            'description' => 'x',
            'transaction_date' => $date,
        ]);
    }

    $body = $this->getJson('/api/v1/transactions/summary?startDate=2026-05-01&endDate=2026-05-31')
        ->assertOk()
        ->json('data');

    // JSON encoders collapse 150.0 to 150 on the wire; the Flutter client
    // parses via `(x as num).toDouble()` so either representation is fine.
    expect((float) $body['income'])->toBe(150.0);
    expect((float) $body['expense'])->toBe(30.0);
    expect((float) $body['net'])->toBe(120.0);
    expect($body['transactionCount'])->toBe(3);
});

it('returns recent transactions newest-first', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $account = $user->defaultAccount();

    foreach (['2026-05-01', '2026-05-03', '2026-05-02'] as $date) {
        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'type' => 'expense',
            'amount' => 1,
            'description' => $date,
            'transaction_date' => $date,
        ]);
    }

    $dates = collect($this->getJson('/api/v1/transactions/recent?limit=2')
        ->assertOk()
        ->json('data'))->pluck('description')->all();

    expect($dates)->toEqual(['2026-05-03', '2026-05-02']);
});

it('clamps the recent limit between 1 and 100', function () {
    Sanctum::actingAs(User::factory()->create());

    // No assertion needed beyond not failing — clamp is silent.
    $this->getJson('/api/v1/transactions/recent?limit=9999')->assertOk();
    $this->getJson('/api/v1/transactions/recent?limit=-5')->assertOk();
});
