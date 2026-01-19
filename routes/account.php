<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::redirect('account', '/account/data-management');

    Route::get('account/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('account/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('account/data-management', [\App\Http\Controllers\AccountController::class, 'dataManagement'])->name('account.data-management');
    Route::post('account/data-management/import', [\App\Http\Controllers\AccountController::class, 'importData'])->name('account.data-management.import');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('account/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('account/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('account/password', [PasswordController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::get('account/appearance', function () {
        return Inertia::render('account/appearance');
    })->name('appearance.edit');

    Route::get('account/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
