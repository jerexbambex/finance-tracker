<?php

namespace App\Filament\Resources\Transactions\Widgets;

use App\Models\Transaction;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Cache;

class TransactionsListStats extends StatsOverviewWidget
{
    protected ?string $pollingInterval = null;

    protected function getStats(): array
    {
        $data = Cache::remember('admin.transactions.list.stats', now()->addMinutes(5), function () {
            $monthStart = now()->startOfMonth()->toDateString();
            $monthEnd = now()->endOfMonth()->toDateString();

            $monthByType = fn (string $type) => Transaction::where('type', $type)
                ->whereBetween('transaction_date', [$monthStart, $monthEnd])->count();

            return [
                'total' => Transaction::count(),
                'month' => Transaction::whereBetween('transaction_date', [$monthStart, $monthEnd])->count(),
                'income' => $monthByType('income'),
                'expense' => $monthByType('expense'),
            ];
        });

        return [
            Stat::make('Total Transactions', number_format($data['total']))
                ->descriptionIcon('heroicon-m-arrows-right-left')
                ->color('primary'),
            Stat::make('This Month', number_format($data['month']))
                ->description(now()->format('F Y'))
                ->color('info'),
            Stat::make('Income (month)', number_format($data['income']))
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success'),
            Stat::make('Expenses (month)', number_format($data['expense']))
                ->descriptionIcon('heroicon-m-arrow-trending-down')
                ->color('danger'),
        ];
    }
}
