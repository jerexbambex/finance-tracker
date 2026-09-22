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
        // Filament's table appends its own ORDER BY (a primary-key tiebreak
        // for stable sorting, plus whatever column a user clicks to sort by)
        // on top of whatever query() returns. Against a bare GROUP BY query
        // that tiebreak — `order by ... page_visits.id` — isn't itself
        // aggregated or in the GROUP BY, which MySQL's default
        // ONLY_FULL_GROUP_BY mode rejects outright (SQLite, which the test
        // suite runs on, has no such restriction and stays quiet about it).
        // Wrapping the aggregate as a subquery sidesteps this: at the outer
        // level `id`/`visits`/`visitors` are just plain columns of an
        // already-computed result, so any ORDER BY Filament adds is valid
        // regardless of what it orders by.
        $aggregate = PageVisit::query()
            ->selectRaw('MIN(id) as id, path, route_name, COUNT(*) as visits, COUNT(DISTINCT visitor_hash) as visitors')
            ->where('visited_at', '>=', now()->subDays(30))
            ->groupBy('path', 'route_name');

        return $table
            ->query(PageVisit::query()->fromSub($aggregate, 'page_visits')->orderByDesc('visits')->limit(15))
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
