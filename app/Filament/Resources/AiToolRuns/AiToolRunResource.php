<?php

namespace App\Filament\Resources\AiToolRuns;

use App\Filament\Resources\AiToolRuns\Pages\CreateAiToolRun;
use App\Filament\Resources\AiToolRuns\Pages\EditAiToolRun;
use App\Filament\Resources\AiToolRuns\Pages\ListAiToolRuns;
use App\Filament\Resources\AiToolRuns\Schemas\AiToolRunForm;
use App\Filament\Resources\AiToolRuns\Tables\AiToolRunsTable;
use App\Models\AiToolRun;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class AiToolRunResource extends Resource
{
    protected static ?string $model = AiToolRun::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static UnitEnum|string|null $navigationGroup = 'AI Management';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return AiToolRunForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AiToolRunsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAiToolRuns::route('/'),
            'create' => CreateAiToolRun::route('/create'),
            'edit' => EditAiToolRun::route('/{record}/edit'),
        ];
    }
}
