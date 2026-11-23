<?php

namespace App\Services;

use Illuminate\Support\Carbon;
use Throwable;

/**
 * Turns an arbitrary bank-statement CSV into transaction rows.
 *
 * Banks disagree on everything: column order, header names, date order
 * (01/10/2026 is 1 Oct in Lagos and Jan 10 in New York), signed amounts vs
 * separate Debit/Credit columns, thousands separators, "(45.00)" negatives.
 * The caller supplies a mapping (column index per field) plus a date order;
 * guess() proposes one from the headers so most users only have to confirm.
 *
 * Both the import preview and the import itself go through parseRow(), so
 * what the user sees in the preview is exactly what gets saved.
 */
class CsvTransactionParser
{
    public const FIELDS = ['date', 'description', 'amount', 'debit', 'credit', 'type', 'category'];

    public const DATE_ORDERS = ['ymd', 'dmy', 'mdy'];

    /**
     * Header names per field, best first. Debit/credit are matched before
     * amount so "Debit Amount" isn't claimed as a signed amount column.
     */
    private const HEADER_HINTS = [
        'date' => ['transaction date', 'trans date', 'txn date', 'posting date', 'posted date', 'booking date', 'date', 'value date'],
        'debit' => ['debit', 'withdrawal', 'withdrawals', 'money out', 'paid out', 'outflow', 'dr'],
        'credit' => ['credit', 'deposit', 'deposits', 'money in', 'paid in', 'inflow', 'cr'],
        'amount' => ['amount', 'value', 'sum'],
        'description' => ['description', 'narration', 'narrative', 'details', 'memo', 'payee', 'merchant', 'particulars', 'remarks', 'name', 'reference'],
        'type' => ['transaction type', 'type', 'dr cr', 'cr dr'],
        'category' => ['category'],
    ];

    private const INCOME_WORDS = ['income', 'credit', 'cr', 'deposit', 'inflow', 'in', 'received', 'refund'];

    private const EXPENSE_WORDS = ['expense', 'debit', 'dr', 'withdrawal', 'outflow', 'out', 'payment', 'purchase'];

    /**
     * Read every row of the file as arrays of trimmed strings, skipping blank lines.
     *
     * @return list<list<string>>
     */
    public function read(string $path): array
    {
        $contents = (string) file_get_contents($path);
        $contents = preg_replace('/^\xEF\xBB\xBF/', '', $contents); // Excel's UTF-8 BOM
        $delimiter = $this->detectDelimiter($contents);

        $handle = fopen('php://temp', 'r+');
        fwrite($handle, $contents);
        rewind($handle);

        $rows = [];
        while (($row = fgetcsv($handle, null, $delimiter, '"', '')) !== false) {
            $row = array_map(fn ($cell) => trim((string) $cell), $row);
            if (implode('', $row) !== '') {
                $rows[] = $row;
            }
        }
        fclose($handle);

        return $rows;
    }

    /**
     * Propose a mapping for a file the user hasn't mapped yet.
     *
     * @param  list<list<string>>  $rows
     * @return array{has_header: bool, mapping: array<string, int|null>, date_order: string, date_order_certain: bool}
     */
    public function guess(array $rows): array
    {
        $first = $rows[0] ?? [];
        $hasHeader = $first !== [] && ! collect($first)->contains(fn ($cell) => $this->looksLikeDate($cell));

        $mapping = array_fill_keys(self::FIELDS, null);

        if ($hasHeader) {
            // "Trans. Date" → "trans date", "Dr/Cr" → "dr cr"
            $headers = array_map(
                fn ($h) => trim(preg_replace('/[^\p{L}\p{N}]+/u', ' ', mb_strtolower($h))),
                $first,
            );
            $taken = [];
            foreach (self::HEADER_HINTS as $field => $hints) {
                $mapping[$field] = $this->findHeader($headers, $hints, $taken);
                if ($mapping[$field] !== null) {
                    $taken[] = $mapping[$field];
                }
            }
            // A file with Debit and Credit columns uses those, not a generic "value" column.
            if ($mapping['debit'] !== null && $mapping['credit'] !== null) {
                $mapping['amount'] = null;
            }
        } else {
            // No headers to go on: fall back to the app's own export layout.
            $mapping = array_merge($mapping, ['date' => 0, 'description' => 1, 'amount' => 2, 'type' => 3, 'category' => 4]);
            $width = count($first);
            foreach ($mapping as $field => $index) {
                if ($index !== null && $index >= $width) {
                    $mapping[$field] = null;
                }
            }
        }

        $dateCells = $mapping['date'] === null ? [] : array_map(
            fn ($row) => $row[$mapping['date']] ?? '',
            array_slice($rows, $hasHeader ? 1 : 0, 200),
        );
        [$order, $certain] = $this->guessDateOrder($dateCells);

        return ['has_header' => $hasHeader, 'mapping' => $mapping, 'date_order' => $order, 'date_order_certain' => $certain];
    }

