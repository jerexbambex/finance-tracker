<?php

namespace App\Filament\Resources\Budgets;

use App\Filament\Resources\Budgets\Pages\CreateBudget;
use App\Filament\Resources\Budgets\Pages\EditBudget;
use App\Filament\Resources\Budgets\Pages\ListBudgets;
use App\Filament\Resources\Budgets\Pages\ViewBudget;
use App\Filament\Resources\Budgets\Schemas\BudgetForm;
use App\Filament\Resources\Budgets\Tables\BudgetsTable;
use App\Models\Budget;
use BackedEnum;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class BudgetResource extends Resource
{
    protected static ?string $model = Budget::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static UnitEnum|string|null $navigationGroup = 'Planning';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return BudgetForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return BudgetsTable::configure($table);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->columns(3)
            ->components([
                Section::make('Budget Details')
                    ->columnSpan(2)
                    ->columns(2)
                    ->extraAttributes(['class' => 'h-full'])
                    ->schema([
                        TextEntry::make('category.name')
                            ->label('Category')
                            ->placeholder('Uncategorized'),
                        TextEntry::make('user.name')
                            ->label('Owner'),
                        TextEntry::make('amount')
                            ->label('Budgeted')
                            ->money(fn (Budget $record) => $record->currency ?? 'USD'),
                        TextEntry::make('currency')
                            ->badge(),
                        TextEntry::make('period_type')
                            ->label('Period type')
                            ->badge(),
                        TextEntry::make('period')
                            ->label('Period')
                            ->state(fn (Budget $record) => $record->period_type === 'yearly'
                                ? (string) $record->period_year
                                : \Illuminate\Support\Carbon::create($record->period_year, $record->period_month ?? 1)->format('F Y')),
                        TextEntry::make('is_active')
                            ->label('Status')
                            ->badge()
                            ->state(fn (Budget $record) => $record->is_active ? 'Active' : 'Inactive')
                            ->color(fn (Budget $record) => $record->is_active ? 'success' : 'gray'),
                    ]),
                Section::make('Spending')
                    ->columnSpan(1)
                    ->extraAttributes(['class' => 'h-full'])
                    ->schema([
                        TextEntry::make('spent')
                            ->label('Spent')
                            ->money(fn (Budget $record) => $record->currency ?? 'USD')
                            ->state(fn (Budget $record) => $record->getSpentAmount()),
                        TextEntry::make('remaining')
                            ->label('Remaining')
                            ->money(fn (Budget $record) => $record->currency ?? 'USD')
                            ->state(fn (Budget $record) => $record->amount - $record->getSpentAmount())
                            ->color(fn (Budget $record) => $record->amount - $record->getSpentAmount() >= 0 ? 'success' : 'danger'),
                        TextEntry::make('percentage')
                            ->label('Used')
                            ->badge()
                            ->state(fn (Budget $record) => round($record->getPercentageUsed()).'%')
                            ->color(fn (Budget $record) => $record->getPercentageUsed() >= 100 ? 'danger' : ($record->getPercentageUsed() >= 80 ? 'warning' : 'success')),
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
            'index' => ListBudgets::route('/'),
            'create' => CreateBudget::route('/create'),
            'view' => ViewBudget::route('/{record}'),
            'edit' => EditBudget::route('/{record}/edit'),
        ];
    }
}
