<?php

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Services\CsvTransactionParser;
use Illuminate\Http\UploadedFile;

function csvUpload(string $contents): UploadedFile
{
    return UploadedFile::fake()->createWithContent('statement.csv', $contents);
}

function importAccount(): Account
{
    return Account::factory()->create(['currency' => 'NGN', 'balance' => 0]);
}

// ── Parser units ────────────────────────────────────────────────────────────

test('parses the amount formats banks actually export', function (string $raw, ?float $expected) {
    expect((new CsvTransactionParser)->parseAmount($raw))->toBe($expected);
})->with([
    ['45.50', 45.5],
    ['-45.50', -45.5],
    ['(45.50)', -45.5],
    ['45.50-', -45.5],
    ['1,234.56', 1234.56],
    ['1.234,56', 1234.56],
    ['45,50', 45.5],
    ['₦1,250,000.00', 1250000.0],
    ['$ 12', 12.0],
    ['', null],
    ['n/a', null],
]);

test('parses dates in the chosen order and rejects impossible ones', function (string $raw, string $order, ?string $expected) {
    expect((new CsvTransactionParser)->parseDate($raw, $order))->toBe($expected);
})->with([
    ['2026-10-01', 'dmy', '2026-10-01'],
    ['2026/10/01 14:22', 'mdy', '2026-10-01'],
    ['01/10/2026', 'dmy', '2026-10-01'],
    ['01/10/2026', 'mdy', '2026-01-10'],
    ['1.10.26', 'dmy', '2026-10-01'],
    ['01 Oct 2026', 'mdy', '2026-10-01'],
    ['31/02/2026', 'dmy', null],
    ['garbage', 'dmy', null],
]);

test('guesses a split debit/credit layout and ignores the balance column', function () {
    $guess = (new CsvTransactionParser)->guess([
        ['Trans. Date', 'Value Date', 'Narration', 'Debit Amount', 'Credit Amount', 'Balance'],
        ['25/10/2026', '25/10/2026', 'POS Shoprite', '4,500.00', '', '95,500.00'],
    ]);

    expect($guess['has_header'])->toBeTrue()
        ->and($guess['mapping'])->toMatchArray(['date' => 0, 'description' => 2, 'debit' => 3, 'credit' => 4, 'amount' => null])
        ->and($guess['date_order'])->toBe('dmy')
        ->and($guess['date_order_certain'])->toBeTrue();
});

test('flags ambiguous dates as uncertain', function () {
    $guess = (new CsvTransactionParser)->guess([
        ['Date', 'Description', 'Amount'],
        ['01/02/2026', 'Coffee', '-3'],
        ['03/04/2026', 'Tea', '-2'],
    ]);

    expect($guess['date_order_certain'])->toBeFalse();
});

// ── Preview endpoint ────────────────────────────────────────────────────────

test('preview proposes a mapping and shows rows exactly as they will be saved', function () {
    $account = importAccount();
    $csv = "Date,Description,Amount\n2026-10-01,Salary,250000\n2026-10-02,Uber,-3500\n2026-10-03,,-10\n";

    $this->actingAs($account->user)
        ->post(route('import.preview'), ['file' => csvUpload($csv), 'account_id' => $account->id])
        ->assertOk()
        ->assertJsonPath('columns', ['Date', 'Description', 'Amount'])
        ->assertJsonPath('settings.mapping.amount', 2)
        ->assertJsonPath('rows.0.type', 'income')
        ->assertJsonPath('rows.1.type', 'expense')
        ->assertJsonPath('rows.1.amount', 3500)
        ->assertJsonPath('rows.2.ok', false)
        ->assertJsonPath('rows.2.line', 4)
        ->assertJsonPath('summary', ['total' => 3, 'valid' => 2, 'invalid' => 1, 'duplicates' => 0]);
});

