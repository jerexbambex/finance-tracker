<?php

namespace App\Filament\Resources\Users\Tables;

use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Notifications\Notification;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Password;
use STS\FilamentImpersonate\Actions\Impersonate;

class UsersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('email')
                    ->searchable()
                    ->sortable()
                    ->copyable(),
                TextColumn::make('roles.name')
                    ->badge()
                    ->searchable(),
                IconColumn::make('email_verified_at')
                    ->label('Verified')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle'),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('roles')
                    ->relationship('roles', 'name')
                    ->multiple()
                    ->preload(),
            ])
            ->recordActions([
                Impersonate::make(),
                Action::make('resendVerification')
                    ->label('Resend verification')
                    ->icon('heroicon-o-envelope')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->modalDescription(fn ($record) => "Send a new email verification link to {$record->email}?")
                    ->visible(fn ($record) => $record->email_verified_at === null)
                    ->action(function ($record) {
                        dispatch(function () use ($record) {
                            $record->sendEmailVerificationNotification();
                        });

                        Notification::make()
                            ->title('Verification email queued')
                            ->body("Queued for {$record->email}.")
                            ->success()
                            ->send();
                    }),
                Action::make('sendPasswordReset')
                    ->label('Password reset')
                    ->icon('heroicon-o-key')
                    ->color('gray')
                    ->requiresConfirmation()
                    ->modalDescription(fn ($record) => "Send a password reset link to {$record->email}?")
                    ->action(function ($record) {
                        $email = $record->email;

                        dispatch(function () use ($email) {
                            Password::sendResetLink(['email' => $email]);
                        });

                        Notification::make()
                            ->title('Password reset email queued')
                            ->body("Queued for {$email}.")
                            ->success()
                            ->send();
                    }),
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
