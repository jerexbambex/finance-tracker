<?php

namespace App\Http\Controllers;

use App\Currency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Spatie\LaravelPdf\Facades\Pdf;

class ExportController extends Controller
{
    /** Cap statement rows so a huge history can't exhaust memory / stall PDF rendering. */
    private const STATEMENT_ROW_LIMIT = 2000;

    /**
     * Apply the shared transaction filters (account, category, type, date, search).
     * Columns are fully qualified so the same filters are safe to reuse on a query
     * that joins `accounts` (which also has a `type` column).
     */
    protected function applyTransactionFilters($query, Request $request)
    {
        return $query
            ->when($request->account_id, fn ($q) => $q->where('transactions.account_id', $request->account_id))
            ->when($request->category_id, fn ($q) => $q->where('transactions.category_id', $request->category_id))
            ->when($request->type, fn ($q) => $q->where('transactions.type', $request->type))
            ->when($request->date_from, fn ($q) => $q->whereDate('transactions.transaction_date', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('transactions.transaction_date', '<=', $request->date_to))
            ->when($request->search, fn ($q) => $q->where('transactions.description', 'like', '%'.$request->search.'%'));
    }

    public function transactions(Request $request)
    {
        $query = $this->applyTransactionFilters(
            auth()->user()->transactions()->with(['account', 'category'])->latest('transaction_date'),
            $request,
        );

        $filename = 'transactions_'.now()->format('Y-m-d_His').'.csv';

        $callback = function () use ($query) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Date', 'Type', 'Account', 'Category', 'Description', 'Amount']);

            // lazy() chunks in batches of 1000 — never loads full dataset into memory
            foreach ($query->lazy() as $transaction) {
                fputcsv($file, [
                    $transaction->transaction_date->format('Y-m-d'),
                    ucfirst($transaction->type),
                    $transaction->account->name,
                    $transaction->category ? $transaction->category->name : 'Uncategorized',
                    $transaction->description,
                    number_format($transaction->amount, 2),
                ]);
            }

            fclose($file);
        };

        return Response::stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function statement(Request $request)
    {
        $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ]);

        $user = auth()->user();

        // Accurate income/expense totals per currency via a DB aggregate — independent
        // of the row cap below, so totals stay correct even when the list is truncated.
        $totals = [];
        $totalRows = $this->applyTransactionFilters(
            $user->transactions()
                ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
                ->whereIn('transactions.type', ['income', 'expense']),
            $request,
        )
            ->selectRaw('transactions.type as type, accounts.currency as currency, SUM(transactions.amount) as total')
            ->groupBy('transactions.type', 'accounts.currency')
            ->get();

        foreach ($totalRows as $row) {
            $totals[$row->currency] ??= ['income' => 0, 'expense' => 0];
            $totals[$row->currency][$row->type] = $row->total / 100;
        }

        $rowCount = $this->applyTransactionFilters($user->transactions(), $request)->count();
        $truncated = $rowCount > self::STATEMENT_ROW_LIMIT;

        $transactions = $this->applyTransactionFilters(
            $user->transactions()->with(['account', 'category'])
                ->orderBy('transactions.transaction_date')->orderBy('transactions.created_at'),
            $request,
        )->limit(self::STATEMENT_ROW_LIMIT)->get();

        $accountName = $request->account_id
            ? optional($user->accounts()->find($request->account_id))->name
            : null;

        $filename = 'transaction-statement_'.now()->format('Y-m-d_His').'.pdf';

        return Pdf::view('transactions.statement', [
            'transactions' => $transactions,
            'totals' => $totals,
            'rowCount' => $rowCount,
            'truncated' => $truncated,
            'rowLimit' => self::STATEMENT_ROW_LIMIT,
            'currencies' => collect(Currency::cases())->mapWithKeys(fn ($c) => [
                $c->value => ['symbol' => $c->symbol(), 'label' => $c->label()],
            ]),
            'dateFrom' => $request->date_from,
            'dateTo' => $request->date_to,
            'accountName' => $accountName,
            'typeFilter' => $request->type,
            'generatedAt' => now(),
        ])
            ->format('a4')
            ->inline($filename);
    }

    public function allData()
    {
        $user = auth()->user();
        $filename = 'budget_app_backup_'.now()->format('Y-m-d_His').'.json';

        $callback = function () use ($user) {
            $out = fopen('php://output', 'w');

            // Write JSON incrementally — small tables loaded at once, transactions streamed
            fwrite($out, '{');
            fwrite($out, '"exported_at":'.json_encode(now()->toIso8601String()).',');
            fwrite($out, '"user":'.json_encode(['name' => $user->name, 'email' => $user->email]).',');
            fwrite($out, '"accounts":'.json_encode($user->accounts()->get()->toArray()).',');
            fwrite($out, '"categories":'.json_encode($user->categories()->get()->toArray()).',');
            fwrite($out, '"budgets":'.json_encode($user->budgets()->with('category')->get()->toArray()).',');
            fwrite($out, '"goals":'.json_encode($user->goals()->get()->toArray()).',');
            fwrite($out, '"recurring_transactions":'.json_encode($user->recurringTransactions()->with(['account', 'category'])->get()->toArray()).',');
            fwrite($out, '"reminders":'.json_encode($user->reminders()->with('category')->get()->toArray()).',');

            // Transactions streamed in chunks of 1000 to avoid memory exhaustion
            fwrite($out, '"transactions":[');
            $first = true;
            $user->transactions()->with(['account', 'category'])->lazy()->each(function ($t) use ($out, &$first) {
                if (! $first) {
                    fwrite($out, ',');
                }
                fwrite($out, json_encode($t->toArray()));
                $first = false;
            });
            fwrite($out, ']}');

            fclose($out);
        };

        return Response::stream($callback, 200, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
