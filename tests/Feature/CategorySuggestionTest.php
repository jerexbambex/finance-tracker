<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;

function suggestFixture(): array
{
    $user = User::factory()->create();
    $account = Account::factory()->create(['user_id' => $user->id]);

    return [$user, $account];
}

function pastTxn(Account $account, Category $category, string $description, string $date, string $type = 'expense'): void
{
    Transaction::factory()->create([
        'user_id' => $account->user_id,
        'account_id' => $account->id,
        'category_id' => $category->id,
        'type' => $type,
        'description' => $description,
        'transaction_date' => $date,
    ]);
}

function suggest(User $user, string $description, string $type = 'expense')
{
    return test()->actingAs($user)->getJson(route('transactions.suggest-category', compact('description', 'type')));
}

test('suggests the category used for the same payee, ignoring case, digits and punctuation', function () {
    [$user, $account] = suggestFixture();
    $transport = Category::factory()->create(['user_id' => $user->id, 'name' => 'Transport']);
    pastTxn($account, $transport, 'UBER *TRIP 4821', '2026-11-01');

    suggest($user, 'Uber trip')
        ->assertOk()
        ->assertJsonPath('suggestion.category_id', $transport->id)
        ->assertJsonPath('suggestion.matched', 'UBER *TRIP 4821');
});

test('falls back to the first meaningful word, skipping bank boilerplate', function () {
    [$user, $account] = suggestFixture();
    $groceries = Category::factory()->create(['user_id' => $user->id]);
    $transport = Category::factory()->create(['user_id' => $user->id]);
    pastTxn($account, $groceries, 'POS Purchase Shoprite Lekki', '2026-11-01');
    pastTxn($account, $transport, 'POS Purchase Uber', '2026-11-02');

    suggest($user, 'Shoprite Ikeja')->assertJsonPath('suggestion.category_id', $groceries->id);
});

test('the most recent categorisation wins so corrections take effect', function () {
    [$user, $account] = suggestFixture();
    $old = Category::factory()->create(['user_id' => $user->id]);
    $new = Category::factory()->create(['user_id' => $user->id]);
    pastTxn($account, $old, 'Netflix', '2026-09-01');
    pastTxn($account, $new, 'Netflix', '2026-10-01');

    suggest($user, 'netflix')->assertJsonPath('suggestion.category_id', $new->id);
});

test('only matches history of the same transaction type', function () {
    [$user, $account] = suggestFixture();
    $salary = Category::factory()->create(['user_id' => $user->id, 'type' => 'income']);
    pastTxn($account, $salary, 'Acme Ltd', '2026-11-01', 'income');

    suggest($user, 'Acme Ltd', 'expense')->assertJsonPath('suggestion', null);
    suggest($user, 'Acme Ltd', 'income')->assertJsonPath('suggestion.category_id', $salary->id);
});

test('ignores deactivated categories', function () {
    [$user, $account] = suggestFixture();
    $gone = Category::factory()->create(['user_id' => $user->id, 'is_active' => false]);
    pastTxn($account, $gone, 'Gym', '2026-11-01');

    suggest($user, 'Gym')->assertJsonPath('suggestion', null);
});

test("never suggests from another user's history", function () {
    [$owner, $account] = suggestFixture();
    $category = Category::factory()->create(['user_id' => $owner->id]);
    pastTxn($account, $category, 'Spotify', '2026-11-01');

    suggest(User::factory()->create(), 'Spotify')->assertJsonPath('suggestion', null);
});

test('validates input', function () {
    $user = User::factory()->create();

    suggest($user, 'Uber', 'transfer')->assertUnprocessable();
});

test('guests cannot request suggestions', function () {
    $this->getJson(route('transactions.suggest-category', ['description' => 'x', 'type' => 'expense']))->assertUnauthorized();
});
