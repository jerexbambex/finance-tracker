<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Older transactions were created before currency-awareness and took the
     * column default ('USD') regardless of their account's actual currency.
     * Budget/report queries now filter by currency, so those rows would be
     * miscounted. Align each transaction's currency with its account.
     */
    public function up(): void
    {
        DB::table('accounts')->orderBy('id')->chunkById(500, function ($accounts) {
            foreach ($accounts as $account) {
                DB::table('transactions')
                    ->where('account_id', $account->id)
                    ->where('currency', '!=', $account->currency)
                    ->update(['currency' => $account->currency]);
            }
        });
    }

    public function down(): void
    {
        // Non-reversible data backfill; nothing to undo.
    }
};
