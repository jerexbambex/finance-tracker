<?php

namespace App\Filament\Resources\Transactions\Pages;

use App\Filament\Resources\Transactions\TransactionResource;
use App\Filament\Resources\Transactions\Widgets\TransactionSplitsChart;
use App\Filament\Resources\Transactions\Widgets\TransactionStatsWidget;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewTransaction extends ViewRecord
{
    protected static string $resource = TransactionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make(),
        ];
    }

    protected function getHeaderWidgets(): array
    {
        return [
            TransactionStatsWidget::class,
        ];
    }

    protected function getFooterWidgets(): array
    {
        // Only show the split breakdown when the transaction is actually split
        return $this->record->splits()->exists()
            ? [TransactionSplitsChart::class]
            : [];
    }
}
