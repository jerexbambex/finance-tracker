<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use App\Models\User;
use App\Notifications\BudgetExceededNotification;
use App\Services\BudgetAlerts;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;

beforeEach(function () {
    Notification::fake();
    $this->travelTo('2026-11-10 12:00:00'); // a third of November gone
    $this->user = User::factory()->create();
    $this->account = Account::factory()->create(['user_id' => $this->user->id, 'currency' => 'NGN', 'balance' => 1_000_000]);
    $this->food = Category::factory()->create(['user_id' => $this->user->id, 'name' => 'Food']);
    $this->budget = Budget::create([
        'user_id' => $this->user->id, 'category_id' => $this->food->id, 'amount' => 1000, 'currency' => 'NGN',
        'period_type' => 'monthly', 'period_year' => 2026, 'period_month' => 11, 'is_active' => true,
    ]);
});

function spend(float $amount, ?string $categoryId = null, string $date = '2026-11-05'): void
{
    test()->actingAs(test()->user)->post(route('transactions.store'), [
        'account_id' => test()->account->id,
        'category_id' => $categoryId ?? test()->food->id,
        'type' => 'expense',
        'amount' => $amount,
        'description' => 'Spend',
        'transaction_date' => $date,
    ])->assertSessionHasNoErrors();
}

function sentLevels(): array
{
    return Notification::sent(test()->user, BudgetExceededNotification::class)->pluck('level')->all();
}

test('no alert while spending is on track', function () {
    spend(300); // 30% used, a third of the month gone

    Notification::assertNothingSent();
});

test('warns when the pace would overshoot the budget, before the limit is hit', function () {
    spend(500); // 50% used after a third of the month → ~₦1,500 projected

    expect(sentLevels())->toBe([BudgetAlerts::PACE]);
    $notification = Notification::sent($this->user, BudgetExceededNotification::class)->first();
    expect($notification->toArray($this->user)['message'])->toContain('current pace')->toContain('₦');
});

test('each level is sent once, not on every transaction', function () {
    spend(500);  // pace
    spend(100);  // still pace: nothing new
    spend(250);  // 85%: warning
    spend(10);   // still warning: nothing new
    spend(200);  // over
    spend(50);   // still over: nothing new

    expect(sentLevels())->toBe([BudgetAlerts::PACE, BudgetAlerts::WARNING, BudgetAlerts::EXCEEDED]);
});

test('jumping straight past the limit sends only the over-budget alert', function () {
    spend(1200);

    expect(sentLevels())->toBe([BudgetAlerts::EXCEEDED]);
});

test('after an edit brings spending back down, crossing the limit again re-alerts', function () {
    spend(1200);
    $transaction = Transaction::latest('id')->first();

    $this->actingAs($this->user)->put(route('transactions.update', $transaction), [
        'account_id' => $this->account->id, 'category_id' => $this->food->id, 'type' => 'expense',
        'amount' => 100, 'description' => 'Spend', 'transaction_date' => '2026-11-05',
    ])->assertSessionHasNoErrors();

    expect($this->budget->fresh()->alert_level)->toBe(BudgetAlerts::PACE); // floors at pace, never below

    spend(1000);

    expect(sentLevels())->toBe([BudgetAlerts::EXCEEDED, BudgetAlerts::EXCEEDED]);
});

test('too early in the month to project: no pace alert', function () {
    $this->travelTo('2026-11-03 12:00:00');
    spend(600, date: '2026-11-02'); // 60% used on day 3, but projections this early are noise

    Notification::assertNothingSent();
});

test('importing a statement checks budgets once, after the rows are saved', function () {
    $csv = "Date,Description,Amount,Type,Category\n"
        ."2026-11-02,Lunch,600,expense,Food\n"
        ."2026-11-03,Dinner,600,expense,Food\n";

    $this->actingAs($this->user)->post(route('import.transactions'), [
        'file' => UploadedFile::fake()->createWithContent('s.csv', $csv),
        'account_id' => $this->account->id,
    ]);

    expect(sentLevels())->toBe([BudgetAlerts::EXCEEDED]);
});

test('recurring payments trigger alerts too', function () {
    RecurringTransaction::create([
        'user_id' => $this->user->id, 'account_id' => $this->account->id, 'category_id' => $this->food->id,
        'type' => 'expense', 'amount' => 1100, 'description' => 'Meal plan', 'frequency' => 'monthly',
        'next_due_date' => '2026-11-10', 'is_active' => true,
    ]);

    $this->artisan('transactions:process-recurring')->assertSuccessful();

    expect(sentLevels())->toBe([BudgetAlerts::EXCEEDED]);
});

test('moving an expense to another category lowers the old budget\'s level', function () {
    spend(900); // warning on Food
    $other = Category::factory()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->post(route('transactions.bulk-categorize'), [
        'ids' => [Transaction::latest('id')->value('id')],
        'category_id' => $other->id,
    ]);

    expect($this->budget->fresh()->alert_level)->toBe(BudgetAlerts::PACE);
});
