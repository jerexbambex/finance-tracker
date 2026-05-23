<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
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
});
