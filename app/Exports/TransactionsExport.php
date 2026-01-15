<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TransactionsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Transaction::where('user_id', auth()->id())
            ->with(['account', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Date',
            'Account',
            'Category',
            'Type',
            'Amount',
            'Description',
        ];
    }

    public function map($transaction): array
    {
        return [
            $transaction->transaction_date->format('Y-m-d'),
            $transaction->account->name,
            $transaction->category?->name ?? 'Uncategorized',
            ucfirst($transaction->type),
            $transaction->amount, // Already converted by accessor
            $transaction->description,
        ];
    }
}
