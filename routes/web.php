<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
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
    $testimonials = \App\Models\Testimonial::with('user')
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


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

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
    Route::get('insights/ai/status', [App\Http\Controllers\SpendingInsightsController::class, 'aiInsightsStatus'])->name('insights.ai.status');
    Route::get('cash-flow', [App\Http\Controllers\CashFlowProjectionController::class, 'index'])->name('cash-flow.index');
    Route::resource('recurring-transactions', RecurringTransactionController::class);
    Route::get('reports', [ReportsController::class, 'index'])->name('reports.index');
    Route::resource('reminders', App\Http\Controllers\ReminderController::class);
    Route::post('/reminders/{reminder}/complete', [App\Http\Controllers\ReminderController::class, 'complete'])->name('reminders.complete');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');

    Route::get('/import/transactions', [ImportController::class, 'index'])->name('import.index');
    Route::post('/import/transactions', [ImportController::class, 'import'])->name('import.transactions');

    Route::get('/export/transactions', [App\Http\Controllers\ExportController::class, 'transactions'])->name('export.transactions');
    Route::get('/export/all-data', [App\Http\Controllers\ExportController::class, 'allData'])->name('export.all-data');

    Route::post('/testimonials', [App\Http\Controllers\TestimonialController::class, 'store'])->name('testimonials.store');
    Route::delete('/testimonials/{testimonial}', [App\Http\Controllers\TestimonialController::class, 'destroy'])->name('testimonials.destroy');

    Route::get('/transfers/create', [App\Http\Controllers\TransferController::class, 'create'])->name('transfers.create');
    Route::post('/transfers', [App\Http\Controllers\TransferController::class, 'store'])->name('transfers.store');
});

require __DIR__.'/settings.php';
