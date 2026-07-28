<?php

namespace App\Http\Controllers;

use App\Models\StatusCheck;
use App\Services\HealthCheck;
use App\Services\IncidentHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class StatusController extends Controller
{
    /**
     * Number of days of uptime history shown on the status page.
     */
    private const WINDOW_DAYS = 90;

    public function __construct(private readonly HealthCheck $health) {}

    /**
     * Public status page (Inertia).
     */
    public function index(): Response
    {
        return Inertia::render('status', $this->payload());
    }

    /**
     * Incident history derived from recorded health checks (Inertia).
     */
    public function history(IncidentHistory $history): Response
    {
        return Inertia::render('status/history', [
            'months' => $history->months(self::WINDOW_DAYS),
            'window' => [
                'days' => self::WINDOW_DAYS,
                'from' => now()->subDays(self::WINDOW_DAYS - 1)->toDateString(),
                'to' => now()->toDateString(),
            ],
        ]);
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
     * @return array{components: array, overall: string, checkedAt: string, window: array}
     */
    private function payload(): array
    {
        $components = $this->health->components();

        // Resolve overall from the raw check results, before augmenting rows
        // with history (uptime/days), which HealthCheck::overall doesn't read.
        $overall = $this->health->overall($components);

        $history = $this->history();

        $components = array_map(function (array $component) use ($history) {
            $entry = $history[$component['key']] ?? ['uptime' => null, 'days' => []];

            return [
                ...$component,
                'uptime' => $entry['uptime'],
                'days' => $entry['days'],
            ];
        }, $components);

        $from = now()->subDays(self::WINDOW_DAYS - 1)->startOfDay();

        return [
            'components' => $components,
            'overall' => $overall,
            'checkedAt' => now()->toIso8601String(),
            'window' => [
                'days' => self::WINDOW_DAYS,
                'from' => $from->toDateString(),
                'to' => now()->toDateString(),
            ],
        ];
    }

    /**
     * Build per-component daily uptime history over the window.
     *
     * Returns a map keyed by component key:
     *   ['uptime' => float|null, 'days' => [['date' => 'Y-m-d', 'status' => ...]]]
     *
     * Each day's status is the worst result recorded that day; days with no
     * recorded checks are 'none' (rendered gray) so a fresh install fills in
     * over time rather than showing fabricated uptime.
     *
     * @return array<string, array{uptime: float|null, days: array}>
     */
    private function history(): array
    {
        $from = now()->subDays(self::WINDOW_DAYS - 1)->startOfDay();

        $rows = StatusCheck::query()
            ->where('checked_at', '>=', $from)
            ->selectRaw('component')
            ->selectRaw('DATE(checked_at) as day')
            ->selectRaw("SUM(CASE WHEN status = 'ok' THEN 1 ELSE 0 END) as ok")
            ->selectRaw("SUM(CASE WHEN status = 'degraded' THEN 1 ELSE 0 END) as degraded")
            ->selectRaw("SUM(CASE WHEN status = 'down' THEN 1 ELSE 0 END) as down")
            ->selectRaw('COUNT(*) as total')
            ->groupBy('component', 'day')
            ->get()
            ->groupBy('component');

        // The ordered list of dates that make up the window (oldest first).
        $dates = [];
        for ($i = self::WINDOW_DAYS - 1; $i >= 0; $i--) {
            $dates[] = now()->subDays($i)->toDateString();
        }

        $history = [];

        foreach ($rows as $component => $days) {
            $byDate = $days->keyBy(fn ($row) => Carbon::parse($row->day)->toDateString());

            $okTotal = 0;
            $checkTotal = 0;
            $timeline = [];

            foreach ($dates as $date) {
                $row = $byDate->get($date);

                if ($row === null) {
                    $timeline[] = ['date' => $date, 'status' => 'none'];

                    continue;
                }

                $okTotal += (int) $row->ok;
                $checkTotal += (int) $row->total;

                $timeline[] = ['date' => $date, 'status' => $this->worstStatus($row)];
            }

            $history[$component] = [
                'uptime' => $checkTotal > 0 ? round($okTotal / $checkTotal * 100, 2) : null,
                'days' => $timeline,
            ];
        }

        return $history;
    }

    /**
     * Worst status seen in an aggregated day row.
     */
    private function worstStatus(object $row): string
    {
        if ((int) $row->down > 0) {
            return HealthCheck::DOWN;
        }

        if ((int) $row->degraded > 0) {
            return HealthCheck::DEGRADED;
        }

        return HealthCheck::OK;
    }
}
