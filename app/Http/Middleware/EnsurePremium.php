<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Rejects the request with HTTP 402 unless the authenticated user has an
 * active premium subscription. Applied to /api/v1/sync/* so free users
 * stay on local-only mode but can still register / log in.
 *
 * Returns the canonical API error envelope so clients can branch on the
 * `success` flag and code path consistently.
 */
class EnsurePremium
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            return response()->apiError(
                message: 'Unauthenticated.',
                status: 401,
            );
        }

        if (! $user->isPremium()) {
            return response()->apiError(
                message: 'A premium subscription is required to sync data with the cloud.',
                status: 402,
                data: [
                    'subscriptionTier' => $user->subscription_tier,
                    'subscriptionExpiresAt' => optional($user->subscription_expires_at)->toIso8601String(),
                ],
            );
        }

        return $next($request);
    }
}
