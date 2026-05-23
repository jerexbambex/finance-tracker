<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Budgets\BudgetStatus;
use App\Services\Budgets\CreateBudget;
use App\Services\Budgets\ListBudgets;
use App\Services\Transactions\CreateTransaction;
use App\Services\Transactions\ListTransactions;
use App\Services\Transactions\MonthlySummary;
use Illuminate\Validation\ValidationException;

it('creates a transaction using a global category name and normalizes the date', function () {
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
        'user_id' => null,
        'name' => 'Food',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $result = app(CreateTransaction::class)->execute($user, [
        'amount' => 12.34,
        'type' => 'expense',
        'description' => 'Lunch',
        'date' => '2026-03-15 18:45:00',
        'category' => 'Food',
        'account_id' => $account->id,
    ]);

    expect($result['amount'])->toBe(12.34)
        ->and($result['currency'])->toBe('USD')
        ->and($result['category_id'])->toBe($category->id)
        ->and($result['category'])->toBe('Food')
        ->and($result['date'])->toBe('2026-03-15');

    $transaction = Transaction::findOrFail($result['id']);

    expect($transaction->getRawOriginal('amount'))->toBe(1234)
        ->and($transaction->transaction_date->format('Y-m-d'))->toBe('2026-03-15');
});

it('rejects transaction creation when the account is not owned by the user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $account = Account::create([
        'user_id' => $otherUser->id,
        'name' => 'Other Checking',
        'type' => 'checking',
        'balance' => 500,
        'currency' => 'USD',
        'is_active' => true,
    ]);

    expect(fn () => app(CreateTransaction::class)->execute($user, [
        'amount' => 10,
        'type' => 'expense',
        'account_id' => $account->id,
    ]))->toThrow(ValidationException::class);
});

it('creates monthly budgets with normalized dates and prevents duplicates', function () {
    $user = User::factory()->create();
    $category = Category::create([
        'user_id' => null,
        'name' => 'Food',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $service = app(CreateBudget::class);

    $first = $service->execute($user, [
        'amount' => 500,
        'start_date' => '2026-03-15',
        'end_date' => '2026-03-20',
        'period' => 'monthly',
        'category' => 'Food',
    ]);

    $second = $service->execute($user, [
        'amount' => 500,
        'start_date' => '2026-03-01',
        'end_date' => '2026-03-31',
        'period' => 'monthly',
        'category_id' => $category->id,
    ]);

    expect($first['budget_id'])->toBe($second['budget_id'])
        ->and($first['name'])->toBe('Food Budget - Mar 2026')
        ->and($first['start_date'])->toBe('2026-03-01')
        ->and($first['end_date'])->toBe('2026-03-31')
        ->and($first['period'])->toBe('monthly');

    expect(Budget::query()->count())->toBe(1);
});

it('lists budgets using period, active, and category filters', function () {
    $user = User::factory()->create();
    $food = Category::create([
        'user_id' => null,
        'name' => 'Food',
        'type' => 'expense',
        'is_active' => true,
    ]);
    $transport = Category::create([
        'user_id' => null,
        'name' => 'Transport',
        'type' => 'expense',
        'is_active' => true,
    ]);

    $user->budgets()->create([
        'name' => 'Food Budget - Mar 2026',
        'amount' => 400,
        'currency' => 'CAD',
        'period' => 'monthly',
        'period_type' => 'monthly',
        'period_year' => 2026,
        'period_month' => 3,
        'start_date' => '2026-03-01',
        'end_date' => '2026-03-31',
        'category_id' => $food->id,
        'is_active' => true,
    ]);

    $user->budgets()->create([
        'name' => 'Transport Budget - 2026',
        'amount' => 900,
        'currency' => 'CAD',
        'period' => 'yearly',
        'period_type' => 'yearly',
        'period_year' => 2026,
        'period_month' => null,
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
        'category_id' => $transport->id,
        'is_active' => false,
    ]);

    $result = app(ListBudgets::class)->execute($user, [
        'period' => 'monthly',
        'active_only' => true,
        'category' => 'Food',
    ]);

    expect($result['count'])->toBe(1)
        ->and($result['budgets'][0]['category'])->toBe('Food')
        ->and($result['budgets'][0]['period'])->toBe('monthly')
        ->and($result['budgets'][0]['is_active'])->toBeTrue();
});

it('computes budget status using month and category with dollar-based math', function () {
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
        'amount' => 120.25,
        'currency' => 'CAD',
        'description' => 'Groceries',
        'transaction_date' => '2026-03-10',
    ]);

    Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'type' => 'expense',
        'amount' => 25,
        'currency' => 'CAD',
        'description' => 'April groceries',
        'transaction_date' => '2026-04-02',
    ]);

    $result = app(BudgetStatus::class)->execute($user, [
        'month' => '2026-03',
        'category' => 'Food',
    ]);

    expect($result['budget_id'])->toBe($budget->id)
        ->and($result['period'])->toBe('monthly')
        ->and($result['spent'])->toBe(120.25)
        ->and($result['remaining'])->toBe(379.75)
        ->and($result['percent_used'])->toBe(24.05);
});

it('lists transactions and returns monthly summaries with scoped filters', function () {
    $user = User::factory()->create();
    $account = Account::create([
        'user_id' => $user->id,
        'name' => 'Checking',
        'type' => 'checking',
        'balance' => 1500,
        'currency' => 'CAD',
        'is_active' => true,
    ]);
    $food = Category::create([
        'user_id' => null,
        'name' => 'Food',
        'type' => 'expense',
        'is_active' => true,
    ]);
    $salary = Category::create([
        'user_id' => null,
        'name' => 'Salary',
        'type' => 'income',
        'is_active' => true,
    ]);

    Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $salary->id,
        'type' => 'income',
        'amount' => 3000,
        'currency' => 'CAD',
        'description' => 'Salary',
        'transaction_date' => '2026-03-01',
    ]);

    Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $food->id,
        'type' => 'expense',
        'amount' => 85.5,
        'currency' => 'CAD',
        'description' => 'Groceries',
        'transaction_date' => '2026-03-12',
    ]);

    Transaction::create([
        'user_id' => $user->id,
        'account_id' => $account->id,
        'category_id' => $food->id,
        'type' => 'expense',
        'amount' => 20,
        'currency' => 'CAD',
        'description' => 'Snacks',
        'transaction_date' => '2026-02-12',
    ]);

    $listed = app(ListTransactions::class)->execute($user, [
        'category' => 'Food',
        'start_date' => '2026-03-01',
        'end_date' => '2026-03-31',
        'limit' => 10,
    ]);

    $summary = app(MonthlySummary::class)->execute($user, '2026-03');

    expect($listed['count'])->toBe(1)
        ->and($listed['transactions'][0]['description'])->toBe('Groceries')
        ->and($summary['period'])->toBe('2026-03')
        ->and($summary['income'])->toBe(3000)
        ->and($summary['expenses'])->toBe(85.5)
        ->and($summary['net'])->toBe(2914.5)
        ->and($summary['transaction_count'])->toBe(2)
        ->and($summary['category_breakdown'][0]['category'])->toBe('Food')
        ->and($summary['category_breakdown'][0]['amount'])->toBe(85.5);
});
