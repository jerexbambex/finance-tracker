<?php

namespace App\Http\Controllers;

use App\Models\RecurringTransaction;
use App\Models\Account;
use App\Models\Category;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecurringTransactionController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $recurringTransactions = auth()->user()->recurringTransactions()
            ->with(['account', 'category'])
            ->orderBy('is_active', 'desc')
            ->orderBy('next_due_date')
            ->get();

        return Inertia::render('recurring-transactions/Index', [
            'recurringTransactions' => $recurringTransactions,
        ]);
    }

    public function create()
    {
        $accounts = auth()->user()->accounts()->where('is_active', true)->get();
        $categories = Category::where(function($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('is_active', true)->get();

        return Inertia::render('recurring-transactions/Create', [
            'accounts' => $accounts,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'frequency' => 'required|in:daily,weekly,biweekly,monthly,quarterly,yearly',
            'next_due_date' => 'required|date',
        ]);

        $validated['amount'] = $validated['amount'] * 100;

        auth()->user()->recurringTransactions()->create($validated);

        return redirect()->route('recurring-transactions.index');
    }

    public function edit(RecurringTransaction $recurringTransaction)
    {
        $this->authorize('update', $recurringTransaction);

        $accounts = auth()->user()->accounts()->where('is_active', true)->get();
        $categories = Category::where(function($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('is_active', true)->get();

        return Inertia::render('recurring-transactions/Edit', [
            'recurringTransaction' => $recurringTransaction,
            'accounts' => $accounts,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, RecurringTransaction $recurringTransaction)
    {
        $this->authorize('update', $recurringTransaction);

        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'frequency' => 'required|in:daily,weekly,biweekly,monthly,quarterly,yearly',
            'next_due_date' => 'required|date',
            'is_active' => 'boolean',
        ]);

        $validated['amount'] = $validated['amount'] * 100;

        $recurringTransaction->update($validated);

        return redirect()->route('recurring-transactions.index');
    }

    public function destroy(RecurringTransaction $recurringTransaction)
    {
        $this->authorize('delete', $recurringTransaction);

        $recurringTransaction->delete();

        return redirect()->route('recurring-transactions.index');
    }
}
