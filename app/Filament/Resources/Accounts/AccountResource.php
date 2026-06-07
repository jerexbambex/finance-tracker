<?php

namespace App\Filament\Resources\Accounts;

use App\Filament\Resources\Accounts\Pages\CreateAccount;
use App\Filament\Resources\Accounts\Pages\EditAccount;
use App\Filament\Resources\Accounts\Pages\ListAccounts;
use App\Filament\Resources\Accounts\Pages\ViewAccount;
use App\Filament\Resources\Accounts\Schemas\AccountForm;
use App\Filament\Resources\Accounts\Tables\AccountsTable;
use App\Models\Account;
use BackedEnum;
use Filament\Infolists\Components\TextEntry;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class AccountResource extends Resource
{
    protected static ?string $model = Account::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBanknotes;

    protected static UnitEnum|string|null $navigationGroup = 'Financial';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return AccountForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AccountsTable::configure($table);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->columns(3)
            ->components([
                Section::make('Account Details')
                    ->columnSpan(2)
                    ->columns(2)
                    ->extraAttributes(['class' => 'h-full'])
                    ->schema([
                        TextEntry::make('name'),
                        TextEntry::make('user.name')
                            ->label('Owner'),
                        TextEntry::make('type')
                            ->badge()
                            ->color(fn (string $state) => match ($state) {
                                'checking' => 'info',
                                'savings' => 'success',
                                'credit_card' => 'warning',
                                'investment' => 'primary',
                                default => 'gray',
                            }),
                        TextEntry::make('balance')
                            ->money(fn (Account $record) => $record->currency ?? 'USD'),
                        TextEntry::make('currency')
                            ->badge(),
                        TextEntry::make('is_active')
                            ->label('Status')
                            ->badge()
                            ->state(fn (Account $record) => $record->is_active ? 'Active' : 'Inactive')
                            ->color(fn (Account $record) => $record->is_active ? 'success' : 'gray'),
                    ]),
                Section::make('Activity')
                    ->columnSpan(1)
                    ->extraAttributes(['class' => 'h-full'])
                    ->schema([
                        TextEntry::make('transactions_count')
                            ->label('Transactions')
                            ->state(fn (Account $record) => $record->transactions()->count()),
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
            'index' => ListAccounts::route('/'),
            'create' => CreateAccount::route('/create'),
            'view' => ViewAccount::route('/{record}'),
            'edit' => EditAccount::route('/{record}/edit'),
        ];
    }
}
