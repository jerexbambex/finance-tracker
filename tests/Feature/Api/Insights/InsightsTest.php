<?php

use App\Models\Category;
use App\Models\Goal;
use App\Models\Transaction;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function insightsTx(User $user, int $amount, string $type, ?Category $cat, string $date): void
{
    Transaction::create([
        'user_id' => $user->id,
        'account_id' => $user->defaultAccount()->id,
        'category_id' => $cat?->id,
        'type' => $type,
        'amount' => $amount,
        'description' => 'tx',
        'transaction_date' => $date,
    ]);
}

it('returns this-month dashboard with income, expense, net, and recent', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $today = now()->toDateString();
    insightsTx($user, 1000, 'income', null, $today);
    insightsTx($user, 300, 'expense', null, $today);
    insightsTx($user, 200, 'expense', null, $today);

    $data = $this->getJson('/api/v1/insights/dashboard')->assertOk()->json('data');

    expect((float) $data['income'])->toBe(1000.0);
    expect((float) $data['expense'])->toBe(500.0);
    expect((float) $data['net'])->toBe(500.0);
    expect((float) $data['savingsRate'])->toBe(0.5);
    expect($data['recentTransactions'])->toHaveCount(3);
});

it('returns spending breakdown by category for an explicit range', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $a = Category::create(['user_id' => $user->id, 'name' => 'Food', 'type' => 'expense', 'is_active' => true, 'color' => '#ff0000']);
    $b = Category::create(['user_id' => $user->id, 'name' => 'Transport', 'type' => 'expense', 'is_active' => true, 'color' => '#00ff00']);

    insightsTx($user, 60, 'expense', $a, '2026-05-10');
    insightsTx($user, 40, 'expense', $a, '2026-05-12');
    insightsTx($user, 20, 'expense', $b, '2026-05-15');
    insightsTx($user, 999, 'expense', $a, '2026-04-15'); // out of range

    $data = $this->getJson('/api/v1/insights/spending-breakdown?startDate=2026-05-01&endDate=2026-05-31')
        ->assertOk()
        ->json('data');

    expect((float) $data['total'])->toBe(120.0);
    expect($data['items'])->toHaveCount(2);
    expect($data['items'][0]['name'])->toBe('Food');
    expect((float) $data['items'][0]['amount'])->toBe(100.0);
    expect((float) $data['items'][0]['share'])->toBe(round(100 / 120, 4));
});

it('returns a trend series for the requested number of months', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    // 3 months of income / expense.
    for ($i = 0; $i < 3; $i++) {
        $month = now()->subMonths($i);
        insightsTx($user, 100 + $i, 'income', null, $month->copy()->day(15)->toDateString());
        insightsTx($user, 50 + $i, 'expense', null, $month->copy()->day(20)->toDateString());
    }

    $series = $this->getJson('/api/v1/insights/trends?months=3')
        ->assertOk()
        ->json('data.series');

    expect($series)->toHaveCount(3);
    foreach ($series as $row) {
        expect($row)->toHaveKeys(['month', 'label', 'income', 'expense', 'net', 'savingsRate']);
    }
});

it('clamps months requested to 1..24', function () {
    Sanctum::actingAs(User::factory()->create());
    $this->getJson('/api/v1/insights/trends?months=50')
        ->assertStatus(422)
        ->assertJsonStructure(['errors' => ['months']]);
});

it('returns deterministic text insights from ai-summary', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    insightsTx($user, 1000, 'income', null, now()->toDateString());
    insightsTx($user, 400, 'expense', null, now()->toDateString());

    $insights = $this->getJson('/api/v1/insights/ai-summary')
        ->assertOk()
        ->json('data.insights');

    expect($insights)->toBeArray();
    expect(count($insights))->toBeGreaterThan(0);
    expect(implode(' ', $insights))->toContain('savings rate');
});

it('returns a no-transactions hint when the month is empty', function () {
    Sanctum::actingAs(User::factory()->create());

    $insights = $this->getJson('/api/v1/insights/ai-summary')->json('data.insights');
    expect(implode(' ', $insights))->toContain('No transactions');
});

it('dashboard includes active goals only', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    Goal::create(['user_id' => $user->id, 'name' => 'Active', 'target_amount' => 100, 'current_amount' => 10, 'is_active' => true, 'is_completed' => false]);
    Goal::create(['user_id' => $user->id, 'name' => 'Done', 'target_amount' => 100, 'current_amount' => 100, 'is_active' => true, 'is_completed' => true]);
    Goal::create(['user_id' => $user->id, 'name' => 'Hidden', 'target_amount' => 100, 'current_amount' => 0, 'is_active' => false, 'is_completed' => false]);

    $goals = $this->getJson('/api/v1/insights/dashboard')->json('data.activeGoals');
    $names = collect($goals)->pluck('name')->all();

    expect($names)->toEqual(['Active']);
});

it('requires authentication on all insight endpoints', function () {
    $this->getJson('/api/v1/insights/dashboard')->assertUnauthorized();
    $this->getJson('/api/v1/insights/spending-breakdown')->assertUnauthorized();
    $this->getJson('/api/v1/insights/trends')->assertUnauthorized();
    $this->getJson('/api/v1/insights/ai-summary')->assertUnauthorized();
});
