<?php

use App\Mcp\Tools\BudgetsCreateTool;
use App\Mcp\Tools\BudgetsListTool;
use App\Mcp\Tools\BudgetsStatusTool;
use App\Mcp\Tools\MonthlySummaryTool;
use App\Mcp\Tools\TransactionsCreateTool;
use App\Mcp\Tools\TransactionsListTool;
use App\Models\Account;
use App\Models\AiToolRun;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;

function callTool(string $toolClass, User $user, array $arguments): ResponseFactory
{
    test()->actingAs($user);

    return app($toolClass)->handle(new Request($arguments));
}

it('registers the finance tools with the PRD tool names', function () {
    expect(app(TransactionsCreateTool::class)->name())->toBe('transactions.create')
        ->and(app(TransactionsListTool::class)->name())->toBe('transactions.list')
        ->and(app(MonthlySummaryTool::class)->name())->toBe('reports.monthly_summary')
        ->and(app(BudgetsCreateTool::class)->name())->toBe('budgets.create')
        ->and(app(BudgetsListTool::class)->name())->toBe('budgets.list')
        ->and(app(BudgetsStatusTool::class)->name())->toBe('budgets.status');
});

it('creates transactions through the MCP tool and logs successful runs', function () {
    $user = User::factory()->create();
    $account = Account::create([
        'user_id' => $user->id,
        'name' => 'Checking',
        'type' => 'checking',
        'balance' => 1000,
        'currency' => 'USD',
        'is_active' => true,
    ]);
    Category::create([
        'user_id' => null,
        'name' => 'Food',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $response = callTool(TransactionsCreateTool::class, $user, [
        'amount' => 18.75,
        'type' => 'expense',
        'description' => 'Dinner',
        'category' => 'Food',
        'account_id' => $account->id,
        'date' => '2026-03-15',
    ]);

    expect($response->getStructuredContent())->toMatchArray([
        'description' => 'Dinner',
        'category' => 'Food',
        'account' => 'Checking',
    ]);

    $toolRun = AiToolRun::query()->latest('created_at')->first();
    $transaction = Transaction::query()->latest('created_at')->first();

    expect($toolRun)->not->toBeNull()
        ->and($toolRun->tool_name)->toBe('transactions.create')
        ->and($toolRun->status)->toBe('success')
        ->and($toolRun->output_payload['account'])->toBe('Checking')
        ->and($transaction)->not->toBeNull()
        ->and($transaction->description)->toBe('Dinner');
});

it('returns structured errors and logs failed tool runs', function () {
    $user = User::factory()->create();

    $response = callTool(TransactionsCreateTool::class, $user, [
        'amount' => 9.99,
        'type' => 'expense',
    ]);

    expect($response->getStructuredContent())->toMatchArray([
        'error' => 'The account id field is required.',
    ]);

    $toolRun = AiToolRun::query()->latest('created_at')->first();

    expect($toolRun)->not->toBeNull()
        ->and($toolRun->tool_name)->toBe('transactions.create')
        ->and($toolRun->status)->toBe('error')
        ->and($toolRun->output_payload['error'])->toContain('account id field is required');
});

it('rejects unauthenticated MCP tool execution', function () {
    $response = app(TransactionsListTool::class)->handle(new Request([
        'limit' => 5,
    ]));

    expect($response->getStructuredContent())->toMatchArray([
        'error' => 'Authentication required.',
    ]);

    expect(AiToolRun::query()->count())->toBe(0);
});

it('lists budgets and reports monthly summaries through MCP tools', function () {
    $user = User::factory()->create();
    $account = Account::create([
        'user_id' => $user->id,
        'name' => 'Checking',
        'type' => 'checking',
        'balance' => 1000,
        'currency' => 'CAD',
        'is_active' => true,
    ]);
    $category = Category::create([
        'user_id' => null,
        'name' => 'Food',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $budget = $user->budgets()->create([
        'name' => 'Food Budget - Mar 2026',
        'amount' => 500,
        'currency' => 'CAD',
        'period' => 'monthly',
        'period_type' => 'monthly',
        'period_year' => 2026,
        'period_month' => 3,
        'start_date' => '2026-03-01',
        'end_date' => '2026-03-31',
        'category_id' => $category->id,
        'is_active' => true,
    ]);

    Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'type' => 'expense',
        'amount' => 120,
        'currency' => 'CAD',
        'description' => 'Groceries',
        'transaction_date' => '2026-03-05',
    ]);

    $budgetsResponse = callTool(BudgetsListTool::class, $user, [
        'period' => 'monthly',
        'category' => 'Food',
        'active_only' => true,
    ]);

    $statusResponse = callTool(BudgetsStatusTool::class, $user, [
        'month' => '2026-03',
        'category' => 'Food',
    ]);

    $summaryResponse = callTool(MonthlySummaryTool::class, $user, [
        'month' => '2026-03',
    ]);

    expect($budgetsResponse->getStructuredContent()['budgets'][0]['name'])->toBe('Food Budget - Mar 2026')
        ->and($statusResponse->getStructuredContent())->toMatchArray([
            'budget_id' => $budget->id,
            'category' => 'Food',
        ])
        ->and($summaryResponse->getStructuredContent())->toMatchArray([
            'period' => '2026-03',
        ])
        ->and($summaryResponse->getStructuredContent()['category_breakdown'][0]['category'])->toBe('Food');

    expect(AiToolRun::query()->where('status', 'success')->count())->toBe(3);
});

it('creates budgets through MCP and reuses existing normalized periods', function () {
    $user = User::factory()->create();
    Category::create([
        'user_id' => null,
        'name' => 'Food',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $first = callTool(BudgetsCreateTool::class, $user, [
        'amount' => 425,
        'period' => 'monthly',
        'start_date' => '2026-03-09',
        'end_date' => '2026-03-12',
        'category' => 'Food',
    ]);

    $second = callTool(BudgetsCreateTool::class, $user, [
        'amount' => 425,
        'period' => 'monthly',
        'start_date' => '2026-03-01',
        'end_date' => '2026-03-31',
        'category' => 'Food',
    ]);

    expect($first->getStructuredContent()['name'])->toBe('Food Budget - Mar 2026')
        ->and($second->getStructuredContent()['name'])->toBe('Food Budget - Mar 2026');

    expect(Budget::query()->count())->toBe(1)
        ->and(AiToolRun::query()->where('tool_name', 'budgets.create')->count())->toBe(2);
});
