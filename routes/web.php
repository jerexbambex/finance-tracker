<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RecurringTransactionController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/test-export', function () {
    return 'Export route works!';
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();

        // Get account summaries grouped by currency
        $accounts = $user->accounts()->where('is_active', true)->get();
        $balancesByCurrency = $accounts->groupBy('currency')->map(fn ($accts) => $accts->sum('balance'));

        // Get recent transactions
        $recentTransactions = $user->transactions()
            ->with(['account', 'category'])
            ->latest('transaction_date')
            ->take(10)
            ->get();

        // Calculate monthly income and expenses by currency
        $startOfMonth = now()->startOfMonth();
        $incomeByCurrency = $user->transactions()
            ->where('transactions.type', 'income')
            ->where('transaction_date', '>=', $startOfMonth)
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->selectRaw('accounts.currency, SUM(transactions.amount) as total')
            ->groupBy('accounts.currency')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->currency => $item->total / 100]);

        $expensesByCurrency = $user->transactions()
            ->where('transactions.type', 'expense')
            ->where('transaction_date', '>=', $startOfMonth)
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->selectRaw('accounts.currency, SUM(transactions.amount) as total')
            ->groupBy('accounts.currency')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->currency => $item->total / 100]);

        // Spending by category (current month) - use raw sum
        $categorySpending = $user->transactions()
            ->selectRaw('category_id, SUM(amount) as total')
            ->with('category')
            ->where('type', 'expense')
            ->where('transaction_date', '>=', $startOfMonth)
            ->whereNotNull('category_id')
            ->where('category_id', '!=', '')
            ->whereHas('category', function ($query) {
                $query->where('type', 'expense');
            })
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(function ($transaction) {
                return [
                    'name' => $transaction->category ? $transaction->category->name : 'Uncategorized',
                    'amount' => $transaction->total / 100,
                    'color' => $transaction->category ? $transaction->category->color : '#6b7280',
                ];
            });

        // Last 6 months trend - use raw sum
        $monthlyTrend = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);

            $income = $user->transactions()
                ->where('type', 'income')
                ->whereYear('transaction_date', $date->year)
                ->whereMonth('transaction_date', $date->month)
                ->sum(\DB::raw('amount')) / 100;

            $expense = $user->transactions()
                ->where('type', 'expense')
                ->whereYear('transaction_date', $date->year)
                ->whereMonth('transaction_date', $date->month)
                ->sum(\DB::raw('amount')) / 100;

            $monthlyTrend->push([
                'month' => $date->format('M'),
                'income' => $income,
                'expense' => $expense,
            ]);
        }

        // Budget progress with alerts
        $currentMonth = now()->month;
        $currentYear = now()->year;
        $budgets = $user->budgets()
            ->with('category')
            ->where('period_year', $currentYear)
            ->where(function ($q) use ($currentMonth) {
                $q->where('period_type', 'yearly')
                    ->orWhere(function ($q2) use ($currentMonth) {
                        $q2->where('period_type', 'monthly')
                            ->where('period_month', $currentMonth);
                    });
            })
            ->get()
            ->map(function ($budget) {
                $percentage = $budget->getPercentageUsed();

                return [
                    'id' => $budget->id,
                    'category' => $budget->category->name,
                    'percentage' => $percentage,
                    'amount' => $budget->amount,
                    'spent' => $budget->getSpentAmount(),
                    'status' => $percentage >= 100 ? 'exceeded' : ($percentage >= 80 ? 'warning' : 'ok'),
                ];
            });

        $budgetAlerts = $budgets->filter(fn ($b) => $b['status'] !== 'ok');

        // Active goals
        $goals = $user->goals()
            ->where('is_active', true)
            ->where('is_completed', false)
            ->get()
            ->map(function ($goal) {
                return [
                    'name' => $goal->name,
                    'percentage' => $goal->getPercentageComplete(),
                ];
            });

        // Upcoming reminders (next 7 days)
        $upcomingReminders = $user->reminders()
            ->with('category')
            ->where('is_completed', false)
            ->where('due_date', '<=', now()->addDays(7))
            ->orderBy('due_date')
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'accounts' => $accounts,
            'balancesByCurrency' => $balancesByCurrency,
            'recentTransactions' => $recentTransactions,
            'incomeByCurrency' => $incomeByCurrency,
            'expensesByCurrency' => $expensesByCurrency,
            'categorySpending' => $categorySpending,
            'monthlyTrend' => $monthlyTrend,
            'budgets' => $budgets,
            'budgetAlerts' => $budgetAlerts,
            'goals' => $goals,
            'upcomingReminders' => $upcomingReminders,
            'categories' => \App\Models\Category::where(function ($q) use ($user) {
                $q->whereNull('user_id')->orWhere('user_id', $user->id);
            })->where('is_active', true)->get(),
            'currencies' => collect(\App\Currency::cases())->mapWithKeys(fn ($currency) => [
                $currency->value => ['symbol' => $currency->symbol(), 'label' => $currency->label()],
            ]),
        ]);
    })->name('dashboard');

    Route::resource('accounts', AccountController::class);
    Route::resource('transactions', TransactionController::class);
    Route::post('transactions/bulk-delete', [App\Http\Controllers\TransactionController::class, 'bulkDelete'])->name('transactions.bulk-delete');
    Route::post('transactions/bulk-categorize', [App\Http\Controllers\TransactionController::class, 'bulkCategorize'])->name('transactions.bulk-categorize');
    Route::post('saved-filters', [App\Http\Controllers\TransactionController::class, 'saveFilter'])->name('filters.save');
    Route::delete('saved-filters/{filter}', [App\Http\Controllers\TransactionController::class, 'deleteFilter'])->name('filters.delete');
    Route::get('budgets/recommendations', [App\Http\Controllers\BudgetRecommendationController::class, 'index'])->name('budgets.recommendations');
    Route::post('budgets/recommendations/apply', [App\Http\Controllers\BudgetRecommendationController::class, 'apply'])->name('budgets.recommendations.apply');
    Route::resource('budgets', BudgetController::class);
    Route::resource('goals', GoalController::class);
    Route::post('goals/{goal}/contribute', [App\Http\Controllers\GoalContributionController::class, 'store'])->name('goals.contribute');
    Route::resource('categories', CategoryController::class);
    Route::get('insights', [App\Http\Controllers\SpendingInsightsController::class, 'index'])->name('insights.index');
    Route::post('insights/ai', [App\Http\Controllers\SpendingInsightsController::class, 'generateAiInsights'])->name('insights.ai');
    Route::resource('recurring-transactions', RecurringTransactionController::class);
    Route::resource('reports', ReportsController::class)->only(['index']);
    Route::resource('reminders', App\Http\Controllers\ReminderController::class);
    Route::post('/reminders/{reminder}/complete', [App\Http\Controllers\ReminderController::class, 'complete'])->name('reminders.complete');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');

    Route::get('/import/transactions', [ImportController::class, 'index'])->name('import.index');
    Route::post('/import/transactions', [ImportController::class, 'import'])->name('import.transactions');

    Route::get('/export/transactions', [App\Http\Controllers\ExportController::class, 'transactions'])->name('export.transactions');
    Route::get('/export/all-data', [App\Http\Controllers\ExportController::class, 'allData'])->name('export.all-data');

    Route::get('/settings', [App\Http\Controllers\SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/import', [App\Http\Controllers\SettingsController::class, 'importData'])->name('settings.import');

    Route::get('/transfers/create', [App\Http\Controllers\TransferController::class, 'create'])->name('transfers.create');
    Route::post('/transfers', [App\Http\Controllers\TransferController::class, 'store'])->name('transfers.store');
});

require __DIR__.'/settings.php';
