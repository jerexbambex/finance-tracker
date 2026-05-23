<?php

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function seedTx(User $user, array $overrides = []): Transaction
{
    $account = $user->defaultAccount();

    return Transaction::create(array_merge([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'type' => 'expense',
        'amount' => 10,
        'description' => 'desc',
        'transaction_date' => '2026-05-01',
    ], $overrides));
}

it('returns paginated transactions in the canonical envelope', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    for ($i = 0; $i < 25; $i++) {
        seedTx($user, ['description' => "tx-$i"]);
    }

    $response = $this->getJson('/api/v1/transactions?page=2&limit=10')->assertOk();

    expect($response->json('pagination'))->toMatchArray([
        'page' => 2,
        'limit' => 10,
        'total' => 25,
        'totalPages' => 3,
    ]);
    expect($response->json('data'))->toHaveCount(10);
});

it('filters by startDate and endDate (inclusive)', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    seedTx($user, ['transaction_date' => '2026-01-15', 'description' => 'jan']);
    seedTx($user, ['transaction_date' => '2026-03-15', 'description' => 'mar']);
    seedTx($user, ['transaction_date' => '2026-05-15', 'description' => 'may']);

    $descs = collect($this->getJson('/api/v1/transactions?startDate=2026-02-01&endDate=2026-04-30')
        ->json('data'))->pluck('description')->all();

    expect($descs)->toEqual(['mar']);
});

it('filters by type', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    seedTx($user, ['type' => 'income', 'description' => 'i']);
    seedTx($user, ['type' => 'expense', 'description' => 'e']);

    $income = $this->getJson('/api/v1/transactions?type=income')->json('data');
    expect($income)->toHaveCount(1);
    expect($income[0]['type'])->toBe('income');
});

it('filters by categoryId', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $cat = Category::create([
        'user_id' => $user->id,
        'name' => 'Food',
        'type' => 'expense',
        'is_active' => true,
    ]);

    seedTx($user, ['category_id' => $cat->id, 'description' => 'in-cat']);
    seedTx($user, ['description' => 'no-cat']);

    $rows = $this->getJson('/api/v1/transactions?categoryId='.$cat->id)->json('data');
    expect($rows)->toHaveCount(1);
    expect($rows[0]['description'])->toBe('in-cat');
});

it('search matches description and notes', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    seedTx($user, ['description' => 'Aso ebi dues']);
    seedTx($user, ['description' => 'Rent', 'notes' => 'aso related stuff']);
    seedTx($user, ['description' => 'Lunch']);

    $rows = $this->getJson('/api/v1/transactions?search=aso')->json('data');
    expect($rows)->toHaveCount(2);
});

it('only returns the authenticated user\'s transactions', function () {
    $a = User::factory()->create();
    $b = User::factory()->create();
    seedTx($a, ['description' => 'mine']);
    seedTx($b, ['description' => 'theirs']);

    Sanctum::actingAs($a);
    $descs = collect($this->getJson('/api/v1/transactions')->json('data'))->pluck('description')->all();
    expect($descs)->toEqual(['mine']);
});

it('rejects an invalid limit', function () {
    Sanctum::actingAs(User::factory()->create());
    $this->getJson('/api/v1/transactions?limit=9999')
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['limit']]);
});

it('rejects endDate before startDate', function () {
    Sanctum::actingAs(User::factory()->create());
    $this->getJson('/api/v1/transactions?startDate=2026-05-01&endDate=2026-04-01')
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['endDate']]);
});
