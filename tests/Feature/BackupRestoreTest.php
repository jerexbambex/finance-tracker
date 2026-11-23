<?php

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Goal;
use App\Models\GoalContribution;
use App\Models\RecurringTransaction;
use App\Models\Reminder;
use App\Models\Tag;
use App\Models\Transaction;
use App\Models\TransactionSplit;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

/**
 * A workspace touching every section of the backup: parent/child
 * categories, a transfer pair, a split, a tag, a budget, a goal with a
 * contribution, a recurring transaction and a reminder.
 */
function seedWorkspace(User $user): void
{
    $checking = Account::factory()->create(['user_id' => $user->id, 'name' => 'Checking', 'balance' => 0, 'currency' => 'USD']);
    $savings = Account::factory()->create(['user_id' => $user->id, 'name' => 'Savings', 'balance' => 0, 'currency' => 'USD']);

    $food = Category::factory()->create(['user_id' => $user->id, 'name' => 'Food', 'type' => 'expense']);
    $groceries = Category::factory()->create(['user_id' => $user->id, 'name' => 'Groceries', 'type' => 'expense', 'parent_id' => $food->id]);
    $salary = Category::factory()->create(['user_id' => $user->id, 'name' => 'Salary', 'type' => 'income']);

    Transaction::factory()->create(['user_id' => $user->id, 'account_id' => $checking->id, 'category_id' => $salary->id, 'type' => 'income', 'amount' => 3000, 'currency' => 'USD']);
    $shop = Transaction::factory()->create(['user_id' => $user->id, 'account_id' => $checking->id, 'category_id' => $food->id, 'type' => 'expense', 'amount' => 120.5, 'currency' => 'USD']);
    TransactionSplit::create(['transaction_id' => $shop->id, 'category_id' => $groceries->id, 'amount' => 100.5]);
    TransactionSplit::create(['transaction_id' => $shop->id, 'category_id' => $food->id, 'amount' => 20]);

    $tag = Tag::create(['user_id' => $user->id, 'name' => 'weekly', 'color' => '#ff0000']);
    $shop->tags()->attach($tag->id);

    $group = (string) Str::uuid();
    foreach ([[$checking, 'out'], [$savings, 'in']] as [$account, $direction]) {
        Transaction::factory()->create([
            'user_id' => $user->id, 'account_id' => $account->id, 'category_id' => null, 'type' => 'transfer',
            'transfer_group_id' => $group, 'transfer_direction' => $direction, 'amount' => 500, 'currency' => 'USD',
        ]);
    }

    Budget::create(['user_id' => $user->id, 'category_id' => $food->id, 'amount' => 400, 'currency' => 'USD', 'period_type' => 'monthly', 'period_year' => 2026, 'period_month' => 10, 'is_active' => true, 'auto_rollover' => true]);

    $goal = Goal::create(['user_id' => $user->id, 'name' => 'Holiday', 'target_amount' => 1000, 'current_amount' => 0, 'currency' => 'USD', 'target_date' => '2027-06-01', 'is_active' => true]);
    GoalContribution::create(['goal_id' => $goal->id, 'user_id' => $user->id, 'amount' => 250, 'contribution_date' => '2026-10-01']);

    RecurringTransaction::create(['user_id' => $user->id, 'account_id' => $checking->id, 'category_id' => $salary->id, 'type' => 'income', 'amount' => 3000, 'description' => 'Pay', 'frequency' => 'monthly', 'next_due_date' => '2026-11-01', 'is_active' => true]);
    Reminder::create(['user_id' => $user->id, 'category_id' => $food->id, 'title' => 'Rent', 'amount' => 1150, 'due_date' => '2026-11-03', 'is_recurring' => true, 'frequency' => 'monthly']);
}

function exportBackup($test, User $user): string
{
    return $test->actingAs($user)->get('/export/all-data')->assertOk()->streamedContent();
}

function restoreBackup($test, User $user, string $json)
{
    return $test->actingAs($user)->post('/settings/data-management/import', [
        'file' => UploadedFile::fake()->createWithContent('backup.json', $json),
    ]);
}

/** Every user-owned row in a comparable form, without IDs or timestamps. */
function workspaceSnapshot(User $user): array
{
    $user->refresh();

    return [
        'accounts' => Account::where('user_id', $user->id)->orderBy('name')->get()->map(fn ($a) => [$a->name, $a->balance, $a->currency])->all(),
        'categories' => Category::where('user_id', $user->id)->orderBy('name')->get()->map(fn ($c) => [$c->name, $c->type, Category::find($c->parent_id)?->name])->all(),
        'transactions' => Transaction::where('user_id', $user->id)->with('splits', 'tags', 'account', 'category')->orderBy('amount')->orderBy('transfer_direction')->get()
            ->map(fn ($t) => [$t->type, $t->amount, $t->account->name, $t->category?->name, $t->transfer_direction, $t->transaction_date->toDateString(), $t->splits->sortBy('amount')->map(fn ($s) => [$s->amount, $s->category_id ? Category::find($s->category_id)->name : null])->values()->all(), $t->tags->pluck('name')->all()])->all(),
        'budgets' => Budget::where('user_id', $user->id)->with('category')->get()->map(fn ($b) => [$b->category->name, $b->amount, $b->period_month, $b->auto_rollover])->all(),
        'goals' => Goal::where('user_id', $user->id)->get()->map(fn ($g) => [$g->name, $g->target_amount, $g->current_amount, $g->target_date->toDateString()])->all(),
        'contributions' => GoalContribution::where('user_id', $user->id)->get()->map(fn ($c) => [$c->amount, $c->contribution_date->toDateString()])->all(),
        'recurring' => RecurringTransaction::where('user_id', $user->id)->with('account')->get()->map(fn ($r) => [$r->description, $r->amount, $r->account->name, $r->next_due_date->toDateString()])->all(),
        'reminders' => Reminder::where('user_id', $user->id)->get()->map(fn ($r) => [$r->title, $r->amount, $r->due_date->toDateString()])->all(),
    ];
}

