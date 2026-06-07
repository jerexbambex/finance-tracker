<?php

namespace App\Filament\Resources\Transactions;

use App\Filament\Resources\Transactions\Pages\CreateTransaction;
use App\Filament\Resources\Transactions\Pages\EditTransaction;
use App\Filament\Resources\Transactions\Pages\ListTransactions;
use App\Filament\Resources\Transactions\Pages\ViewTransaction;
use App\Filament\Resources\Transactions\Schemas\TransactionForm;
use App\Filament\Resources\Transactions\Tables\TransactionsTable;
use App\Models\Transaction;
use BackedEnum;
use Filament\Infolists\Components\RepeatableEntry;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class TransactionResource extends Resource
{
    protected static ?string $model = Transaction::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedArrowsRightLeft;

    protected static UnitEnum|string|null $navigationGroup = 'Financial';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return TransactionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TransactionsTable::configure($table);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->columns(3)
            ->components([
                Section::make('Transaction')
                    ->columnSpan(2)
                    ->columns(2)
                    ->extraAttributes(['class' => 'h-full'])
                    ->schema([
                        TextEntry::make('user.name')
                            ->label('Owner')
                            ->icon('heroicon-o-user'),
                        TextEntry::make('account.name')
                            ->label('Account')
                            ->icon('heroicon-o-banknotes'),
                        TextEntry::make('category.name')
                            ->label('Category')
                            ->icon('heroicon-o-tag')
                            ->placeholder('Uncategorized'),
                        TextEntry::make('type')
                            ->badge()
                            ->color(fn (string $state) => match ($state) {
                                'income' => 'success',
                                'expense' => 'danger',
                                'transfer' => 'info',
                                default => 'gray',
                            }),
                        TextEntry::make('amount')
                            ->money(fn (Transaction $record) => $record->currency ?? 'USD'),
                        TextEntry::make('transaction_date')
                            ->date(),
                        TextEntry::make('description')
                            ->columnSpanFull()
                            ->placeholder('—'),
                        TextEntry::make('notes')
                            ->columnSpanFull()
                            ->placeholder('—'),
                    ]),
                Section::make('Details')
                    ->columnSpan(1)
                    ->extraAttributes(['class' => 'h-full'])
                    ->schema([
                        TextEntry::make('currency')
                            ->badge(),
                        TextEntry::make('is_recurring')
                            ->label('Recurring')
                            ->badge()
                            ->state(fn (Transaction $record) => $record->is_recurring ? 'Yes' : 'No')
                            ->color(fn (Transaction $record) => $record->is_recurring ? 'info' : 'gray'),
                        TextEntry::make('transfer_direction')
                            ->label('Transfer leg')
                            ->placeholder('—')
                            ->visible(fn (Transaction $record) => $record->type === 'transfer'),
                        TextEntry::make('receipt')
                            ->label('Receipt')
                            ->state(fn (Transaction $record) => $record->getFirstMediaUrl('receipts') ? 'View receipt' : null)
                            ->placeholder('No receipt')
                            ->url(fn (Transaction $record) => $record->getFirstMediaUrl('receipts') ?: null, shouldOpenInNewTab: true)
                            ->icon('heroicon-o-paper-clip'),
                        TextEntry::make('id')
                            ->label('ID')
                            ->copyable()
                            ->icon('heroicon-o-identification'),
                        TextEntry::make('created_at')->dateTime(),
                        TextEntry::make('updated_at')->dateTime()->since(),
                    ]),
                Section::make('Splits')
                    ->visible(fn (Transaction $record) => $record->splits()->exists())
                    ->schema([
                        RepeatableEntry::make('splits')
                            ->hiddenLabel()
                            ->columns(3)
                            ->schema([
                                TextEntry::make('category.name')
                                    ->label('Category')
                                    ->placeholder('Uncategorized'),
                                TextEntry::make('amount')
                                    ->numeric(),
                                TextEntry::make('description')
                                    ->placeholder('—'),
                            ]),
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
            'index' => ListTransactions::route('/'),
            'create' => CreateTransaction::route('/create'),
            'view' => ViewTransaction::route('/{record}'),
            'edit' => EditTransaction::route('/{record}/edit'),
        ];
    }
}
