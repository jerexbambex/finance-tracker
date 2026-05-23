<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function txFor(User $user, Category $cat, int $amount, string $type = 'expense', string $date = '2026-05-15'): void
{
    Transaction::create([
        'user_id' => $user->id,
        'account_id' => $user->defaultAccount()->id,
        'category_id' => $cat->id,
        'type' => $type,
        'amount' => $amount,
        'description' => 'tx',
        'transaction_date' => $date,
    ]);
}

it('returns 50/30/20 analysis with bucket totals and target ratios', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $needs = Category::create(['user_id' => $user->id, 'name' => 'Rent', 'type' => 'expense', 'budget_category' => 'needs', 'is_active' => true]);
    $wants = Category::create(['user_id' => $user->id, 'name' => 'Dining', 'type' => 'expense', 'budget_category' => 'wants', 'is_active' => true]);
    $savings = Category::create(['user_id' => $user->id, 'name' => 'Emergency', 'type' => 'expense', 'budget_category' => 'savings', 'is_active' => true]);
    $income = Category::create(['user_id' => $user->id, 'name' => 'Salary', 'type' => 'income', 'budget_category' => null, 'is_active' => true]);

    txFor($user, $income, 1000, 'income');
    txFor($user, $needs, 500);
    txFor($user, $wants, 200);
    txFor($user, $savings, 150);

    $data = $this->getJson('/api/v1/budgets/analysis?year=2026&month=5')
        ->assertOk()
        ->json('data');

    expect((float) $data['income'])->toBe(1000.0);
    expect((float) $data['buckets']['needs'])->toBe(500.0);
    expect((float) $data['buckets']['wants'])->toBe(200.0);
    expect((float) $data['buckets']['savings'])->toBe(150.0);
    expect((float) $data['targets']['needs'])->toBe(500.0);
    expect((float) $data['targets']['wants'])->toBe(300.0);
    expect((float) $data['targets']['savings'])->toBe(200.0);
    expect((float) $data['ratios']['needs'])->toBe(0.5);
});

it('reports alerts for budgets at or over 80% and 100%', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $a = Category::create(['user_id' => $user->id, 'name' => 'Ok', 'type' => 'expense', 'is_active' => true]);
    $b = Category::create(['user_id' => $user->id, 'name' => 'Warning', 'type' => 'expense', 'is_active' => true]);
    $c = Category::create(['user_id' => $user->id, 'name' => 'Exceeded', 'type' => 'expense', 'is_active' => true]);

    foreach ([$a, $b, $c] as $cat) {
        Budget::create([
            'user_id' => $user->id,
            'category_id' => $cat->id,
            'amount' => 100,
            'period_type' => 'monthly',
            'period_year' => 2026,
            'period_month' => 5,
            'is_active' => true,
        ]);
    }

    txFor($user, $a, 50);
    txFor($user, $b, 85);
    txFor($user, $c, 120);

    $alerts = $this->getJson('/api/v1/budgets/alerts?year=2026&month=5')->assertOk()->json('data');
    $byCat = collect($alerts)->keyBy('categoryId');

    expect($byCat->has($a->id))->toBeFalse(); // < 80% — not in alerts
    expect($byCat[$b->id]['status'])->toBe('warning');
    expect($byCat[$c->id]['status'])->toBe('exceeded');
});

it('defaults year and month to current when not provided', function () {
    Sanctum::actingAs(User::factory()->create());
    $this->getJson('/api/v1/budgets/analysis')->assertOk();
    $this->getJson('/api/v1/budgets/alerts')->assertOk();
});

it('rejects invalid month/year', function () {
    Sanctum::actingAs(User::factory()->create());
    $this->getJson('/api/v1/budgets?year=999&month=5')
        ->assertStatus(422);
    $this->getJson('/api/v1/budgets?year=2026&month=13')
        ->assertStatus(422);
});
