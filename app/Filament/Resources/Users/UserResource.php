<?php

namespace App\Filament\Resources\Users;

use App\Filament\Resources\Users\Pages\CreateUser;
use App\Filament\Resources\Users\Pages\EditUser;
use App\Filament\Resources\Users\Pages\ListUsers;
use App\Filament\Resources\Users\Schemas\UserForm;
use App\Filament\Resources\Users\Tables\UsersTable;
use App\Models\User;
use BackedEnum;
use UnitEnum;
use Filament\Infolists;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUsers;
    
    protected static UnitEnum|string|null $navigationGroup = 'Administration';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return UserForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->components([
                Infolists\Components\Section::make('User Information')
                    ->columns(2)
                    ->schema([
                        Infolists\Components\TextEntry::make('name'),
                        Infolists\Components\TextEntry::make('email')
                            ->copyable()
                            ->icon('heroicon-o-envelope'),
                        Infolists\Components\TextEntry::make('email_verified_at')
                            ->label('Email Verified')
                            ->dateTime()
                            ->placeholder('Not verified')
                            ->badge()
                            ->color(fn ($state) => $state ? 'success' : 'warning'),
                        Infolists\Components\TextEntry::make('created_at')
                            ->dateTime()
                            ->since(),
                    ]),
                Infolists\Components\Section::make('Roles')
                    ->schema([
                        Infolists\Components\TextEntry::make('roles.name')
                            ->badge()
                            ->color('info')
                            ->placeholder('No roles assigned'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return UsersTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\AccountsRelationManager::class,
            RelationManagers\TransactionsRelationManager::class,
            RelationManagers\BudgetsRelationManager::class,
            RelationManagers\GoalsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListUsers::route('/'),
            'create' => CreateUser::route('/create'),
            'view' => \App\Filament\Resources\Users\Pages\ViewUser::route('/{record}'),
            'edit' => EditUser::route('/{record}/edit'),
        ];
    }
}
