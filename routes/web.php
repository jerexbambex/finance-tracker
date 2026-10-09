<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\BudgetRecommendationController;
use App\Http\Controllers\CashFlowProjectionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\GoalContributionController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\NetWorthController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RecurringTransactionController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\SpendingInsightsController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\TestimonialController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransferController;
use App\Models\Testimonial;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    $testimonials = Testimonial::with('user')
        ->approved()
        ->featured()
        ->latest('approved_at')
        ->take(3)
        ->get()
        ->map(fn ($testimonial) => [
            'name' => $testimonial->user->name,
            'content' => $testimonial->content,
            'rating' => $testimonial->rating,
        ]);

    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'testimonials' => $testimonials,
    ]);
})->name('home');

Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy');
})->name('privacy-policy');

Route::get('/status', [StatusController::class, 'index'])->name('status');
Route::get('/status/history', [StatusController::class, 'history'])->name('status.history');
Route::get('/status.json', [StatusController::class, 'check'])->name('status.check');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::resource('accounts', AccountController::class);
    Route::resource('transactions', TransactionController::class);
    Route::post('transactions/bulk-delete', [TransactionController::class, 'bulkDelete'])->name('transactions.bulk-delete');
    Route::post('transactions/bulk-categorize', [TransactionController::class, 'bulkCategorize'])->name('transactions.bulk-categorize');
    Route::post('saved-filters', [TransactionController::class, 'saveFilter'])->name('filters.save');
    Route::delete('saved-filters/{filter}', [TransactionController::class, 'deleteFilter'])->name('filters.delete');
    Route::post('budgets/copy', [BudgetController::class, 'copy'])->name('budgets.copy');
    Route::get('budgets/recommendations', [BudgetRecommendationController::class, 'index'])->name('budgets.recommendations');
    Route::post('budgets/recommendations/apply', [BudgetRecommendationController::class, 'apply'])->name('budgets.recommendations.apply');
    Route::resource('budgets', BudgetController::class);
    Route::resource('goals', GoalController::class);
    Route::post('goals/{goal}/contribute', [GoalContributionController::class, 'store'])->name('goals.contribute');
    Route::resource('categories', CategoryController::class);
    Route::get('insights', [SpendingInsightsController::class, 'index'])->name('insights.index');
    Route::post('insights/ai', [SpendingInsightsController::class, 'generateAiInsights'])->name('insights.ai');
    Route::get('insights/ai/status', [SpendingInsightsController::class, 'aiInsightsStatus'])->name('insights.ai.status');
    Route::get('cash-flow', [CashFlowProjectionController::class, 'index'])->name('cash-flow.index');
    Route::get('net-worth', [NetWorthController::class, 'index'])->name('net-worth.index');
    Route::get('search', [SearchController::class, 'index'])->name('search');
    Route::resource('recurring-transactions', RecurringTransactionController::class);
    Route::get('reports', [ReportsController::class, 'index'])->name('reports.index');
    Route::get('reports/pdf', [ReportsController::class, 'pdf'])->name('reports.pdf');
    Route::resource('reminders', ReminderController::class);
    Route::post('/reminders/{reminder}/complete', [ReminderController::class, 'complete'])->name('reminders.complete');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');

    Route::get('/import/transactions', [ImportController::class, 'index'])->name('import.index');
    Route::post('/import/transactions', [ImportController::class, 'import'])->name('import.transactions');

    Route::get('/export/transactions', [ExportController::class, 'transactions'])->name('export.transactions');
    Route::get('/export/statement', [ExportController::class, 'statement'])->name('export.statement');
    Route::get('/export/all-data', [ExportController::class, 'allData'])->name('export.all-data');

    Route::post('/testimonials', [TestimonialController::class, 'store'])->name('testimonials.store');
    Route::delete('/testimonials/{testimonial}', [TestimonialController::class, 'destroy'])->name('testimonials.destroy');

    Route::get('/transfers/create', [TransferController::class, 'create'])->name('transfers.create');
    Route::post('/transfers', [TransferController::class, 'store'])->name('transfers.store');
});

require __DIR__.'/settings.php';
