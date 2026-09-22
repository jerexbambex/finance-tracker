<?php

namespace App\Filament\Widgets;

use App\Models\PageVisit;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class TopPages extends TableWidget
{
    protected static ?int $sort = 6;

    protected int|string|array $columnSpan = 'full';

    protected ?string $pollingInterval = null;

    public function table(Table $table): Table
    {
        return $table
            ->query(
                // MIN(id) doubles as this grouped row's primary key — Filament's
                // table needs one per row (for the row's Livewire key), and a
                // GROUP BY query has no natural single id otherwise.
                PageVisit::query()
                    ->selectRaw('MIN(id) as id, path, route_name, COUNT(*) as visits, COUNT(DISTINCT visitor_hash) as visitors')
                    ->where('visited_at', '>=', now()->subDays(30))
                    ->groupBy('path', 'route_name')
                    ->orderByDesc('visits')
                    ->limit(15)
            )
            ->heading('Top Pages (last 30 days)')
            ->paginated(false)
            ->columns([
                TextColumn::make('path')
                    ->label('Page')
                    ->searchable(),
                TextColumn::make('route_name')
                    ->label('Route')
                    ->placeholder('—')
                    ->color('gray'),
                TextColumn::make('visits')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('visitors')
                    ->label('Unique Visitors')
                    ->numeric()
                    ->sortable(),
            ]);
    }
}
