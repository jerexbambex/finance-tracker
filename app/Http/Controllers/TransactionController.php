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

        // Apply filters using when() for cleaner code
        $query->when($request->account_id, fn($q) => $q->where('account_id', $request->account_id))
              ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
              ->when($request->type, fn($q) => $q->where('type', $request->type))
              ->when($request->date_from, fn($q) => $q->whereDate('transaction_date', '>=', $request->date_from))
              ->when($request->date_to, fn($q) => $q->whereDate('transaction_date', '<=', $request->date_to))
              ->when($request->search, fn($q) => $q->where('description', 'like', '%' . $request->search . '%'))
              ->when($request->amount_min, fn($q) => $q->whereRaw('amount >= ?', [$request->amount_min * 100]))
              ->when($request->amount_max, fn($q) => $q->whereRaw('amount <= ?', [$request->amount_max * 100]));

        $transactions = $query->paginate(20)->withQueryString();
        
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
            'notes' => 'nullable|string',
            'receipt' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'tags' => 'nullable|string',
            'is_split' => 'nullable|boolean',
            'splits' => 'nullable|array',
            'splits.*.category_id' => 'required|exists:categories,id',
            'splits.*.amount' => 'required|numeric|min:0.01',
            'splits.*.description' => 'nullable|string',
        ]);

        // Verify account belongs to user
        $account = Account::where('id', $validated['account_id'])
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // Inherit currency from account
        $validated['currency'] = $account->currency;

        $transaction = auth()->user()->transactions()->create($validated);

        // Handle splits
        if (!empty($validated['splits'])) {
            foreach ($validated['splits'] as $split) {
                $transaction->splits()->create($split);
            }
        }

        // Handle tags
        if (!empty($validated['tags'])) {
            $tagNames = array_map('trim', explode(',', $validated['tags']));
            $tagIds = [];
            
            foreach ($tagNames as $tagName) {
                if (!empty($tagName)) {
                    $tag = \App\Models\Tag::firstOrCreate(
                        ['user_id' => auth()->id(), 'name' => $tagName],
                        ['color' => '#6b7280']
                    );
                    $tagIds[] = $tag->id;
                }
            }
            
            $transaction->tags()->attach($tagIds);
        }

        // Handle file upload
        if ($request->hasFile('receipt')) {
            $transaction->addMediaFromRequest('receipt')->toMediaCollection('receipts');
        }

        // Check budget alerts for expenses
        if ($transaction->type === 'expense') {
            if ($transaction->isSplit()) {
                // Check each split category
                foreach ($transaction->splits as $split) {
                    $this->checkBudgetAlertForSplit($split);
                }
            } elseif ($transaction->category_id) {
                $this->checkBudgetAlert($transaction);
            }
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
            'transaction' => $transaction->load('media'),
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
            'notes' => 'nullable|string',
            'receipt' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120'
        ]);

        $transaction->update($validated);

        // Handle file upload
        if ($request->hasFile('receipt')) {
            $transaction->clearMediaCollection('receipts');
            $transaction->addMediaFromRequest('receipt')->toMediaCollection('receipts');
        }

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
            ->where('period_year', $transaction->transaction_date->year)
            ->where('period_month', $transaction->transaction_date->month)
            ->first();

        if (!$budget) return;

        $spent = auth()->user()->transactions()
            ->where('type', 'expense')
            ->where('category_id', $transaction->category_id)
            ->whereYear('transaction_date', $transaction->transaction_date->year)
            ->whereMonth('transaction_date', $transaction->transaction_date->month)
            ->sum('amount');

        $percentage = ($spent / $budget->amount) * 100;

        // Notify when crossing thresholds
        if ($percentage >= 80) {
            // Send notification
        }
    }

    private function checkBudgetAlertForSplit(\App\Models\TransactionSplit $split): void
    {
        $transaction = $split->transaction;
        $budget = Budget::where('user_id', auth()->id())
            ->where('category_id', $split->category_id)
            ->where('period_year', $transaction->transaction_date->year)
            ->where('period_month', $transaction->transaction_date->month)
            ->first();

        if (!$budget) return;

        $spent = auth()->user()->transactions()
            ->where('type', 'expense')
            ->where('category_id', $split->category_id)
            ->whereYear('transaction_date', $transaction->transaction_date->year)
            ->whereMonth('transaction_date', $transaction->transaction_date->month)
            ->sum('amount');

        // Add split amounts
        $splitTotal = TransactionSplit::whereHas('transaction', function($q) use ($transaction) {
            $q->where('user_id', auth()->id())
              ->where('type', 'expense')
              ->whereYear('transaction_date', $transaction->transaction_date->year)
              ->whereMonth('transaction_date', $transaction->transaction_date->month);
        })->where('category_id', $split->category_id)->sum('amount');

        $totalSpent = $spent + $splitTotal;
        $percentage = ($totalSpent / $budget->amount) * 100;

        if ($percentage >= 80) {
            // Send notification
        }
    }
}
