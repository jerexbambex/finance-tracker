<?php

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use App\Services\BudgetRollover;

function makeCategory(User $user, string $name = 'Food'): Category
{
    return Category::create(['name' => $name, 'type' => 'expense', 'is_active' => true, 'user_id' => $user->id]);
}

function makeBudget(User $user, Category $category, array $attributes = []): Budget
{
    return Budget::create(array_merge([
        'user_id' => $user->id,
        'category_id' => $category->id,
        'amount' => 500,
        'currency' => 'USD',
        'period_type' => 'monthly',
        'period_year' => 2026,
        'period_month' => 8,
    ], $attributes));
}

it('carries last months budgets into the current month', function () {
    $user = User::factory()->create();
    $food = makeCategory($user, 'Food');
    $rent = makeCategory($user, 'Rent');

    makeBudget($user, $food, ['amount' => 450.75]);
    makeBudget($user, $rent, ['amount' => 1200]);

    $created = app(BudgetRollover::class)->rollForward($user, \Illuminate\Support\Carbon::create(2026, 9, 1));

    expect($created)->toBe(2);

    $copies = $user->budgets()->where('period_year', 2026)->where('period_month', 9)->get();

    expect($copies)->toHaveCount(2)
        ->and($copies->firstWhere('category_id', $food->id)->amount)->toEqual(450.75)
        ->and($copies->firstWhere('category_id', $rent->id)->amount)->toEqual(1200);
});

it('leaves a category that is already budgeted in the target month alone', function () {
    $user = User::factory()->create();
    $food = makeCategory($user);

    makeBudget($user, $food, ['amount' => 500, 'period_month' => 8]);
    makeBudget($user, $food, ['amount' => 900, 'period_month' => 9]);

    $created = app(BudgetRollover::class)->rollForward($user, \Illuminate\Support\Carbon::create(2026, 9, 1));

    expect($created)->toBe(0)
        ->and($user->budgets()->where('period_month', 9)->first()->amount)->toEqual(900);
});

it('is idempotent across repeated runs', function () {
    $user = User::factory()->create();
    makeBudget($user, makeCategory($user));

    $rollover = app(BudgetRollover::class);
    $now = \Illuminate\Support\Carbon::create(2026, 9, 1);

    expect($rollover->rollForward($user, $now))->toBe(1)
        ->and($rollover->rollForward($user, $now))->toBe(0)
        ->and($user->budgets()->count())->toBe(2);
});

it('does not resurrect a copy the user deleted', function () {
    $user = User::factory()->create();
    makeBudget($user, makeCategory($user));

    $rollover = app(BudgetRollover::class);
    $now = \Illuminate\Support\Carbon::create(2026, 9, 1);

    $rollover->rollForward($user, $now);
    $user->budgets()->where('period_month', 9)->delete();

    expect($rollover->rollForward($user, $now))->toBe(0)
        ->and($user->budgets()->where('period_month', 9)->count())->toBe(0);
});

it('skips budgets opted out of rollover', function () {
    $user = User::factory()->create();
    makeBudget($user, makeCategory($user, 'Food'), ['auto_rollover' => false]);
    makeBudget($user, makeCategory($user, 'Rent'), ['auto_rollover' => true]);

    $created = app(BudgetRollover::class)->rollForward($user, \Illuminate\Support\Carbon::create(2026, 9, 1));

    expect($created)->toBe(1)
        ->and($user->budgets()->where('period_month', 9)->first()->category->name)->toBe('Rent');
});

it('carries a budget that opted out of rollover forward when copied by hand', function () {
    $user = User::factory()->create();
    makeBudget($user, makeCategory($user), ['auto_rollover' => false]);

    $created = app(BudgetRollover::class)->copy($user, 2026, 8, 2026, 9);

    expect($created)->toBe(1)
        ->and($user->budgets()->where('period_month', 9)->first()->auto_rollover)->toBeFalse();
});

