<?php

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
