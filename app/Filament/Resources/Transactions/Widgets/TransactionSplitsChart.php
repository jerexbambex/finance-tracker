<?php

namespace App\Filament\Resources\Transactions\Widgets;

use Filament\Widgets\ChartWidget;
use Illuminate\Database\Eloquent\Model;

class TransactionSplitsChart extends ChartWidget
{
    public ?Model $record = null;

    protected ?string $heading = 'Split allocation by category';

    protected function getData(): array
    {
        $splits = $this->record->splits()->with('category')->get();

        $palette = ['#00b8a6', '#3f9fe8', '#e4a339', '#e11d48', '#6b7280', '#a855f7'];

        $labels = [];
        $data = [];
        $colors = [];

        foreach ($splits as $index => $split) {
            $labels[] = $split->category?->name ?? 'Uncategorized';
            $data[] = round($split->amount, 2);
            $colors[] = $palette[$index % count($palette)];
        }

        return [
            'datasets' => [
                [
                    'data' => $data,
                    'backgroundColor' => $colors,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}
