<?php

namespace App\Services;

use App\Models\StatusCheck;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Derives incident history from recorded health checks.
 *
 * There is no human-authored incident concept in the app — instead a run of
 * consecutive non-ok results for a single component is collapsed into one
 * incident. A gap larger than {@see self::GAP_MINUTES} between bad checks ends
 * the current incident and starts a new one (the component recovered in
 * between). Incidents are grouped by calendar month, newest first.
 */
class IncidentHistory
{
    /**
     * Recording interval (minutes). Matches the status:record schedule.
     */
    private const INTERVAL_MINUTES = 5;

    /**
     * Bad checks farther apart than this belong to separate incidents.
     */
    private const GAP_MINUTES = 15;

    public function __construct(private readonly HealthCheck $health) {}

    /**
     * @return array<int, array{key: string, label: string, incidents: array}>
     */
    public function months(int $days = 90): array
    {
        $names = $this->componentNames();
        $incidents = $this->incidents($days, $names);

        // Build the full list of months in the window (newest first) so months
        // with no incidents still render a "No incidents reported" row.
        $months = [];
        $cursor = now()->startOfMonth();
        $earliest = now()->subDays($days - 1)->startOfMonth();

        while ($cursor->greaterThanOrEqualTo($earliest)) {
            $key = $cursor->format('Y-m');
            $months[$key] = [
                'key' => $key,
                'label' => $cursor->format('F Y'),
                'incidents' => [],
            ];
            $cursor->subMonth();
        }

        foreach ($incidents as $incident) {
            $key = Carbon::parse($incident['started_at'])->format('Y-m');
            if (isset($months[$key])) {
                $months[$key]['incidents'][] = $incident;
            }
        }

        return array_values($months);
    }

    /**
     * Collapse non-ok check rows into incidents.
     *
     * @param  array<string, string>  $names
     * @return array<int, array>
     */
    private function incidents(int $days, array $names): array
    {
        $rows = StatusCheck::query()
            ->where('checked_at', '>=', now()->subDays($days - 1)->startOfDay())
            ->whereIn('status', [HealthCheck::DEGRADED, HealthCheck::DOWN])
            ->orderBy('component')
            ->orderBy('checked_at')
            ->get(['component', 'status', 'checked_at']);

        $incidents = [];

        $rows->groupBy('component')->each(function (Collection $componentRows, string $component) use (&$incidents, $names) {
            $current = null;

            foreach ($componentRows as $row) {
                $at = Carbon::parse($row->checked_at);

                if ($current !== null && abs($current['end']->diffInMinutes($at)) > self::GAP_MINUTES) {
                    $incidents[] = $this->finalise($current, $component, $names);
                    $current = null;
                }

                if ($current === null) {
                    $current = ['start' => $at->copy(), 'end' => $at->copy(), 'worst' => $row->status];
                } else {
                    $current['end'] = $at->copy();
                    if ($row->status === HealthCheck::DOWN) {
                        $current['worst'] = HealthCheck::DOWN;
                    }
                }
            }

            if ($current !== null) {
                $incidents[] = $this->finalise($current, $component, $names);
            }
        });

        // Newest incidents first across all components.
        usort($incidents, fn ($a, $b) => strcmp($b['started_at'], $a['started_at']));

        return $incidents;
    }

    /**
     * @param  array{start: Carbon, end: Carbon, worst: string}  $current
     * @param  array<string, string>  $names
     */
    private function finalise(array $current, string $component, array $names): array
    {
        $start = $current['start'];
        $end = $current['end'];

        // A single bad sample has zero span; show it as one interval long.
        $minutes = max((int) abs($start->diffInMinutes($end)), self::INTERVAL_MINUTES);

        // Ongoing if the last bad sample is recent enough that recovery hasn't
        // been observed yet.
        $ongoing = $end->greaterThanOrEqualTo(now()->subMinutes(self::GAP_MINUTES));

        return [
            'component' => $component,
            'name' => $names[$component] ?? ucfirst($component),
            'status' => $current['worst'],
            'started_at' => $start->toIso8601String(),
            'ended_at' => $end->toIso8601String(),
            'duration_minutes' => $minutes,
            'ongoing' => $ongoing,
        ];
    }

    /**
     * Map of component key => display name.
     *
     * @return array<string, string>
     */
    private function componentNames(): array
    {
        $names = [];
        foreach ($this->health->components() as $component) {
            $names[$component['key']] = $component['name'];
        }

        return $names;
    }
}
