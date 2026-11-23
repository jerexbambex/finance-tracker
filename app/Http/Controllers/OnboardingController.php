<?php

namespace App\Http\Controllers;

use App\Currency;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OnboardingController extends Controller
{
    public function currency(Request $request)
    {
        $validated = $request->validate([
            'base_currency' => ['required', Rule::enum(Currency::class)],
        ]);

        $user = $request->user();
        $user->forceFill([
            'base_currency' => $validated['base_currency'],
            'onboarding' => array_merge($user->onboarding ?? [], ['currency_confirmed_at' => now()->toIso8601String()]),
        ])->save();

        return back();
    }

    public function dismiss(Request $request)
    {
        $user = $request->user();
        $user->forceFill([
            'onboarding' => array_merge($user->onboarding ?? [], ['dismissed_at' => now()->toIso8601String()]),
        ])->save();

        return back();
    }
}
