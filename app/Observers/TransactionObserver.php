<?php

namespace App\Observers;

use App\Models\Account;
use App\Models\Transaction;

class TransactionObserver
{
    public function created(Transaction $transaction): void
    {
        $this->applyEffect($transaction->account_id, $transaction->type, $this->rawCents($transaction));
    }

    public function updated(Transaction $transaction): void
    {
        // getRawOriginal bypasses the accessor — we need raw cents, not dollars
        $oldCents     = (int) $transaction->getRawOriginal('amount');
        $oldType      = $transaction->getRawOriginal('type');
        $oldAccountId = $transaction->getRawOriginal('account_id');

        $newCents     = $this->rawCents($transaction);
        $newType      = $transaction->type;
        $newAccountId = $transaction->account_id;

        $this->reverseEffect($oldAccountId, $oldType, $oldCents);
        $this->applyEffect($newAccountId, $newType, $newCents);
    }

    public function deleted(Transaction $transaction): void
    {
        $this->reverseEffect($transaction->account_id, $transaction->type, $this->rawCents($transaction));
    }

    private function applyEffect(string $accountId, string $type, int $cents): void
    {
        if ($type === 'income') {
            Account::where('id', $accountId)->increment('balance', $cents);
        } elseif ($type === 'expense') {
            Account::where('id', $accountId)->decrement('balance', $cents);
        }
        // 'transfer' type handled explicitly by TransferController
    }

    private function reverseEffect(string $accountId, string $type, int $cents): void
    {
        if ($type === 'income') {
            Account::where('id', $accountId)->decrement('balance', $cents);
        } elseif ($type === 'expense') {
            Account::where('id', $accountId)->increment('balance', $cents);
        }
    }

    private function rawCents(Transaction $transaction): int
    {
        return (int) $transaction->getAttributes()['amount'];
    }
}
