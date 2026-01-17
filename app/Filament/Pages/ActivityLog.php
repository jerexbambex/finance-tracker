<?php

namespace App\Filament\Pages;

use pxlrbt\FilamentActivityLog\Pages\ListActivities;

class ActivityLog extends ListActivities
{
    protected static ?string $navigationIcon = 'heroicon-o-clipboard-document-list';

    protected static ?string $navigationGroup = 'Administration';

    protected static ?int $navigationSort = 4;
}