    /**
     * @param  list<string>  $row
     * @param  array<string, int|null>  $mapping
     * @return array{ok: true, date: string, description: string, amount: float, type: string, category: ?string}|array{ok: false, error: string}
     */
    public function parseRow(array $row, array $mapping, string $dateOrder, bool $positiveIsExpense = false): array
    {
        $cell = fn (string $field) => isset($mapping[$field]) ? trim($row[$mapping[$field]] ?? '') : '';

        $date = $this->parseDate($cell('date'), $dateOrder);
        if ($date === null) {
            return ['ok' => false, 'error' => $cell('date') === '' ? 'Missing date' : "Unrecognised date \"{$cell('date')}\""];
        }

        $description = $cell('description');
        if ($description === '') {
            return ['ok' => false, 'error' => 'Missing description'];
        }
        $description = mb_substr($description, 0, 255);

        [$amount, $type, $error] = $this->resolveAmount($cell, $mapping, $positiveIsExpense);
        if ($error !== null) {
            return ['ok' => false, 'error' => $error];
        }

        $category = $cell('category');

        return [
            'ok' => true,
            'date' => $date,
            'description' => $description,
            'amount' => $amount,
            'type' => $type,
            'category' => $category === '' ? null : mb_substr($category, 0, 255),
        ];
    }

    /**
     * Accepts "1,234.56", "1.234,56", "₦45,000", "(45.00)", "-45", "45.00-".
     */
    public function parseAmount(string $raw): ?float
    {
        $raw = trim($raw);
        if ($raw === '') {
            return null;
        }

        $negative = str_starts_with($raw, '-') || str_ends_with($raw, '-')
            || (str_starts_with($raw, '(') && str_ends_with($raw, ')'));

        $number = preg_replace('/[^\d.,]/', '', $raw);
        if ($number === '' || ! preg_match('/\d/', $number)) {
            return null;
        }

        $lastDot = strrpos($number, '.');
        $lastComma = strrpos($number, ',');

        if ($lastDot !== false && $lastComma !== false) {
            // Whichever separator comes last is the decimal point.
            $number = $lastComma > $lastDot
                ? str_replace(['.', ','], ['', '.'], $number)
                : str_replace(',', '', $number);
        } elseif ($lastComma !== false) {
            // A lone comma followed by exactly two digits is a decimal comma ("45,50"); otherwise thousands.
            $number = substr_count($number, ',') === 1 && preg_match('/,\d{2}$/', $number)
                ? str_replace(',', '.', $number)
                : str_replace(',', '', $number);
        } elseif ($lastDot !== false && substr_count($number, '.') > 1) {
            $number = str_replace('.', '', $number); // "1.234.567" thousands dots
        }

        $value = (float) $number;

        return $negative ? -$value : $value;
    }

    public function parseDate(string $raw, string $order): ?string
    {
        $raw = trim($raw);
        if ($raw === '') {
            return null;
        }

        if (preg_match('/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/', $raw, $m)) {
            return $this->checkedDate((int) $m[1], (int) $m[2], (int) $m[3]);
        }

        if (preg_match('/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2}|\d{4})\b/', $raw, $m)) {
            $year = (int) $m[3];
            $year = $year < 100 ? 2000 + $year : $year;
            [$day, $month] = $order === 'mdy' ? [(int) $m[2], (int) $m[1]] : [(int) $m[1], (int) $m[2]];

            return $this->checkedDate($year, $month, $day);
        }

        // Spelled-out months ("01 Oct 2026", "Oct 1, 2026") are unambiguous.
        if (preg_match('/[a-z]{3}/i', $raw)) {
            try {
                return Carbon::parse($raw)->toDateString();
            } catch (Throwable) {
                return null;
            }
        }

        return null;
    }

