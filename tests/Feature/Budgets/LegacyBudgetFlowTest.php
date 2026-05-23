<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Carbon::setTestNow('2026-03-15 12:00:00');
});

afterEach(function () {
    Carbon::setTestNow();
});

it('stores legacy monthly budgets and populates normalized budget fields', function () {
    $user = User::factory()->create();
    $category = Category::create([
        'user_id' => $user->id,
        'name' => 'Food',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->post(route('budgets.store'), [
            'category_id' => $category->id,
            'amount' => 250,
            'period_type' => 'monthly',
            'period_year' => 2026,
            'period_month' => 3,
        ])
        ->assertRedirect(route('budgets.index'));

    $budget = Budget::query()->sole();

    expect($budget->category_id)->toBe($category->id)
        ->and($budget->name)->toBe('Food Budget - Mar 2026')
        ->and($budget->currency)->toBe('CAD')
        ->and($budget->period)->toBe('monthly')
        ->and($budget->period_type)->toBe('monthly')
        ->and($budget->period_year)->toBe(2026)
        ->and($budget->period_month)->toBe(3)
        ->and($budget->start_date->format('Y-m-d'))->toBe('2026-03-01')
        ->and($budget->end_date->format('Y-m-d'))->toBe('2026-03-31');
});

it('updates legacy budgets without leaving normalized fields stale', function () {
    $user = User::factory()->create();
    $food = Category::create([
        'user_id' => $user->id,
        'name' => 'Food',
        'type' => 'expense',
        'is_active' => true,
    ]);
    $transport = Category::create([
        'user_id' => $user->id,
        'name' => 'Transport',
        'type' => 'expense',
        'is_active' => true,
    ]);
    $budget = $user->budgets()->create([
        'category_id' => $food->id,
        'name' => 'Food Budget - Mar 2026',
        'amount' => 250,
        'currency' => 'CAD',
        'period' => 'monthly',
        'period_type' => 'monthly',
        'period_year' => 2026,
        'period_month' => 3,
        'start_date' => '2026-03-01',
        'end_date' => '2026-03-31',
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->put(route('budgets.update', $budget), [
            'category_id' => $transport->id,
            'amount' => 300,
            'period_type' => 'yearly',
            'period_year' => 2026,
            'period_month' => null,
        ])
        ->assertRedirect(route('budgets.index'));

    $budget->refresh();

    expect($budget->category_id)->toBe($transport->id)
        ->and($budget->name)->toBe('Transport Budget - 2026')
        ->and($budget->period)->toBe('yearly')
        ->and($budget->period_type)->toBe('yearly')
        ->and($budget->period_month)->toBeNull()
        ->and($budget->start_date->format('Y-m-d'))->toBe('2026-01-01')
        ->and($budget->end_date->format('Y-m-d'))->toBe('2026-12-31');
});

it('applies budget recommendations idempotently for the current month', function () {
    $user = User::factory()->create();
    $category = Category::create([
        'user_id' => $user->id,
        'name' => 'Food',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $firstResponse = $this->actingAs($user)
        ->from(route('budgets.recommendations'))
        ->post(route('budgets.recommendations.apply'), [
            'category_id' => $category->id,
            'amount' => 180,
        ]);

    $secondResponse = $this->actingAs($user)
        ->from(route('budgets.recommendations'))
        ->post(route('budgets.recommendations.apply'), [
            'category_id' => $category->id,
            'amount' => 180,
        ]);

    $firstResponse->assertRedirect(route('budgets.recommendations'));
    $secondResponse->assertRedirect(route('budgets.recommendations'));

    expect(Budget::query()->count())->toBe(1);

    $budget = Budget::query()->sole();

    expect($budget->name)->toBe('Food Budget - Mar 2026')
        ->and($budget->period)->toBe('monthly')
        ->and($budget->start_date->format('Y-m-d'))->toBe('2026-03-01')
        ->and($budget->end_date->format('Y-m-d'))->toBe('2026-03-31');
});

it('renders savings opportunities from current monthly budgets in insights', function () {
    $user = User::factory()->create();
    $account = Account::create([
        'user_id' => $user->id,
        'name' => 'Checking',
        'type' => 'checking',
        'balance' => 1000,
        'currency' => 'USD',
        'is_active' => true,
    ]);
    $category = Category::create([
        'user_id' => $user->id,
        'name' => 'Food',
        'type' => 'expense',
        'is_active' => true,
    ]);
    $user->budgets()->create([
        'category_id' => $category->id,
        'name' => 'Food Budget - Mar 2026',
        'amount' => 100,
        'currency' => 'USD',
        'period' => 'monthly',
        'period_type' => 'monthly',
        'period_year' => 2026,
        'period_month' => 3,
        'start_date' => '2026-03-01',
        'end_date' => '2026-03-31',
        'is_active' => true,
    ]);
    Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'type' => 'expense',
        'amount' => 140,
        'currency' => 'USD',
        'description' => 'Groceries',
        'transaction_date' => '2026-03-10',
    ]);

    $this->actingAs($user)
        ->get(route('insights.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('insights/Index')
            ->has('insights.savings_opportunities', 1)
            ->where('insights.savings_opportunities.0.category', 'Food')
            ->where('insights.savings_opportunities.0.budgeted', 100)
            ->where('insights.savings_opportunities.0.spent', 140)
        );
});
