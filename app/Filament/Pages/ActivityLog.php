<?php

namespace App\Filament\Pages;

use pxlrbt\FilamentActivityLog\Pages\ListActivities;
use UnitEnum;

class ActivityLog extends ListActivities
{
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static UnitEnum|string|null $navigationGroup = 'Administration';

    protected static ?int $navigationSort = 4;
}
