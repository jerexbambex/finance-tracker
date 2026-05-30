<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Existing accounts carry a stored balance with no backing transaction, so
     * the ledger can't be reconstructed (the "phantom opening balance" problem).
     * For each account, materialize an 'opening' transaction equal to
     *   balance - (sum(income) - sum(expense))
     * so that  balance == sum(opening) + sum(income) - sum(expense).
     *
     * Inserted via raw query (NOT the model) so the observer does NOT fire —
     * the stored balance is already correct and must not change here.
     */
    public function up(): void
    {
        DB::table('accounts')->orderBy('id')->chunkById(500, function ($accounts) {
            foreach ($accounts as $account) {
                $income = (int) DB::table('transactions')
                    ->where('account_id', $account->id)
                    ->where('type', 'income')
                    ->sum('amount');

                $expense = (int) DB::table('transactions')
                    ->where('account_id', $account->id)
                    ->where('type', 'expense')
                    ->sum('amount');

                // Skip if an opening row already exists (idempotent re-run)
                $hasOpening = DB::table('transactions')
                    ->where('account_id', $account->id)
                    ->where('type', 'opening')
                    ->exists();

                if ($hasOpening) {
                    continue;
                }

                $openingCents = (int) $account->balance - ($income - $expense);

                if ($openingCents === 0) {
                    continue;
                }

                DB::table('transactions')->insert([
                    'id' => (string) Str::uuid(),
                    'user_id' => $account->user_id,
                    'account_id' => $account->id,
                    'category_id' => null,
                    'type' => 'opening',
                    'amount' => $openingCents, // raw cents
                    'currency' => $account->currency ?? 'USD',
                    'description' => 'Opening balance',
                    'transaction_date' => $account->created_at
                        ? \Carbon\Carbon::parse($account->created_at)->toDateString()
                        : now()->toDateString(),
                    'is_recurring' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });
    }

    public function down(): void
    {
        DB::table('transactions')->where('type', 'opening')->delete();
    }
};
