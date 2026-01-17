<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use Filament\Actions\EditAction;
use Filament\Infolists\Components\Section;
use Filament\Infolists\Components\TextEntry;
use Filament\Infolists\Infolist;
use Filament\Resources\Pages\ViewRecord;
use Filament\Support\Enums\FontWeight;

class ViewUser extends ViewRecord
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }

    public function infolist(Infolist $infolist): Infolist
    {
        return $infolist
            ->schema([
                Section::make('User Information')
                    ->columns(2)
                    ->schema([
                        TextEntry::make('name')
                            ->weight(FontWeight::Bold),
                        TextEntry::make('email')
                            ->copyable()
                            ->icon('heroicon-o-envelope'),
                        TextEntry::make('email_verified_at')
                            ->label('Email Verified')
                            ->dateTime()
                            ->placeholder('Not verified')
                            ->badge()
                            ->color(fn ($state) => $state ? 'success' : 'warning'),
                        TextEntry::make('created_at')
                            ->dateTime()
                            ->since(),
                    ]),

                Section::make('Roles & Permissions')
                    ->schema([
                        TextEntry::make('roles.name')
                            ->badge()
                            ->color('info')
                            ->placeholder('No roles assigned'),
                    ]),

                Section::make('Account Statistics')
                    ->columns(4)
                    ->schema([
                        TextEntry::make('accounts_count')
                            ->label('Accounts')
                            ->state(fn ($record) => $record->accounts()->count())
                            ->badge()
                            ->color('success'),
                        TextEntry::make('transactions_count')
                            ->label('Transactions')
                            ->state(fn ($record) => $record->transactions()->count())
                            ->badge()
                            ->color('primary'),
                        TextEntry::make('budgets_count')
                            ->label('Budgets')
                            ->state(fn ($record) => $record->budgets()->count())
                            ->badge()
                            ->color('warning'),
                        TextEntry::make('goals_count')
                            ->label('Goals')
                            ->state(fn ($record) => $record->goals()->count())
                            ->badge()
                            ->color('info'),
                    ]),
            ]);
    }
}
