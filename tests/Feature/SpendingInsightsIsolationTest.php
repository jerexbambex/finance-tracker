<?php

use App\Jobs\GenerateAiInsights;
use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createInsightAccount(User $user, string $currency = 'USD'): Account
{
    return Account::create([
        'user_id' => $user->id,
        'name' => "{$currency} Checking",
        'type' => 'checking',
        'balance' => 0,
        'currency' => $currency,
        'is_active' => true,
    ]);
}

function createInsightCategory(User $user, string $name): Category
{
    return Category::create([
        'user_id' => $user->id,
        'name' => $name,
        'type' => 'expense',
        'color' => '#10b981',
        'is_active' => true,
    ]);
}

function createInsightTransaction(User $user, Account $account, ?Category $category, string $description, float $amount, $date): Transaction
{
    return Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $category?->id,
        'type' => 'expense',
        'amount' => $amount,
        'currency' => $account->currency,
        'description' => $description,
        'transaction_date' => $date,
    ]);
}

it('does not include transactions linked to accounts owned by another user', function () {
    $viewer = User::factory()->create();
    $other = User::factory()->create();

    createInsightAccount($viewer);
    $otherAccount = createInsightAccount($other, 'CAD');
    $viewerCategory = createInsightCategory($viewer, 'Groceries');

    createInsightTransaction($viewer, $otherAccount, $viewerCategory, 'Cross account old', 100, now()->subMonths(2));
    createInsightTransaction($viewer, $otherAccount, $viewerCategory, 'Cross account current', 500, now());

    $this->actingAs($viewer)
        ->get('/insights')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('insights/Index')
            ->where('insights.unusual_spending', [])
            ->where('insights.category_trends', [])
            ->where('insights.recurring_expenses', [])
            ->where('insights.spending_patterns', [])
            ->where('insights.savings_opportunities', [])
        );
});

it('does not expose category names owned by another user', function () {
    $viewer = User::factory()->create();
    $other = User::factory()->create();

    $viewerAccount = createInsightAccount($viewer);
    $otherCategory = createInsightCategory($other, 'Private Other User Category');

    createInsightTransaction($viewer, $viewerAccount, $otherCategory, 'Shared-looking charge', 50, now()->subDays(2));
    createInsightTransaction($viewer, $viewerAccount, $otherCategory, 'Shared-looking charge', 50, now()->subDay());

    $this->actingAs($viewer)
        ->get('/insights')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('insights/Index')
            ->where('insights.recurring_expenses.0.category', 'Uncategorized')
        );
});

it('does not expose another user category through budget opportunities', function () {
    $viewer = User::factory()->create();
    $other = User::factory()->create();

    $viewerAccount = createInsightAccount($viewer);
    $otherCategory = createInsightCategory($other, 'Other User Budget Category');

    Budget::create([
        'user_id' => $viewer->id,
        'category_id' => $otherCategory->id,
        'amount' => 10,
        'currency' => 'USD',
        'period_type' => 'monthly',
        'period_year' => now()->year,
        'period_month' => now()->month,
        'is_active' => true,
    ]);

    createInsightTransaction($viewer, $viewerAccount, $otherCategory, 'Budget leak attempt', 50, now());

    $this->actingAs($viewer)
        ->get('/insights')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('insights/Index')
            ->where('insights.savings_opportunities', [])
        );
});

it('does not include another user category name in the AI summary payload', function () {
    $viewer = User::factory()->create();
    $other = User::factory()->create();

    $viewerAccount = createInsightAccount($viewer);
    $otherCategory = createInsightCategory($other, 'Other User AI Category');

    createInsightTransaction($viewer, $viewerAccount, $otherCategory, 'AI summary leak attempt', 75, now());

    $job = new GenerateAiInsights($viewer);
    $method = new ReflectionMethod($job, 'prepareSpendingSummary');
    $method->setAccessible(true);

    $summary = $method->invoke($job);

    expect($summary['category_breakdown']->pluck('category')->all())
        ->not->toContain('Other User AI Category')
        ->toContain('Uncategorized');
});
