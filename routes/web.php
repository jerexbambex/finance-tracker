<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\RecurringTransactionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        $user = auth()->user();
        
        // Get account summaries
        $accounts = $user->accounts()->where('is_active', true)->get();
        $totalBalance = $accounts->sum('balance');
        
        // Get recent transactions
        $recentTransactions = $user->transactions()
            ->with(['account', 'category'])
            ->latest('transaction_date')
            ->take(10)
            ->get();
        
        // Calculate monthly income and expenses (use raw query to avoid accessor)
        $startOfMonth = now()->startOfMonth();
        $monthlyIncome = $user->transactions()
            ->where('type', 'income')
            ->where('transaction_date', '>=', $startOfMonth)
            ->sum(\DB::raw('amount')) / 100;
            
        $monthlyExpenses = $user->transactions()
            ->where('type', 'expense')
            ->where('transaction_date', '>=', $startOfMonth)
            ->sum(\DB::raw('amount')) / 100;
        
        // Spending by category (current month) - use raw sum
        $categorySpending = $user->transactions()
            ->selectRaw('category_id, SUM(amount) as total')
            ->with('category')
            ->where('type', 'expense')
            ->where('transaction_date', '>=', $startOfMonth)
            ->groupBy('category_id')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(function($transaction) {
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
        
        // Budget progress
        $currentMonth = now()->month;
        $currentYear = now()->year;
        $budgets = $user->budgets()
            ->with('category')
            ->where('period_year', $currentYear)
            ->where(function($q) use ($currentMonth) {
                $q->where('period_type', 'yearly')
                  ->orWhere(function($q2) use ($currentMonth) {
                      $q2->where('period_type', 'monthly')
                         ->where('period_month', $currentMonth);
                  });
            })
            ->get()
            ->map(function($budget) {
                return [
                    'category' => $budget->category->name,
                    'percentage' => $budget->getPercentageUsed(),
                ];
            });
        
        // Active goals
        $goals = $user->goals()
            ->where('is_active', true)
            ->where('is_completed', false)
            ->get()
            ->map(function($goal) {
                return [
                    'name' => $goal->name,
                    'percentage' => $goal->getPercentageComplete(),
                ];
            });
        
        return Inertia::render('dashboard', [
            'accounts' => $accounts,
            'totalBalance' => $totalBalance,
            'recentTransactions' => $recentTransactions,
            'monthlyIncome' => $monthlyIncome,
            'monthlyExpenses' => $monthlyExpenses,
            'categorySpending' => $categorySpending,
            'monthlyTrend' => $monthlyTrend,
            'budgets' => $budgets,
            'goals' => $goals,
            'categories' => \App\Models\Category::where(function($q) use ($user) {
                $q->whereNull('user_id')->orWhere('user_id', $user->id);
            })->where('is_active', true)->get(),
        ]);
    })->name('dashboard');
    
    Route::resource('accounts', AccountController::class);
    Route::resource('transactions', TransactionController::class);
    Route::resource('budgets', BudgetController::class);
    Route::resource('goals', GoalController::class);
    Route::resource('categories', CategoryController::class);
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
    
    Route::get('/transfers/create', [App\Http\Controllers\TransferController::class, 'create'])->name('transfers.create');
    Route::post('/transfers', [App\Http\Controllers\TransferController::class, 'store'])->name('transfers.store');
    
    Route::get('/export/transactions', [ExportController::class, 'exportTransactions'])->name('export.transactions');
    Route::get('/export/all', [ExportController::class, 'exportAll'])->name('export.all');
});

require __DIR__.'/settings.php';