test('preview rejects a mapping without the required columns', function () {
    $account = importAccount();

    $this->actingAs($account->user)
        ->post(route('import.preview'), [
            'file' => csvUpload("a,b\n1,2\n"),
            'mapping' => ['date' => 0, 'description' => null, 'amount' => 1],
        ], ['Accept' => 'application/json'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('mapping');
});

// ── Import ──────────────────────────────────────────────────────────────────

test('imports a debit/credit statement with day-first dates', function () {
    $account = importAccount();
    $csv = "Trans Date,Narration,Debit,Credit,Balance\n"
        ."25/10/2026,POS Shoprite,\"4,500.00\",,95500\n"
        ."26/10/2026,Salary,,\"250,000.00\",345500\n";

    $this->actingAs($account->user)
        ->post(route('import.transactions'), [
            'file' => csvUpload($csv),
            'account_id' => $account->id,
            'date_order' => 'dmy',
        ])
        ->assertRedirect(route('import.index'))
        ->assertSessionHas('success');

    $rows = Transaction::where('account_id', $account->id)->orderBy('transaction_date')->get();
    expect($rows)->toHaveCount(2)
        ->and($rows[0]->type)->toBe('expense')
        ->and($rows[0]->amount)->toEqual(4500)
        ->and($rows[0]->transaction_date->toDateString())->toBe('2026-10-25')
        ->and($rows[1]->type)->toBe('income')
        ->and($rows[1]->amount)->toEqual(250000);
});

test('honours an explicit mapping and the credit-card sign convention', function () {
    $account = importAccount();
    $csv = "Amount;Posted;Merchant\n45.00;2026-11-02;Netflix\n-100.00;2026-11-03;Payment thank you\n";

    $this->actingAs($account->user)->post(route('import.transactions'), [
        'file' => csvUpload($csv),
        'account_id' => $account->id,
        'has_header' => true,
        'mapping' => ['date' => 1, 'description' => 2, 'amount' => 0],
        'positive_is_expense' => true,
    ]);

    expect(Transaction::where('description', 'Netflix')->value('type'))->toBe('expense')
        ->and(Transaction::where('description', 'Payment thank you')->value('type'))->toBe('income');
});

test('re-importing the same file skips rows already present but keeps legitimate repeats', function () {
    $account = importAccount();
    $csv = "Date,Description,Amount\n2026-11-01,Coffee,-3\n2026-11-01,Coffee,-3\n2026-11-02,Lunch,-12\n";
    $post = fn () => $this->actingAs($account->user)->post(route('import.transactions'), [
        'file' => csvUpload($csv),
        'account_id' => $account->id,
    ]);

    $post();
    expect(Transaction::where('account_id', $account->id)->count())->toBe(3);

    $post()->assertSessionHas('success', fn ($m) => str_contains($m, 'skipped 3 already imported'));
    expect(Transaction::where('account_id', $account->id)->count())->toBe(3);
});

test('reuses an existing category case-insensitively and per type', function () {
    $account = importAccount();
    $groceries = Category::factory()->create(['user_id' => $account->user_id, 'name' => 'Groceries', 'type' => 'expense']);
    $csv = "Date,Description,Amount,Type,Category\n2026-11-01,Shoprite,20,expense,groceries\n2026-11-02,Refund,5,income,Groceries\n";

    $this->actingAs($account->user)->post(route('import.transactions'), ['file' => csvUpload($csv), 'account_id' => $account->id]);

    expect(Transaction::where('description', 'Shoprite')->value('category_id'))->toBe($groceries->id);
    $incomeCategory = Category::find(Transaction::where('description', 'Refund')->value('category_id'));
    expect($incomeCategory->type)->toBe('income')->and($incomeCategory->id)->not->toBe($groceries->id);
});

test('auto-categorizes uncategorized rows from the user\'s history', function () {
    $account = importAccount();
    $transport = Category::factory()->create(['user_id' => $account->user_id, 'type' => 'expense']);
    Transaction::factory()->create([
        'user_id' => $account->user_id, 'account_id' => $account->id, 'category_id' => $transport->id,
        'description' => 'UBER TRIP 1', 'transaction_date' => '2026-10-01',
    ]);

    $this->actingAs($account->user)->post(route('import.transactions'), [
        'file' => csvUpload("Date,Description,Amount\n2026-11-05,Uber trip,-3500\n"),
        'account_id' => $account->id,
    ])->assertSessionHas('success', fn ($m) => str_contains($m, '1 auto-categorized'));

    expect(Transaction::where('description', 'Uber trip')->value('category_id'))->toBe($transport->id);
});

test('reports unreadable rows with their line numbers', function () {
    $account = importAccount();

    $this->actingAs($account->user)->post(route('import.transactions'), [
        'file' => csvUpload("Date,Description,Amount\nnot-a-date,Thing,-5\n2026-11-01,Ok,-5\n"),
        'account_id' => $account->id,
    ])->assertSessionHas('importErrors', ['Row 2: Unrecognised date "not-a-date"']);
});

test("cannot import into another user's account", function () {
    $account = importAccount();
    $intruder = Account::factory()->create();

    $this->actingAs($intruder->user)->post(route('import.transactions'), [
        'file' => csvUpload("Date,Description,Amount\n2026-11-01,X,-5\n"),
        'account_id' => $account->id,
    ])->assertNotFound();

    expect(Transaction::where('account_id', $account->id)->count())->toBe(0);
});

test('preview flags each row that is already in the account', function () {
    $account = importAccount();
    $csv = "Date,Description,Amount\n2026-11-01,Coffee,-3\n2026-11-02,Lunch,-12\n";
    $this->actingAs($account->user)->post(route('import.transactions'), [
        'file' => csvUpload("Date,Description,Amount\n2026-11-01,Coffee,-3\n"),
        'account_id' => $account->id,
    ]);

    $this->actingAs($account->user)
        ->post(route('import.preview'), ['file' => csvUpload($csv), 'account_id' => $account->id])
        ->assertJsonPath('rows.0.duplicate', true)
        ->assertJsonPath('rows.1.duplicate', false)
        ->assertJsonPath('summary.valid', 1)
        ->assertJsonPath('summary.duplicates', 1);
});
