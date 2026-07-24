<?php

namespace App\Http\Controllers;

use App\Services\HealthCheck;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class StatusController extends Controller
{
    public function __construct(private readonly HealthCheck $health) {}

    /**
     * Public status page (Inertia).
     */
    public function index(): Response
    {
        return Inertia::render('status', $this->payload());
    }

    /**
     * JSON endpoint for client-side polling / external monitors.
     * Returns HTTP 200 when healthy, 503 when any component is down.
     */
    public function check(): JsonResponse
    {
        $payload = $this->payload();
        $code = $payload['overall'] === HealthCheck::DOWN ? 503 : 200;

        return response()->json($payload, $code);
    }

    /**
     * @return array{components: array, overall: string, checkedAt: string}
     */
    private function payload(): array
    {
        $components = $this->health->components();

        return [
            'components' => $components,
            'overall' => $this->health->overall($components),
            'checkedAt' => now()->toIso8601String(),
        ];
    }
}
