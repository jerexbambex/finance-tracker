<?php

namespace App\Filament\Resources\Users\Pages;

use App\Filament\Resources\Users\UserResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;
use Filament\Support\Enums\IconPosition;
use Illuminate\Contracts\Support\Htmlable;

class ViewUser extends ViewRecord
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }

    public function getTitle(): string|Htmlable
    {
        return $this->getRecord()->name;
    }

    public function getSubheading(): string|Htmlable|null
    {
        $record = $this->getRecord();
        
        return view('filament.resources.users.user-stats', [
            'accounts' => $record->accounts()->count(),
            'transactions' => $record->transactions()->count(),
            'budgets' => $record->budgets()->count(),
            'goals' => $record->goals()->count(),
        ])->render();
    }
}
