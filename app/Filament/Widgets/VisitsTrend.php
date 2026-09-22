<?php

namespace App\Filament\Widgets;

use App\Models\PageVisit;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\Cache;

class VisitsTrend extends ChartWidget
{
    protected ?string $heading = 'Traffic (last 30 days)';

    protected ?string $maxHeight = '280px';

    protected ?string $pollingInterval = null;

    protected static ?int $sort = 5;

    protected int|string|array $columnSpan = 'full';

    protected function getData(): array
    {
        $start = now()->subDays(29)->startOfDay();

        $labels = [];
        $keys = [];
        for ($i = 29; $i >= 0; $i--) {
            $day = now()->subDays($i);
            $labels[] = $day->format('M j');
            $keys[] = $day->toDateString();
        }

        // One grouped query for views, one distinct-per-day query for unique
        // visitors (COUNT(DISTINCT ...) can't be grouped by day in a single
        // portable query without a subquery, and this is a low-traffic admin
        // widget — clarity wins over a cleverer single query). Both cached
        // briefly since this scans the full 30-day window on every load.
        $rows = Cache::remember('admin.visits.trend', now()->addMinutes(5), function () use ($start) {
            $views = PageVisit::query()
                ->where('visited_at', '>=', $start)
                ->selectRaw('DATE(visited_at) as day, COUNT(*) as total')
                ->groupBy('day')
                ->pluck('total', 'day');

            $visitors = PageVisit::query()
                ->where('visited_at', '>=', $start)
                ->selectRaw('DATE(visited_at) as day, COUNT(DISTINCT visitor_hash) as total')
                ->groupBy('day')
                ->pluck('total', 'day');

            return ['views' => $views, 'visitors' => $visitors];
        });

        $views = array_map(fn ($key) => (int) ($rows['views'][$key] ?? 0), $keys);
        $visitors = array_map(fn ($key) => (int) ($rows['visitors'][$key] ?? 0), $keys);

        return [
            'datasets' => [
                [
                    'label' => 'Page Views',
                    'data' => $views,
                    'backgroundColor' => 'rgba(0, 184, 166, 0.15)',
                    'borderColor' => '#00b8a6',
                    'fill' => true,
                    'tension' => 0.4,
                ],
                [
                    'label' => 'Unique Visitors',
                    'data' => $visitors,
                    'backgroundColor' => 'rgba(99, 102, 241, 0.1)',
                    'borderColor' => '#6366f1',
                    'fill' => true,
                    'tension' => 0.4,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
