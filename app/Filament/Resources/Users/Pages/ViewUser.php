<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\TextEntry;
use Filament\Schemas\Schema;

class ViewUser extends ViewRecord
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }
    
    public function infolist(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('User Information')
                    ->schema([
                        TextEntry::make('name'),
                        TextEntry::make('email')
                            ->copyable(),
                        TextEntry::make('email_verified_at')
                            ->dateTime()
                            ->placeholder('Not verified'),
                        TextEntry::make('created_at')
                            ->dateTime(),
                    ])->columns(2),
                
                Section::make('Roles & Permissions')
                    ->schema([
                        TextEntry::make('roles.name')
                            ->badge()
                            ->placeholder('No roles assigned'),
                    ]),
                
                Section::make('Activity')
                    ->schema([
                        TextEntry::make('accounts_count')
                            ->counts('accounts')
                            ->label('Accounts'),
                        TextEntry::make('transactions_count')
                            ->counts('transactions')
                            ->label('Transactions'),
                        TextEntry::make('budgets_count')
                            ->counts('budgets')
                            ->label('Budgets'),
                        TextEntry::make('goals_count')
                            ->counts('goals')
                            ->label('Goals'),
                    ])->columns(4),
            ]);
    }
}
