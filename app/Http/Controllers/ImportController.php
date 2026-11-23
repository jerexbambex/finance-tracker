<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Services\BudgetAlerts;
use App\Services\CategorySuggester;
use App\Services\CsvTransactionParser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

/**
 * CSV import in two steps: preview() reads the file, proposes a column
 * mapping and shows exactly how rows will be saved; import() saves them.
 * Both use the same parser, so the preview can't disagree with the result.
 */
class ImportController extends Controller
{
    private const PREVIEW_ROWS = 15;

    private const MAX_ERRORS_SHOWN = 20;

    public function __construct(private CsvTransactionParser $parser) {}

    public function index(Request $request)
    {
        return Inertia::render('import/Index', [
            'accounts' => $request->user()->accounts()->where('is_active', true)->get(['id', 'name', 'currency']),
            'importErrors' => $request->session()->get('importErrors', []),
        ]);
    }

    public function preview(Request $request)
    {
        $this->validateRequest($request, accountRequired: false);
        $rows = $this->parser->read($request->file('file')->getRealPath());

        if ($rows === []) {
            throw ValidationException::withMessages(['file' => 'The file has no rows.']);
        }

        $guess = $this->parser->guess($rows);
        $settings = $this->settings($request, $guess);
        $account = $request->filled('account_id') ? $this->ownedAccount($request) : null;

        $dataRows = $settings['has_header'] ? array_slice($rows, 1) : $rows;
        $lineOffset = $settings['has_header'] ? 2 : 1;
        $parsed = [];
        foreach ($dataRows as $i => $row) {
            $parsed[] = ['line' => $i + $lineOffset] + $this->parser->parseRow($row, $settings['mapping'], $settings['date_order'], $settings['positive_is_expense']);
        }

        if ($account) {
            $parsed = $this->markDuplicates($account, $parsed);
        }
        $valid = count(array_filter($parsed, fn ($r) => $r['ok']));
        $duplicates = count(array_filter($parsed, fn ($r) => $r['duplicate'] ?? false));

        return response()->json([
            'columns' => $settings['has_header']
                ? $rows[0]
                : array_map(fn ($i) => 'Column '.($i + 1), array_keys($rows[0])),
            'guess' => $guess,
            'settings' => $settings,
            'rows' => array_slice($parsed, 0, self::PREVIEW_ROWS),
            'summary' => [
                'total' => count($parsed),
                'valid' => $valid - $duplicates,
                'invalid' => count($parsed) - $valid,
                'duplicates' => $duplicates,
            ],
        ]);
    }

    public function import(Request $request, CategorySuggester $suggester, BudgetAlerts $alerts)
    {
        $this->validateRequest($request, accountRequired: true);
        $account = $this->ownedAccount($request);
        $user = $request->user();

        $rows = $this->parser->read($request->file('file')->getRealPath());
        $settings = $this->settings($request, $this->parser->guess($rows));
        $autoCategorize = $request->boolean('auto_categorize', true);

        $dataRows = $settings['has_header'] ? array_slice($rows, 1) : $rows;
        $lineOffset = $settings['has_header'] ? 2 : 1;

        $parsed = [];
        $errors = [];
        foreach ($dataRows as $i => $row) {
            $result = $this->parser->parseRow($row, $settings['mapping'], $settings['date_order'], $settings['positive_is_expense']);
            if ($result['ok']) {
                $parsed[] = $result;
            } else {
                $errors[] = 'Row '.($i + $lineOffset).': '.$result['error'];
            }
        }

        $parsed = $this->markDuplicates($account, $parsed);
        $categories = [];
        $imported = 0;
        $skipped = 0;
        $categorized = 0;
        $created = [];

        DB::transaction(function () use ($parsed, $account, $user, $suggester, $autoCategorize, &$categories, &$imported, &$skipped, &$categorized, &$created) {
            foreach ($parsed as $row) {
                if ($row['duplicate']) {
                    $skipped++;

                    continue;
                }

                $categoryId = null;
                if ($row['category'] !== null) {
                    $categoryId = $categories[$row['type'].'|'.mb_strtolower($row['category'])]
                        ??= $this->resolveCategory($user->id, $row['category'], $row['type']);
                } elseif ($autoCategorize) {
                    $categoryId = $suggester->suggest($user, $row['description'], $row['type'])['category_id'] ?? null;
                    $categorized += $categoryId !== null ? 1 : 0;
                }

                Transaction::create([
                    'user_id' => $user->id,
                    'account_id' => $account->id,
                    'category_id' => $categoryId,
                    'type' => $row['type'],
                    'amount' => $row['amount'],
                    'description' => $row['description'],
                    'transaction_date' => $row['date'],
                    'currency' => $account->currency,
                ]);
                $created[] = ['category_id' => $categoryId, 'date' => $row['date'], 'type' => $row['type']];
                $imported++;
            }
        });

        // One pass over the budgets this import touched, after everything is saved.
        $alerts->checkMany($user, array_map(fn ($row) => [$row['category_id'], $row['date']], array_filter($created, fn ($row) => $row['type'] === 'expense')));

        $message = "Imported {$imported} transaction".($imported !== 1 ? 's' : '');
        if ($categorized > 0) {
            $message .= " ({$categorized} auto-categorized)";
        }
        if ($skipped > 0) {
            $message .= ", skipped {$skipped} already imported";
        }
        if ($errors !== []) {
            $message .= ', '.count($errors).' row'.(count($errors) !== 1 ? 's' : '').' could not be read';
        }

        return to_route('import.index')
            ->with($imported > 0 || $errors === [] ? 'success' : 'error', $message)
            ->with('importErrors', array_slice($errors, 0, self::MAX_ERRORS_SHOWN));
    }

