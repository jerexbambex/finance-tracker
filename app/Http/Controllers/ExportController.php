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

        // Apply same filters as index
        $query->when($request->account_id, fn($q) => $q->where('account_id', $request->account_id))
              ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
              ->when($request->type, fn($q) => $q->where('type', $request->type))
              ->when($request->date_from, fn($q) => $q->whereDate('transaction_date', '>=', $request->date_from))
              ->when($request->date_to, fn($q) => $q->whereDate('transaction_date', '<=', $request->date_to))
              ->when($request->search, fn($q) => $q->where('description', 'like', '%' . $request->search . '%'));

        $transactions = $query->get();

        // Generate CSV
        $filename = 'transactions_' . now()->format('Y-m-d_His') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function() use ($transactions) {
            $file = fopen('php://output', 'w');
            
            // Add CSV headers
            fputcsv($file, ['Date', 'Type', 'Account', 'Category', 'Description', 'Amount']);
            
            // Add data rows
            foreach ($transactions as $transaction) {
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

        return Response::stream($callback, 200, $headers);
    }
}
