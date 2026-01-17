<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use App\Filament\Resources\Users\Widgets\UserStatsWidget;
use Filament\Actions\EditAction;
use Filament\Infolists;
use Filament\Resources\Pages\ViewRecord;
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

    protected function getHeaderWidgets(): array
    {
        return [
            UserStatsWidget::class,
        ];
    }

    public function infolist(Schema $schema): Schema
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
}
