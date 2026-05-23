<?php

namespace App\Providers;

use App\Support\AiSettings;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(AiSettings::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('ai-chat', function (Request $request) {
            $limit = app(AiSettings::class)->chatRateLimitPerMinute();

            return Limit::perMinute($limit)->by(
                $request->user()?->getAuthIdentifier() ?: $request->ip()
            );
        });
    }
}
