<?php

use App\Http\Controllers\Api\AuthController;
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
