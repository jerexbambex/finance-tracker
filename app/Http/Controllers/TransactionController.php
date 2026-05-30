<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\SavedFilter;
use App\Models\Transaction;
use App\Models\TransactionSplit;
use App\Http\Controllers\Concerns\ScopesOwnership;
use App\Notifications\BudgetExceededNotification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    use AuthorizesRequests, ScopesOwnership;

    public function index(Request $request)
    {
        $query = auth()->user()->transactions()
            ->with(['account', 'category', 'splits.category'])
            ->latest('transaction_date');

        // Load saved filter if requested
        if ($request->filter_id) {
            $savedFilter = auth()->user()->savedFilters()->find($request->filter_id);
            if ($savedFilter) {
                $request->merge($savedFilter->filters);
            }
        }

        // Apply filters using when() for cleaner code
        $query->when($request->account_id, fn ($q) => $q->where('account_id', $request->account_id))
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id))
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->date_from, fn ($q) => $q->whereDate('transaction_date', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('transaction_date', '<=', $request->date_to))
            ->when($request->search, fn ($q) => $q->where('description', 'like', '%'.$request->search.'%'))
            ->when($request->amount_min, fn ($q) => $q->whereRaw('amount >= ?', [$request->amount_min * 100]))
            ->when($request->amount_max, fn ($q) => $q->whereRaw('amount <= ?', [$request->amount_max * 100]));

        $transactions = $query->paginate(20)->withQueryString();

        $accounts = auth()->user()->accounts()->where('is_active', true)->get();
        $categories = Category::where(function ($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('is_active', true)->get();

        // Calculate chart data for different periods grouped by currency
        $dailyRows = auth()->user()->transactions()
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->where('transactions.transaction_date', '>=', now()->subDays(30))
            ->whereIn('transactions.type', ['income', 'expense'])
            ->selectRaw('transactions.type, accounts.currency, DATE(transactions.transaction_date) as day, SUM(transactions.amount) as total')
            ->groupBy('transactions.type', 'accounts.currency', 'day')
            ->orderBy('day')
            ->get();

        $dailyData = $dailyRows->groupBy('day')->map(function ($rows, $day) {
            $income = [];
            $expense = [];
            foreach ($rows as $row) {
                if ($row->type === 'income') {
                    $income[$row->currency] = ($income[$row->currency] ?? 0) + $row->total / 100;
                } else {
                    $expense[$row->currency] = ($expense[$row->currency] ?? 0) + $row->total / 100;
                }
            }

            return ['period' => date('M d', strtotime($day)), 'income' => $income, 'expense' => $expense];
        })->values();

        $monthlyData = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $rows = auth()->user()->transactions()
                ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
                ->whereYear('transactions.transaction_date', $date->year)
                ->whereMonth('transactions.transaction_date', $date->month)
                ->whereIn('transactions.type', ['income', 'expense'])
                ->selectRaw('transactions.type, accounts.currency, SUM(transactions.amount) as total')
                ->groupBy('transactions.type', 'accounts.currency')
                ->get();

            $income = [];
            $expense = [];
            foreach ($rows as $row) {
                if ($row->type === 'income') {
                    $income[$row->currency] = ($income[$row->currency] ?? 0) + $row->total / 100;
                } else {
                    $expense[$row->currency] = ($expense[$row->currency] ?? 0) + $row->total / 100;
                }
            }

            $monthlyData->push(['period' => $date->format('M'), 'income' => $income, 'expense' => $expense]);
        }

        $yearlyData = collect();
        for ($month = 1; $month <= 12; $month++) {
            $rows = auth()->user()->transactions()
                ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
                ->whereYear('transactions.transaction_date', now()->year)
                ->whereMonth('transactions.transaction_date', $month)
                ->whereIn('transactions.type', ['income', 'expense'])
                ->selectRaw('transactions.type, accounts.currency, SUM(transactions.amount) as total')
                ->groupBy('transactions.type', 'accounts.currency')
                ->get();

            $income = [];
            $expense = [];
            foreach ($rows as $row) {
                if ($row->type === 'income') {
                    $income[$row->currency] = ($income[$row->currency] ?? 0) + $row->total / 100;
                } else {
                    $expense[$row->currency] = ($expense[$row->currency] ?? 0) + $row->total / 100;
                }
            }

            $yearlyData->push(['period' => date('M', mktime(0, 0, 0, $month, 1)), 'income' => $income, 'expense' => $expense]);
        }

        $savedFilters = auth()->user()->savedFilters()
            ->where('type', 'transaction')
            ->get();

        return Inertia::render('transactions/Index', [
            'transactions' => $transactions,
            'accounts' => $accounts,
            'categories' => $categories,
            'chartData' => [
                'daily' => $dailyData,
                'monthly' => $monthlyData,
                'yearly' => $yearlyData,
            ],
            'filters' => $request->only(['account_id', 'category_id', 'type', 'date_from', 'date_to', 'search']),
            'savedFilters' => $savedFilters,
        ]);
    }

    public function create()
    {
        $accounts = auth()->user()->accounts()->where('is_active', true)->get();
        $categories = Category::where(function ($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('is_active', true)->get();

        return Inertia::render('transactions/Create', [
            'accounts' => $accounts,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => ['required', $this->ownedAccountExists()],
            'category_id' => ['nullable', $this->ownedCategoryExists()],
            'type' => 'required|string|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string',
            'receipt' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'tags' => 'nullable|string',
            'is_split' => 'nullable|boolean',
            'splits' => 'nullable|array',
            'splits.*.category_id' => ['required', $this->ownedCategoryExists()],
            'splits.*.amount' => 'required|numeric|min:0.01',
            'splits.*.description' => 'nullable|string',
        ]);

        // Verify account belongs to user
        $account = Account::where('id', $validated['account_id'])
            ->where('user_id', auth()->id())
            ->firstOrFail();

        // Inherit currency from account
        $validated['currency'] = $account->currency;

        // Atomic: transaction insert + split rows + the observer's balance update
        // either all commit or all roll back together.
        $transaction = DB::transaction(function () use ($validated) {
            $transaction = auth()->user()->transactions()->create($validated);

            if (! empty($validated['splits'])) {
                foreach ($validated['splits'] as $split) {
                    $transaction->splits()->create($split);
                }
            }

            if (! empty($validated['tags'])) {
                $tagNames = array_map('trim', explode(',', $validated['tags']));
                $tagIds = [];
                foreach ($tagNames as $tagName) {
                    if (! empty($tagName)) {
                        $tag = \App\Models\Tag::firstOrCreate(
                            ['user_id' => auth()->id(), 'name' => $tagName],
                            ['color' => '#6b7280']
                        );
                        $tagIds[] = $tag->id;
                    }
                }
                $transaction->tags()->attach($tagIds);
            }

            return $transaction;
        });

        // Handle file upload (outside the txn — external storage, not balance-critical)
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

        $transaction->load(['account', 'category', 'media']);

        return Inertia::render('transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    public function edit(Transaction $transaction)
    {
        $this->authorize('update', $transaction);

        $accounts = auth()->user()->accounts()->where('is_active', true)->get();
        $categories = Category::where(function ($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('is_active', true)->get();

        return Inertia::render('transactions/Edit', [
            'transaction' => $transaction->load(['media', 'splits.category', 'tags']),
            'accounts' => $accounts,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $this->authorize('update', $transaction);

        // Transfers are managed only through TransferController (paired legs);
        // the generic path must not create or convert one-sided transfers.
        abort_if($transaction->type === 'transfer', 403, 'Transfers cannot be edited here.');

        $validated = $request->validate([
            'account_id' => ['required', $this->ownedAccountExists()],
            'category_id' => ['nullable', $this->ownedCategoryExists()],
            'type' => 'required|string|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string',
            'receipt' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'tags' => 'nullable|string',
            'is_split' => 'nullable|boolean',
            'splits' => 'nullable|array',
            'splits.*.category_id' => ['required', $this->ownedCategoryExists()],
            'splits.*.amount' => 'required|numeric|min:0.01',
            'splits.*.description' => 'nullable|string',
        ]);

        // Inherit currency from account
        $account = Account::where('id', $validated['account_id'])
            ->where('user_id', auth()->id())
            ->firstOrFail();
        $validated['currency'] = $account->currency;

        // Atomic: the update (and its observer balance re-adjustment) + split/tag sync
        DB::transaction(function () use ($transaction, $validated) {
            $transaction->update($validated);

            // Sync splits
            if (! empty($validated['splits'])) {
                $transaction->splits()->delete();
                foreach ($validated['splits'] as $split) {
                    $transaction->splits()->create($split);
                }
            } elseif (empty($validated['is_split'])) {
                $transaction->splits()->delete();
            }

            // Sync tags
            $transaction->tags()->detach();
            if (! empty($validated['tags'])) {
                $tagNames = array_filter(array_map('trim', explode(',', $validated['tags'])));
                $tagIds = [];
                foreach ($tagNames as $tagName) {
                    $tag = \App\Models\Tag::firstOrCreate(
                        ['user_id' => auth()->id(), 'name' => $tagName],
                        ['color' => '#6b7280']
                    );
                    $tagIds[] = $tag->id;
                }
                $transaction->tags()->attach($tagIds);
            }
        });

        // Handle file upload
        if ($request->hasFile('receipt')) {
            $transaction->clearMediaCollection('receipts');
            $transaction->addMediaFromRequest('receipt')->toMediaCollection('receipts');
        }

        return redirect()->route('transactions.index')->with('success', 'Transaction updated successfully.');
    }

    public function destroy(Transaction $transaction)
    {
        $this->authorize('delete', $transaction);

        // A transfer is one logical operation — deleting one leg deletes both, so
        // balances on both accounts reverse and no orphaned half-transfer remains.
        // Per-row delete (not mass delete) so the observer fires for each leg.
        DB::transaction(function () use ($transaction) {
            if ($transaction->type === 'transfer' && $transaction->transfer_group_id) {
                auth()->user()->transactions()
                    ->where('transfer_group_id', $transaction->transfer_group_id)
                    ->get()
                    ->each
                    ->delete();
            } else {
                $transaction->delete();
            }
        });

        return redirect()->route('transactions.index');
    }

    private function checkBudgetAlert(Transaction $transaction): void
    {
        $this->alertForCategory($transaction->category_id, $transaction->transaction_date);
    }

    private function checkBudgetAlertForSplit(TransactionSplit $split): void
    {
        $this->alertForCategory($split->category_id, $split->transaction->transaction_date);
    }

    /**
     * Notify when a category's budget crosses 80%. Spend is computed by the
     * single split-aware source of truth, Budget::getSpentAmount().
     */
    private function alertForCategory(?string $categoryId, $date): void
    {
        if (! $categoryId) {
            return;
        }

        // Match a monthly budget for the transaction's month OR a yearly budget for its year.
        $budgets = Budget::where('user_id', auth()->id())
            ->where('category_id', $categoryId)
            ->where('period_year', $date->year)
            ->where(function ($q) use ($date) {
                $q->where('period_type', 'yearly')
                    ->orWhere(function ($q2) use ($date) {
                        $q2->where('period_type', 'monthly')->where('period_month', $date->month);
                    });
            })
            ->with('category')
            ->get();

        foreach ($budgets as $budget) {
            $percentage = $budget->getPercentageUsed();
            if ($percentage >= 80) {
                auth()->user()->notify(new BudgetExceededNotification($budget, $budget->getSpentAmount(), $percentage));
            }
        }
    }

    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => ['required', \Illuminate\Validation\Rule::exists('transactions', 'id')->where('user_id', auth()->id())],
        ]);

        // Delete individually so TransactionObserver fires (balance updates per row),
        // wrapped in one transaction so the whole batch is atomic.
        $transactions = auth()->user()->transactions()->whereIn('id', $validated['ids'])->get();
        DB::transaction(fn () => $transactions->each->delete());

        return redirect()->back()->with('success', "Deleted {$transactions->count()} transactions");
    }

    public function bulkCategorize(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => ['required', \Illuminate\Validation\Rule::exists('transactions', 'id')->where('user_id', auth()->id())],
            'category_id' => ['required', $this->ownedCategoryExists()],
        ]);

        // Only update transactions that don't have splits
        $updated = auth()->user()->transactions()
            ->whereIn('id', $validated['ids'])
            ->whereDoesntHave('splits')
            ->update(['category_id' => $validated['category_id']]);

        $skipped = count($validated['ids']) - $updated;
        $message = "Updated {$updated} transactions";
        if ($skipped > 0) {
            $message .= " ({$skipped} split transactions skipped)";
        }

        return redirect()->back()->with('success', $message);
    }

    public function saveFilter(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'filters' => 'required|array',
        ]);

        auth()->user()->savedFilters()->create([
            'name' => $validated['name'],
            'type' => 'transaction',
            'filters' => $validated['filters'],
        ]);

        return redirect()->back()->with('success', 'Filter saved successfully');
    }

    public function deleteFilter(SavedFilter $filter)
    {
        if ($filter->user_id !== auth()->id()) {
            abort(403);
        }

        $filter->delete();

        return redirect()->back()->with('success', 'Filter deleted');
    }
}