    /**
     * @param  callable(string): string  $cell
     * @param  array<string, int|null>  $mapping
     * @return array{0: float, 1: string, 2: ?string}
     */
    private function resolveAmount(callable $cell, array $mapping, bool $positiveIsExpense): array
    {
        if (isset($mapping['debit']) || isset($mapping['credit'])) {
            $debit = abs($this->parseAmount($cell('debit')) ?? 0);
            $credit = abs($this->parseAmount($cell('credit')) ?? 0);

            if ($debit > 0 && $credit > 0) {
                return [0, '', 'Both debit and credit have a value'];
            }
            if ($debit > 0 || $credit > 0) {
                return $debit > 0 ? [$debit, 'expense', null] : [$credit, 'income', null];
            }
            if (! isset($mapping['amount'])) {
                return [0, '', 'No debit or credit amount'];
            }
        }

        $amount = $this->parseAmount($cell('amount'));
        if ($amount === null) {
            return [0, '', $cell('amount') === '' ? 'Missing amount' : "Unrecognised amount \"{$cell('amount')}\""];
        }
        if ($amount == 0) {
            return [0, '', 'Amount is zero'];
        }

        $typeCell = mb_strtolower($cell('type'));
        if ($typeCell !== '') {
            $word = preg_split('/[^a-z]+/', $typeCell, -1, PREG_SPLIT_NO_EMPTY)[0] ?? '';
            if (in_array($word, self::INCOME_WORDS, true)) {
                return [abs($amount), 'income', null];
            }
            if (in_array($word, self::EXPENSE_WORDS, true)) {
                return [abs($amount), 'expense', null];
            }

            return [0, '', "Unrecognised type \"{$cell('type')}\""];
        }

        $isExpense = $positiveIsExpense ? $amount > 0 : $amount < 0;

        return [abs($amount), $isExpense ? 'expense' : 'income', null];
    }

    /**
     * @param  list<string>  $cells
     * @return array{0: string, 1: bool} date order and whether the data proves it
     */
    private function guessDateOrder(array $cells): array
    {
        $sawSlashed = false;
        foreach ($cells as $cell) {
            if (preg_match('/^\d{4}[-\/.]\d{1,2}[-\/.]\d{1,2}/', $cell)) {
                return ['ymd', true];
            }
            if (preg_match('/^(\d{1,2})[-\/.](\d{1,2})[-\/.]\d{2,4}/', $cell, $m)) {
                $sawSlashed = true;
                if ((int) $m[1] > 12) {
                    return ['dmy', true];
                }
                if ((int) $m[2] > 12) {
                    return ['mdy', true];
                }
            }
        }

        // Every date fits both orders (or none are numeric): the user must confirm.
        return [$sawSlashed ? 'dmy' : 'ymd', ! $sawSlashed];
    }

    /**
     * @param  list<string>  $headers
     * @param  list<string>  $hints
     * @param  list<int>  $taken
     */
    private function findHeader(array $headers, array $hints, array $taken): ?int
    {
        // Per hint in priority order: exact header name, then "contains".
        // Running balance columns are never a transaction field.
        foreach ($hints as $hint) {
            foreach ([true, false] as $exact) {
                foreach ($headers as $i => $header) {
                    if (in_array($i, $taken, true) || str_contains($header, 'balance')) {
                        continue;
                    }
                    $hit = $exact
                        ? $header === $hint
                        : mb_strlen($hint) > 2 && str_contains($header, $hint);
                    if ($hit) {
                        return $i;
                    }
                }
            }
        }

        return null;
    }

    private function looksLikeDate(string $cell): bool
    {
        return (bool) preg_match('/^\d{1,4}[-\/.]\d{1,2}[-\/.]\d{1,4}/', trim($cell));
    }

    private function checkedDate(int $year, int $month, int $day): ?string
    {
        return checkdate($month, $day, $year) ? sprintf('%04d-%02d-%02d', $year, $month, $day) : null;
    }

    private function detectDelimiter(string $contents): string
    {
        $firstLine = strtok($contents, "\r\n") ?: '';
        $counts = [',' => substr_count($firstLine, ','), ';' => substr_count($firstLine, ';'), "\t" => substr_count($firstLine, "\t")];
        arsort($counts);

        return reset($counts) > 0 ? (string) array_key_first($counts) : ',';
    }
}