    private function validateRequest(Request $request, bool $accountRequired): void
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:5120',
            'account_id' => [$accountRequired ? 'required' : 'nullable', 'string'],
            'has_header' => 'sometimes|boolean',
            'date_order' => ['sometimes', Rule::in(CsvTransactionParser::DATE_ORDERS)],
            'positive_is_expense' => 'sometimes|boolean',
            'auto_categorize' => 'sometimes|boolean',
            'mapping' => 'sometimes|array',
            'mapping.*' => 'nullable|integer|min:0',
        ]);
    }

    /**
     * The user's choices, falling back to the parser's guess for anything not sent.
     *
     * @return array{has_header: bool, mapping: array<string, int|null>, date_order: string, positive_is_expense: bool}
     */
    private function settings(Request $request, array $guess): array
    {
        $mapping = $guess['mapping'];
        if ($request->has('mapping')) {
            $sent = (array) $request->input('mapping');
            foreach (CsvTransactionParser::FIELDS as $field) {
                $value = $sent[$field] ?? null;
                $mapping[$field] = $value === null || $value === '' ? null : (int) $value;
            }
        }

        $missing = [];
        foreach (['date', 'description'] as $field) {
            if ($mapping[$field] === null) {
                $missing[] = $field;
            }
        }
        if ($mapping['amount'] === null && $mapping['debit'] === null && $mapping['credit'] === null) {
            $missing[] = 'amount (or debit/credit)';
        }
        if ($missing !== [] && $request->has('mapping')) {
            throw ValidationException::withMessages(['mapping' => 'Choose a column for: '.implode(', ', $missing).'.']);
        }

        return [
            'has_header' => $request->has('has_header') ? $request->boolean('has_header') : $guess['has_header'],
            'mapping' => $mapping,
            'date_order' => $request->input('date_order', $guess['date_order']),
            'positive_is_expense' => $request->boolean('positive_is_expense'),
        ];
    }

    private function ownedAccount(Request $request): Account
    {
        return Account::where('id', $request->input('account_id'))
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
    }

    /**
     * Reuse a matching category (the user's own or a default) before creating one.
     */
    private function resolveCategory(string $userId, string $name, string $type): string
    {
        $existing = Category::where(fn ($q) => $q->where('user_id', $userId)->orWhereNull('user_id'))
            ->where('type', $type)
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->orderByDesc('is_active')
            ->orderByRaw('user_id IS NULL') // prefer the user's own
            ->first();

        return $existing->id ?? Category::create([
            'user_id' => $userId,
            'name' => $name,
            'type' => $type,
            'is_active' => true,
        ])->id;
    }

    /**
     * How many of each (type, date, amount, description) the account already
     * has, loaded with one query over the file's date range.
     *
     * @param  list<array{date: string, amount: float, type: string, description: string}>  $rows
     * @return array<string, int>
     */
    private function existingCounts(Account $account, array $rows): array
    {
        if ($rows === []) {
            return [];
        }

        $dates = array_column($rows, 'date');

        return Transaction::where('account_id', $account->id)
            ->whereBetween('transaction_date', [min($dates).' 00:00:00', max($dates).' 23:59:59'])
            ->toBase()
            ->get(['type', 'transaction_date', 'amount', 'description'])
            ->countBy(fn ($t) => $this->dedupeKey($t->type, substr((string) $t->transaction_date, 0, 10), $t->amount / 100, (string) $t->description))
            ->all();
    }

    /**
     * Flag each readable row that is already in the account.
     *
     * The Nth identical row in the file is a duplicate only if the account
     * already had N of them before this import, so two identical coffees on
     * the same day are both kept the first time round.
     *
     * @template T of array
     *
     * @param  list<T>  $rows
     * @return list<T>
     */
    private function markDuplicates(Account $account, array $rows): array
    {
        $existing = $this->existingCounts($account, array_values(array_filter($rows, fn ($r) => $r['ok'])));
        $seen = [];

        return array_map(function ($row) use ($existing, &$seen) {
            if (! $row['ok']) {
                return $row;
            }
            $key = $this->dedupeKey($row['type'], $row['date'], $row['amount'], $row['description']);
            $seen[$key] = ($seen[$key] ?? 0) + 1;

            return $row + ['duplicate' => $seen[$key] <= ($existing[$key] ?? 0)];
        }, $rows);
    }

    private function dedupeKey(string $type, string $date, float $amount, string $description): string
    {
        return implode('|', [$type, $date, (int) round($amount * 100), mb_strtolower(trim($description))]);
    }
}
