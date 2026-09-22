<?php

namespace App\Http\Middleware;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'unreadNotifications' => $request->user() ? $request->user()->unreadNotifications()->count() : 0,
            // Backs the mobile quick-add FAB, which renders on every
            // authenticated page (not just the dashboard), so it needs its
            // options shared globally rather than passed per-controller.
            // Trimmed to just the fields the form uses, since this now runs
            // on every request.
            'quickAdd' => $request->user() ? [
                'accounts' => $request->user()->accounts()->where('is_active', true)->get(['id', 'name']),
                'categories' => Category::where(function ($q) use ($request) {
                    $q->whereNull('user_id')->orWhere('user_id', $request->user()->id);
                })->where('is_active', true)->get(['id', 'name', 'type']),
            ] : null,
            'impersonating' => $request->user() && $request->user()->isImpersonated()
                ? ['name' => $request->user()->name, 'email' => $request->user()->email]
                : null,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
