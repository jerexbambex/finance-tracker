<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ReportsController;
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
        
        // Calculate monthly income and expenses
        $startOfMonth = now()->startOfMonth();
        $monthlyIncome = $user->transactions()
            ->where('type', 'income')
            ->where('transaction_date', '>=', $startOfMonth)
            ->sum('amount') / 100;
            
        $monthlyExpenses = $user->transactions()
            ->where('type', 'expense')
            ->where('transaction_date', '>=', $startOfMonth)
            ->sum('amount') / 100;
        
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
            'budgets' => $budgets,
            'goals' => $goals,
        ]);
    })->name('dashboard');
    
    Route::resource('accounts', AccountController::class);
    Route::resource('transactions', TransactionController::class);
    Route::resource('budgets', BudgetController::class);
    Route::resource('goals', GoalController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('reports', ReportsController::class)->only(['index']);
    
    Route::get('/export/transactions', [ExportController::class, 'exportTransactions'])->name('export.transactions');
    Route::get('/export/all', [ExportController::class, 'exportAll'])->name('export.all');
});

require __DIR__.'/settings.php';
