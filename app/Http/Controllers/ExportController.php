<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ExportController extends Controller
{
    public function transactions(Request $request)
    {
        $query = auth()->user()->transactions()
            ->with(['account', 'category'])
            ->latest('transaction_date');

        $query->when($request->account_id, fn ($q) => $q->where('account_id', $request->account_id))
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id))
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->date_from, fn ($q) => $q->whereDate('transaction_date', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('transaction_date', '<=', $request->date_to))
            ->when($request->search, fn ($q) => $q->where('description', 'like', '%'.$request->search.'%'));

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
