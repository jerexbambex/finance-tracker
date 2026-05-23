<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BudgetController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\Api\InsightsController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\SyncController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (v1)
|--------------------------------------------------------------------------
|
| All routes here are exposed under the /api/v1 prefix and return JSON
| using the standard envelope:
|
|     { "success": true|false, "data": ..., "message"?: ..., "pagination"?: {...} }
|
| Helpers: response()->apiSuccess(...) and response()->apiError(...).
|
*/

Route::get('/health', function () {
    return response()->apiSuccess([
        'status' => 'ok',
        'time' => now()->toIso8601String(),
    ]);
})->name('api.health');

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('api.auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('api.auth.login');
    Route::post('/refresh', [AuthController::class, 'refresh'])->name('api.auth.refresh');
    Route::post('/biometric/verify', [AuthController::class, 'biometricVerify'])->name('api.auth.biometric.verify');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('api.auth.logout');
        Route::get('/me', [AuthController::class, 'me'])->name('api.auth.me');
        Route::post('/biometric/enroll', [AuthController::class, 'biometricEnroll'])->name('api.auth.biometric.enroll');
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/categories/seed-defaults', [CategoryController::class, 'seedDefaults'])
        ->name('api.categories.seed');
    Route::get('/categories', [CategoryController::class, 'index'])->name('api.categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('api.categories.store');
    Route::get('/categories/{id}', [CategoryController::class, 'show'])->name('api.categories.show');
    Route::match(['put', 'patch'], '/categories/{id}', [CategoryController::class, 'update'])
        ->name('api.categories.update');
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy'])
        ->name('api.categories.destroy');

    Route::post('/transactions/bulk', [TransactionController::class, 'bulk'])
        ->name('api.transactions.bulk');
    Route::get('/transactions/summary', [TransactionController::class, 'summary'])
        ->name('api.transactions.summary');
    Route::get('/transactions/recent', [TransactionController::class, 'recent'])
        ->name('api.transactions.recent');
    Route::get('/transactions', [TransactionController::class, 'index'])->name('api.transactions.index');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('api.transactions.store');
    Route::get('/transactions/{id}', [TransactionController::class, 'show'])->name('api.transactions.show');
    Route::match(['put', 'patch'], '/transactions/{id}', [TransactionController::class, 'update'])
        ->name('api.transactions.update');
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy'])
        ->name('api.transactions.destroy');

    // Budgets — order matters: bulk/analysis/alerts before {id}.
    Route::post('/budgets/bulk', [BudgetController::class, 'bulk'])->name('api.budgets.bulk');
    Route::get('/budgets/analysis', [BudgetController::class, 'analysis'])->name('api.budgets.analysis');
    Route::get('/budgets/alerts', [BudgetController::class, 'alerts'])->name('api.budgets.alerts');
    Route::get('/budgets', [BudgetController::class, 'index'])->name('api.budgets.index');
    Route::post('/budgets', [BudgetController::class, 'store'])->name('api.budgets.store');
    Route::delete('/budgets/{id}', [BudgetController::class, 'destroy'])->name('api.budgets.destroy');

    // Savings goals.
    Route::get('/savings-goals', [GoalController::class, 'index'])->name('api.goals.index');
    Route::post('/savings-goals', [GoalController::class, 'store'])->name('api.goals.store');
    Route::get('/savings-goals/{id}', [GoalController::class, 'show'])->name('api.goals.show');
    Route::match(['put', 'patch'], '/savings-goals/{id}', [GoalController::class, 'update'])
        ->name('api.goals.update');
    Route::delete('/savings-goals/{id}', [GoalController::class, 'destroy'])->name('api.goals.destroy');
    Route::post('/savings-goals/{id}/contribute', [GoalController::class, 'contribute'])
        ->name('api.goals.contribute');
    Route::get('/savings-goals/{id}/progress', [GoalController::class, 'progress'])
        ->name('api.goals.progress');

    // Insights.
    Route::get('/insights/dashboard', [InsightsController::class, 'dashboard'])
        ->name('api.insights.dashboard');
    Route::get('/insights/spending-breakdown', [InsightsController::class, 'spendingBreakdown'])
        ->name('api.insights.breakdown');
    Route::get('/insights/trends', [InsightsController::class, 'trends'])->name('api.insights.trends');
    Route::get('/insights/ai-summary', [InsightsController::class, 'aiSummary'])
        ->name('api.insights.ai');

    // Settings (per-user app preferences).
    Route::get('/settings', [SettingsController::class, 'show'])->name('api.settings.show');
    Route::match(['put', 'patch'], '/settings', [SettingsController::class, 'update'])
        ->name('api.settings.update');

    // Sync (premium only). Free users get a 402 from EnsurePremium.
    Route::middleware('ensure.premium')->prefix('sync')->group(function () {
        Route::post('/push', [SyncController::class, 'push'])->name('api.sync.push');
        Route::get('/pull', [SyncController::class, 'pull'])->name('api.sync.pull');
        Route::get('/status', [SyncController::class, 'status'])->name('api.sync.status');
    });
});
