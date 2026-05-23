<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function makeCategory(User $user, string $bucket = 'needs', string $name = 'Rent'): Category
{
    return Category::create([
        'user_id' => $user->id,
        'name' => $name,
        'type' => 'expense',
        'budget_category' => $bucket,
        'is_active' => true,
    ]);
}

it('lists monthly budgets for the user', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $cat = makeCategory($user);

    Budget::create([
        'user_id' => $user->id,
        'category_id' => $cat->id,
        'amount' => 500,
        'period_type' => 'monthly',
        'period_year' => 2026,
        'period_month' => 5,
        'is_active' => true,
    ]);

    $rows = $this->getJson('/api/v1/budgets?year=2026&month=5')->assertOk()->json('data');
    expect($rows)->toHaveCount(1);
    expect((float) $rows[0]['amount'])->toBe(500.0);
    expect($rows[0]['year'])->toBe(2026);
    expect($rows[0]['month'])->toBe(5);
});

it('does not list other users\' budgets', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $cat = makeCategory($other);

    Budget::create([
        'user_id' => $other->id,
        'category_id' => $cat->id,
        'amount' => 100,
        'period_type' => 'monthly',
        'period_year' => 2026,
        'period_month' => 5,
        'is_active' => true,
    ]);

    Sanctum::actingAs($user);
    expect($this->getJson('/api/v1/budgets?year=2026&month=5')->json('data'))->toBeEmpty();
});

it('creates a budget and upserts on (category, year, month)', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $cat = makeCategory($user);

    $first = $this->postJson('/api/v1/budgets', [
        'categoryId' => $cat->id,
        'year' => 2026,
        'month' => 5,
        'amount' => 100,
    ])->assertStatus(201);

    $second = $this->postJson('/api/v1/budgets', [
        'categoryId' => $cat->id,
        'year' => 2026,
        'month' => 5,
        'amount' => 250,
    ])->assertOk();

    expect($first->json('data.id'))->toBe($second->json('data.id'));
    expect((float) $second->json('data.amount'))->toBe(250.0);
    expect(Budget::query()->where('user_id', $user->id)->count())->toBe(1);
});

it('rejects creating a budget for a category that doesn\'t exist', function () {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/v1/budgets', [
        'categoryId' => '00000000-0000-0000-0000-000000000000',
        'year' => 2026,
        'month' => 5,
        'amount' => 100,
    ])->assertStatus(422)
        ->assertJsonStructure(['errors' => ['categoryId']]);
});

it('rejects creating a budget for another user\'s category', function () {
    $user = User::factory()->create();
    $other = User::factory()->create();
    $cat = makeCategory($other);
    Sanctum::actingAs($user);

    $this->postJson('/api/v1/budgets', [
        'categoryId' => $cat->id,
        'year' => 2026,
        'month' => 5,
        'amount' => 100,
    ])->assertNotFound();
});

it('bulk upserts a list of budgets atomically', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $a = makeCategory($user, name: 'Rent');
    $b = makeCategory($user, name: 'Food');

    $this->postJson('/api/v1/budgets/bulk', [
        'budgets' => [
            ['categoryId' => $a->id, 'year' => 2026, 'month' => 5, 'amount' => 100],
            ['categoryId' => $b->id, 'year' => 2026, 'month' => 5, 'amount' => 200],
        ],
    ])->assertStatus(201);

    expect(Budget::query()->where('user_id', $user->id)->count())->toBe(2);

    // Re-run with new amounts — should upsert, not duplicate.
    $this->postJson('/api/v1/budgets/bulk', [
        'budgets' => [
            ['categoryId' => $a->id, 'year' => 2026, 'month' => 5, 'amount' => 999],
        ],
    ])->assertStatus(201);

    expect(Budget::query()->where('user_id', $user->id)->count())->toBe(2);
    expect((int) \DB::table('budgets')->where('category_id', $a->id)->value('amount'))->toBe(99900);
});

it('deletes a budget', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $cat = makeCategory($user);

    $budget = Budget::create([
        'user_id' => $user->id,
        'category_id' => $cat->id,
        'amount' => 100,
        'period_type' => 'monthly',
        'period_year' => 2026,
        'period_month' => 5,
        'is_active' => true,
    ]);

    $this->deleteJson('/api/v1/budgets/'.$budget->id)->assertOk();
    expect(Budget::find($budget->id))->toBeNull();
});

it('cannot delete another user\'s budget', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $cat = makeCategory($owner);
    $budget = Budget::create([
        'user_id' => $owner->id,
        'category_id' => $cat->id,
        'amount' => 100,
        'period_type' => 'monthly',
        'period_year' => 2026,
        'period_month' => 5,
        'is_active' => true,
    ]);

    Sanctum::actingAs($other);
    $this->deleteJson('/api/v1/budgets/'.$budget->id)->assertNotFound();
    expect(Budget::find($budget->id))->not->toBeNull();
});

it('reports spent and percentageUsed on each budget row', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    $cat = makeCategory($user);

    Budget::create([
        'user_id' => $user->id,
        'category_id' => $cat->id,
        'amount' => 100,
        'period_type' => 'monthly',
        'period_year' => 2026,
        'period_month' => 5,
        'is_active' => true,
    ]);

    $account = $user->defaultAccount();
    Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $cat->id,
        'type' => 'expense',
        'amount' => 40,
        'description' => 'rent partial',
        'transaction_date' => '2026-05-10',
    ]);

    $row = $this->getJson('/api/v1/budgets?year=2026&month=5')->json('data.0');
    expect((float) $row['spent'])->toBe(40.0);
    expect((float) $row['percentageUsed'])->toBe(40.0);
});
