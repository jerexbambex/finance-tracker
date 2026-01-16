<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransferController extends Controller
{
    public function create()
    {
        $accounts = auth()->user()->accounts()->where('is_active', true)->get();

        return Inertia::render('transfers/Create', [
            'accounts' => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_account_id' => 'required|exists:accounts,id|different:to_account_id',
            'to_account_id' => 'required|exists:accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
            'transfer_date' => 'required|date',
        ]);

        $fromAccount = Account::findOrFail($validated['from_account_id']);
        $toAccount = Account::findOrFail($validated['to_account_id']);

        // Verify user owns both accounts
        if ($fromAccount->user_id !== auth()->id() || $toAccount->user_id !== auth()->id()) {
            abort(403);
        }

        DB::transaction(function () use ($validated, $fromAccount, $toAccount) {
            $amountInCents = $validated['amount'] * 100;
            
            // Create outgoing transaction
            Transaction::create([
                'user_id' => auth()->id(),
                'account_id' => $fromAccount->id,
                'type' => 'expense',
                'amount' => $validated['amount'],
                'description' => $validated['description'] ?? "Transfer to {$toAccount->name}",
                'transaction_date' => $validated['transfer_date'],
            ]);

            // Create incoming transaction
            Transaction::create([
                'user_id' => auth()->id(),
                'account_id' => $toAccount->id,
                'type' => 'income',
                'amount' => $validated['amount'],
                'description' => $validated['description'] ?? "Transfer from {$fromAccount->name}",
                'transaction_date' => $validated['transfer_date'],
            ]);

            // Update account balances (in cents)
            $fromAccount->decrement('balance', $amountInCents);
            $toAccount->increment('balance', $amountInCents);
        });

        return redirect()->route('accounts.index')->with('success', 'Transfer completed successfully');
    }
}