it('carries yearly budgets into the new year', function () {
    $user = User::factory()->create();
    makeBudget($user, makeCategory($user), [
        'period_type' => 'yearly',
        'period_year' => 2025,
        'period_month' => null,
        'amount' => 6000,
    ]);

    $created = app(BudgetRollover::class)->rollForward($user, \Illuminate\Support\Carbon::create(2026, 9, 1));

    $copy = $user->budgets()->where('period_year', 2026)->where('period_type', 'yearly')->first();

    expect($created)->toBe(1)
        ->and($copy->period_month)->toBeNull()
        ->and($copy->amount)->toEqual(6000);
});

it('rolls forward over a year boundary', function () {
    $user = User::factory()->create();
    makeBudget($user, makeCategory($user), ['period_year' => 2025, 'period_month' => 12]);

    $created = app(BudgetRollover::class)->rollForward($user, \Illuminate\Support\Carbon::create(2026, 1, 15));

    expect($created)->toBe(1)
        ->and($user->budgets()->where('period_year', 2026)->where('period_month', 1)->exists())->toBeTrue();
});

it('never copies another users budgets', function () {
    $me = User::factory()->create();
    $other = User::factory()->create();
    makeBudget($other, makeCategory($other));

    expect(app(BudgetRollover::class)->rollForward($me, \Illuminate\Support\Carbon::create(2026, 9, 1)))->toBe(0)
        ->and($me->budgets()->count())->toBe(0);
});

it('copies a period on request from the budgets page', function () {
    $user = User::factory()->create();
    makeBudget($user, makeCategory($user), ['period_year' => now()->year, 'period_month' => now()->subMonthNoOverflow()->month]);

    $previous = now()->subMonthNoOverflow();

    $this->actingAs($user)->from('/budgets')->post('/budgets/copy', [
        'from_year' => $previous->year,
        'from_month' => $previous->month,
        'to_year' => now()->year,
        'to_month' => now()->month,
    ])->assertRedirect('/budgets')->assertSessionHas('success', 'Copied 1 budget.');

    expect($user->budgets()->where('period_month', now()->month)->exists())->toBeTrue();
});

it('rejects copying between a month and a year', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->from('/budgets')->post('/budgets/copy', [
        'from_year' => 2026,
        'from_month' => 8,
        'to_year' => 2026,
    ])->assertSessionHasErrors('to_month');
});

it('rejects copying a period onto itself', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->from('/budgets')->post('/budgets/copy', [
        'from_year' => 2026,
        'from_month' => 8,
        'to_year' => 2026,
        'to_month' => 8,
    ])->assertSessionHasErrors('to_month');
});

it('copying from a period with no budgets reports nothing to copy', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->from('/budgets')->post('/budgets/copy', [
        'from_year' => 2026,
        'from_month' => 8,
        'to_year' => 2026,
        'to_month' => 9,
    ])->assertSessionHas('success', 'Nothing new to copy from that period.');
});

it('the rollover command processes every user with due budgets', function () {
    $first = User::factory()->create();
    $second = User::factory()->create();
    makeBudget($first, makeCategory($first), ['period_year' => now()->year, 'period_month' => now()->subMonthNoOverflow()->month]);
    makeBudget($second, makeCategory($second), ['period_year' => now()->year, 'period_month' => now()->subMonthNoOverflow()->month]);

    $this->artisan('budgets:rollover')
        ->expectsOutputToContain('Rolled forward 2 budgets for 2 users.')
        ->assertSuccessful();

    expect($first->budgets()->where('period_month', now()->month)->exists())->toBeTrue()
        ->and($second->budgets()->where('period_month', now()->month)->exists())->toBeTrue();
});

it('the budgets page exposes the period a copy would pull from', function () {
    $user = User::factory()->create();
    makeBudget($user, makeCategory($user), ['period_year' => now()->year, 'period_month' => now()->subMonthNoOverflow()->month]);

    $this->actingAs($user)->get('/budgets?view=period')
        ->assertInertia(fn ($page) => $page
            ->where('previousPeriod.count', 1)
            ->where('previousPeriod.label', now()->subMonthNoOverflow()->format('F Y'))
        );
});
