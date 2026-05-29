<?php

namespace App\Observers;

use App\Models\Account;
use App\Models\Transaction;

/**
 * Keeps Account.balance in sync with its transactions. This is the single
 * authority for balance effects across ALL types: income/opening add,
 * expense subtracts, and transfer legs use their transfer_direction
 * ('out' subtracts, 'in' adds).
 *
 * WARNING: This relies on Eloquent model events. Any writer that mutates a
 * transaction's amount/type/account_id/transfer_direction MUST go through
 * model instances ($model->save()/update()/delete() or ->each->delete()).
 * Mass query-builder writes (Transaction::where(...)->update()/delete())
 * bypass these events and will silently desync account balances. Wrap
 * balance-affecting writes in a DB transaction so the row change and the
 * balance update commit together.
 */
class TransactionObserver
{
    public function created(Transaction $transaction): void
    {
        $this->adjust($transaction->account_id, $this->signedDelta($transaction->type, $transaction->transfer_direction, $this->rawCents($transaction)));
    }

    public function updated(Transaction $transaction): void
    {
        // getRawOriginal bypasses the accessor — we need raw cents, not dollars
        $oldDelta = $this->signedDelta(
            $transaction->getRawOriginal('type'),
            $transaction->getRawOriginal('transfer_direction'),
            (int) $transaction->getRawOriginal('amount'),
        );
        $newDelta = $this->signedDelta($transaction->type, $transaction->transfer_direction, $this->rawCents($transaction));

        $this->adjust($transaction->getRawOriginal('account_id'), -$oldDelta);
        $this->adjust($transaction->account_id, $newDelta);
    }

    public function deleted(Transaction $transaction): void
    {
        $this->adjust($transaction->account_id, -$this->signedDelta($transaction->type, $transaction->transfer_direction, $this->rawCents($transaction)));
    }

    /**
     * Signed effect (in cents) a transaction has on its account balance.
     * income/opening add; expense subtracts; transfer uses its leg direction.
     */
    private function signedDelta(?string $type, ?string $transferDirection, int $cents): int
    {
        return match ($type) {
            'income', 'opening' => $cents,
            'expense' => -$cents,
            'transfer' => $transferDirection === 'in' ? $cents : -$cents,
            default => 0,
        };
    }

    private function adjust(?string $accountId, int $cents): void
    {
        if ($accountId === null || $cents === 0) {
            return;
        }
        Account::where('id', $accountId)->increment('balance', $cents); // negative increments decrement
    }

    private function rawCents(Transaction $transaction): int
    {
        return (int) $transaction->getAttributes()['amount'];
    }
}