it('restores a full backup into an empty account on the same instance', function () {
    $original = User::factory()->create();
    seedWorkspace($original);
    $json = exportBackup($this, $original);

    $fresh = User::factory()->create();
    restoreBackup($this, $fresh, $json)->assertRedirect(route('settings.data-management'))->assertSessionHas('success');

    expect(workspaceSnapshot($fresh))->toEqual(workspaceSnapshot($original));

    // IDs belonged to the original user, so the copy got new ones and the
    // original records were left alone.
    expect(Account::where('user_id', $original->id)->count())->toBe(2)
        ->and(Transaction::where('user_id', $fresh->id)->pluck('id')->intersect(Transaction::where('user_id', $original->id)->pluck('id')))->toBeEmpty();
});

it('keeps balances as exported instead of re-applying every transaction', function () {
    $original = User::factory()->create();
    seedWorkspace($original);
    $json = exportBackup($this, $original);

    $fresh = User::factory()->create();
    restoreBackup($this, $fresh, $json);

    expect(Account::where('user_id', $fresh->id)->where('name', 'Checking')->value('balance'))->toBe(3000 - 120.5 - 500)
        ->and(Account::where('user_id', $fresh->id)->where('name', 'Savings')->value('balance'))->toBe(500);
});

it('links the two legs of a restored transfer to each other but not to the original pair', function () {
    $original = User::factory()->create();
    seedWorkspace($original);
    $json = exportBackup($this, $original);

    $fresh = User::factory()->create();
    restoreBackup($this, $fresh, $json);

    $groups = Transaction::where('user_id', $fresh->id)->where('type', 'transfer')->pluck('transfer_group_id')->unique();
    $originalGroup = Transaction::where('user_id', $original->id)->where('type', 'transfer')->value('transfer_group_id');

    expect($groups)->toHaveCount(1)
        ->and($groups->first())->not->toBe($originalGroup);
});

it('does not duplicate anything when the same backup is restored twice', function () {
    $user = User::factory()->create();
    seedWorkspace($user);
    $json = exportBackup($this, $user);
    $before = workspaceSnapshot($user);

    restoreBackup($this, $user, $json)->assertSessionHas('success', 'Nothing new to restore. Everything in this backup is already here.');
    restoreBackup($this, $user, $json);

    expect(workspaceSnapshot($user))->toEqual($before);
});

it('brings back deleted records with their original ids and adjusts the balance', function () {
    $user = User::factory()->create();
    seedWorkspace($user);
    $json = exportBackup($this, $user);
    $before = workspaceSnapshot($user);

    $income = Transaction::where('user_id', $user->id)->where('type', 'income')->first();
    $income->delete(); // goes through the observer, so Checking drops by 3000

    restoreBackup($this, $user, $json)->assertSessionHas('success', 'Restored 1 transaction.');

    expect(Transaction::find($income->id))->not->toBeNull()
        ->and(workspaceSnapshot($user))->toEqual($before);
});

it('restores backups written before currencies, tags and contributions were exported', function () {
    $user = User::factory()->create();
    $accountId = (string) Str::uuid();
    $categoryId = (string) Str::uuid();

    $legacy = [
        'exported_at' => '2026-01-15T10:00:00+00:00',
        'accounts' => [['id' => $accountId, 'user_id' => (string) Str::uuid(), 'name' => 'Wallet', 'type' => 'cash', 'balance' => 75, 'currency' => 'NGN', 'is_active' => true, 'description' => null]],
        'categories' => [['id' => $categoryId, 'name' => 'Snacks', 'type' => 'expense', 'color' => '#000', 'icon' => null, 'parent_id' => null, 'is_active' => true]],
        'transactions' => [['id' => (string) Str::uuid(), 'account_id' => $accountId, 'category_id' => $categoryId, 'type' => 'expense', 'amount' => 25, 'description' => 'Chips', 'notes' => null, 'is_recurring' => false, 'transaction_date' => '2026-01-14T00:00:00.000000Z']],
        'budgets' => [['id' => (string) Str::uuid(), 'category_id' => $categoryId, 'amount' => 50, 'period_type' => 'monthly', 'period_year' => 2026, 'period_month' => 1, 'is_active' => true]],
        'goals' => [],
    ];

    restoreBackup($this, $user, json_encode($legacy))->assertSessionHas('success');

    $transaction = Transaction::where('user_id', $user->id)->sole();
    expect($transaction->currency)->toBe('NGN')
        ->and($transaction->transaction_date->toDateString())->toBe('2026-01-14')
        ->and(Account::where('user_id', $user->id)->value('balance'))->toBe(75)
        ->and(Budget::where('user_id', $user->id)->count())->toBe(1);
});

it('rejects a file that is not a backup', function () {
    $user = User::factory()->create();

    restoreBackup($this, $user, json_encode(['hello' => 'world']))->assertSessionHasErrors('file');
});
