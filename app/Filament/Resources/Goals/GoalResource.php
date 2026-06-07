<?php

namespace App\Filament\Resources\Goals;

use App\Filament\Resources\Goals\Pages\CreateGoal;
use App\Filament\Resources\Goals\Pages\EditGoal;
use App\Filament\Resources\Goals\Pages\ListGoals;
use App\Filament\Resources\Goals\Pages\ViewGoal;
use App\Filament\Resources\Goals\Schemas\GoalForm;
use App\Filament\Resources\Goals\Tables\GoalsTable;
use App\Models\Goal;
use BackedEnum;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class GoalResource extends Resource
{
    protected static ?string $model = Goal::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static UnitEnum|string|null $navigationGroup = 'Planning';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return GoalForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return GoalsTable::configure($table);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->columns(3)
            ->components([
                Section::make('Goal Details')
                    ->columnSpan(2)
                    ->columns(2)
                    ->extraAttributes(['class' => 'h-full'])
                    ->schema([
                        TextEntry::make('name'),
                        TextEntry::make('user.name')
                            ->label('Owner'),
                        TextEntry::make('category')
                            ->badge()
                            ->placeholder('—'),
                        TextEntry::make('target_date')
                            ->date()
                            ->placeholder('No deadline'),
                        TextEntry::make('description')
                            ->columnSpanFull()
                            ->placeholder('No description'),
                        TextEntry::make('status')
                            ->badge()
                            ->state(fn (Goal $record) => $record->is_completed ? 'Completed' : ($record->is_active ? 'Active' : 'Inactive'))
                            ->color(fn (Goal $record) => $record->is_completed ? 'success' : ($record->is_active ? 'info' : 'gray')),
                    ]),
                Section::make('Progress')
                    ->columnSpan(1)
                    ->extraAttributes(['class' => 'h-full'])
                    ->schema([
                        TextEntry::make('target_amount')
                            ->label('Target')
                            ->numeric(),
                        TextEntry::make('current_amount')
                            ->label('Saved')
                            ->numeric(),
                        TextEntry::make('remaining')
                            ->label('Remaining')
                            ->numeric()
                            ->state(fn (Goal $record) => max($record->target_amount - $record->current_amount, 0)),
                        TextEntry::make('percentage')
                            ->label('Complete')
                            ->badge()
                            ->state(fn (Goal $record) => round($record->getPercentageComplete()).'%')
                            ->color(fn (Goal $record) => $record->getPercentageComplete() >= 100 ? 'success' : 'info'),
                    ]),
                Section::make('Meta')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('created_at')->dateTime(),
                        TextEntry::make('updated_at')->dateTime()->since(),
                    ]),
            ]);
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
            'index' => ListGoals::route('/'),
            'create' => CreateGoal::route('/create'),
            'view' => ViewGoal::route('/{record}'),
            'edit' => EditGoal::route('/{record}/edit'),
        ];
    }
}
