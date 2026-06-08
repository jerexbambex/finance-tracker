<?php

namespace App\Filament\Resources\Goals\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Database\Eloquent\Model;

class GoalProgressChart extends ChartWidget
{
    public ?Model $record = null;

    protected ?string $heading = 'Savings Progress';

    protected ?string $maxHeight = '280px';

    protected function getData(): array
    {
        $contributions = $this->record->contributions()
            ->orderBy('contribution_date')
            ->get();

        $labels = [];
        $cumulative = [];
        $target = [];
        $running = 0;

        foreach ($contributions as $contribution) {
            $running += $contribution->amount;
            $labels[] = $contribution->contribution_date->format('M j, Y');
            $cumulative[] = round($running, 2);
            $target[] = $this->record->target_amount;
        }

        return [
            'datasets' => [
                [
                    'label' => 'Saved',
                    'data' => $cumulative,
                    'backgroundColor' => 'rgba(0, 184, 166, 0.2)',
                    'borderColor' => '#00b8a6',
                    'fill' => true,
                ],
                [
                    'label' => 'Target',
                    'data' => $target,
                    'borderColor' => '#9ca3af',
                    'borderDash' => [6, 6],
                    'pointRadius' => 0,
                    'fill' => false,
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
