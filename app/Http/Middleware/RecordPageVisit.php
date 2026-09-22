<?php

namespace App\Http\Middleware;

use App\Models\PageVisit;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Logs one row per page view for the admin panel's visits/visitors widgets.
 *
 * Runs its work in terminate() rather than handle(): under PHP-FPM, Laravel
 * flushes the response to the browser before terminate() executes, so this
 * never adds latency to a real request — the visitor doesn't wait on it.
 *
 * Privacy: matches the "anonymous telemetry" already promised in the
 * cookie banner and privacy policy. No raw IP or user identity is stored —
 * visitor_hash is a one-way hash of IP + user agent + the day, rotated
 * daily specifically so it CAN'T be used to trace a visitor's history
 * across days, only to dedupe "unique visitors today".
 */
class RecordPageVisit
{
    /**
     * Path segments that are never a real "page view": the admin panel
     * (tracked separately, if ever — an operator browsing their own admin
     * isn't "site traffic"), the health check, and the search API.
     */
    private const EXCLUDED_PREFIXES = ['admin', 'up', 'search'];

    /**
     * Extensions of files the browser/OS fetches on its own (favicons,
     * manifest, service worker, source maps, ...) — never a page a person
     * navigated to.
     */
    private const ASSET_EXTENSIONS = [
        'ico', 'svg', 'png', 'jpg', 'jpeg', 'webp', 'gif',
        'txt', 'xml', 'json', 'webmanifest',
        'js', 'css', 'map',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        if (! $this->shouldRecord($request, $response)) {
            return;
        }

        PageVisit::create([
            'path' => '/'.ltrim($request->path(), '/'),
            'route_name' => $request->route()?->getName(),
            'visitor_hash' => $this->visitorHash($request),
            'is_authenticated' => $request->user() !== null,
            'visited_at' => now(),
        ]);
    }

    private function shouldRecord(Request $request, Response $response): bool
    {
        if (! $request->isMethod('GET') || $response->getStatusCode() >= 400) {
            return false;
        }

        // An Inertia partial reload (e.g. polling just one prop) isn't a new
        // page view — only a full visit/navigation should count.
        if ($request->header('X-Inertia-Partial-Component')) {
            return false;
        }

        $path = trim($request->path(), '/');
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        if ($extension !== '' && in_array($extension, self::ASSET_EXTENSIONS, true)) {
            return false;
        }

        foreach (self::EXCLUDED_PREFIXES as $prefix) {
            if ($path === $prefix || str_starts_with($path, $prefix.'/')) {
                return false;
            }
        }

        return ! $this->looksLikeABot($request);
    }

    private function looksLikeABot(Request $request): bool
    {
        $userAgent = (string) $request->userAgent();

        if ($userAgent === '') {
            return true; // a real browser always sends one; a script often doesn't
        }

        return (bool) preg_match(
            '/bot|crawl|spider|slurp|curl|wget|python-requests|axios|headlesschrome|uptime|pingdom|monitor/i',
            $userAgent,
        );
    }

    private function visitorHash(Request $request): string
    {
        return hash('sha256', implode('|', [
            $request->ip(),
            $request->userAgent(),
            now()->toDateString(),
            config('app.key'),
        ]));
    }
}
