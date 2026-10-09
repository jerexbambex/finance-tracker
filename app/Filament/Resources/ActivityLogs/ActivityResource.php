<?php

namespace App\Filament\Resources\ActivityLogs;

use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Jacobtims\FilamentLogger\Resources\ActivityResource as BaseActivityResource;

class ActivityResource extends BaseActivityResource
{
    public static function table(Table $table): Table
    {
        $table = parent::table($table);

        // The plugin's filters read `$data['old']` etc. without checking the
        // key exists. Filament defers filters now, so until one is applied
        // their state is an empty array and those reads threw, taking the
        // whole page down with a 500. Same behaviour here, minus the
        // assumption that the key is always present.
        $filters = $table->getFilters();

        $propertyFilters = [
            'properties->old' => ['old', 'properties->old', 'old_attributes'],
            'properties->attributes' => ['new', 'properties->attributes', 'new_attributes'],
        ];

        foreach ($propertyFilters as $name => [$key, $column, $label]) {
            ($filters[$name] ?? null)
                ?->indicateUsing(fn (array $data): ?string => filled($data[$key] ?? null)
                    ? __("filament-logger::filament-logger.resource.label.{$label}").$data[$key]
                    : null)
                ->query(fn (Builder $query, array $data): Builder => $query->when(
                    $data[$key] ?? null,
                    fn (Builder $query, string $value): Builder => $query->where($column, 'like', "%{$value}%"),
                ));
        }

        ($filters['created_at'] ?? null)?->query(fn (Builder $query, array $data): Builder => $query->when(
            $data['logged_at'] ?? null,
            fn (Builder $query, $date): Builder => $query->whereDate('created_at', $date),
        ));

        return $table;
    }
}
