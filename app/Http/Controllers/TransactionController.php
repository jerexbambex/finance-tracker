<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Account;
use App\Models\Category;
use App\Models\Budget;
use App\Notifications\BudgetExceededNotification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $query = auth()->user()->transactions()
            ->with(['account', 'category'])
            ->latest('transaction_date');

        // Apply filters
        if ($request->account_id) {
            $query->where('account_id', $request->account_id);
        }
        
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        
        if ($request->type) {
            $query->where('type', $request->type);
        }

        $transactions = $query->paginate(20);
        
        $accounts = auth()->user()->accounts()->where('is_active', true)->get();
        $categories = Category::where(function($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('is_active', true)->get();

        // Calculate chart data for different periods
        $dailyData = auth()->user()->transactions()
            ->where('transaction_date', '>=', now()->subDays(30))
            ->get()
            ->groupBy(function($transaction) {
                return $transaction->transaction_date->format('Y-m-d');
            })
            ->map(function($dayTransactions, $date) {
                return [
                    'period' => date('M d', strtotime($date)),
                    'income' => $dayTransactions->where('type', 'income')->sum('amount'),
                    'expense' => $dayTransactions->where('type', 'expense')->sum('amount'),
                ];
            })
            ->sortKeys()
            ->values();

        $monthlyData = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            
            $monthTransactions = auth()->user()->transactions()
                ->whereYear('transaction_date', $date->year)
                ->whereMonth('transaction_date', $date->month)
                ->get();
            
            $monthlyData->push([
                'period' => $date->format('M'),
                'income' => $monthTransactions->where('type', 'income')->sum('amount'),
                'expense' => $monthTransactions->where('type', 'expense')->sum('amount'),
            ]);
        }

        $yearlyData = collect();
        for ($month = 1; $month <= 12; $month++) {
            $monthTransactions = auth()->user()->transactions()
                ->whereYear('transaction_date', now()->year)
                ->whereMonth('transaction_date', $month)
                ->get();
            
            $yearlyData->push([
                'period' => date('M', mktime(0, 0, 0, $month, 1)),
                'income' => $monthTransactions->where('type', 'income')->sum('amount'),
                'expense' => $monthTransactions->where('type', 'expense')->sum('amount'),
            ]);
        }

        return Inertia::render('transactions/Index', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'categories' => $categories,
            'chartData' => [
                'daily' => $dailyData,
                'monthly' => $monthlyData,
                'yearly' => $yearlyData,
            ],
            'filters' => $request->only(['account_id', 'category_id', 'type'])
        ]);
    }

    public function create()
    {
        $accounts = auth()->user()->accounts()->where('is_active', true)->get();
        $categories = Category::where(function($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('is_active', true)->get();

        return Inertia::render('transactions/Create', [
            'accounts' => $accounts,
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'type' => 'required|string|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        // Verify account belongs to user
        $account = Account::where('id', $validated['account_id'])
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $transaction = auth()->user()->transactions()->create($validated);

        // Check budget alerts for expenses
        if ($transaction->type === 'expense' && $transaction->category_id) {
            $this->checkBudgetAlert($transaction);
        }

        return redirect()->route('transactions.index');
    }

    public function show(Transaction $transaction)
    {
        $this->authorize('view', $transaction);
        
        $transaction->load(['account', 'category']);

        return Inertia::render('transactions/Show', [
            'transaction' => $transaction
        ]);
    }

    public function edit(Transaction $transaction)
    {
        $this->authorize('update', $transaction);
        
        $accounts = auth()->user()->accounts()->where('is_active', true)->get();
        $categories = Category::where(function($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('is_active', true)->get();

        return Inertia::render('transactions/Edit', [
            'transaction' => $transaction,
            'accounts' => $accounts,
            'categories' => $categories
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);
        
        $validated = $request->validate([
            'account_id' => 'required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'type' => 'required|string|in:income,expense,transfer',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        $transaction->update($validated);

        return redirect()->route('transactions.index');
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);
        
        $transaction->delete();

        return redirect()->route('transactions.index');
    }

    private function checkBudgetAlert(Transaction $transaction): void
    {
        $budget = Budget::where('user_id', auth()->id())
            ->where('category_id', $transaction->category_id)
            ->whereYear('month', $transaction->transaction_date->year)
            ->whereMonth('month', $transaction->transaction_date->month)
            ->first();

        if (!$budget) return;

        $spent = auth()->user()->transactions()
            ->where('type', 'expense')
            ->where('category_id', $transaction->category_id)
            ->whereYear('transaction_date', $transaction->transaction_date->year)
            ->whereMonth('transaction_date', $transaction->transaction_date->month)
            ->sum('amount');

        $percentage = ($spent / $budget->amount) * 100;

        // Notify at 80%, 100%, and 120%
        if (in_array((int)$percentage, [80, 100, 120])) {
            auth()->user()->notify(new BudgetExceededNotification($budget, $spent / 100, $percentage));
        }
    }
}
