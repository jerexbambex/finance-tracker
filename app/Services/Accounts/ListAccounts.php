<?php

namespace App\Services\Accounts;

use App\Models\User;

class ListAccounts
{
    public function execute(User $user): array
    {
        $accounts = $user->accounts()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return [
            'accounts' => $accounts->map(fn ($a) => [
                'account_id' => $a->id,
                'name' => $a->name,
                'type' => $a->type,
                'currency' => $a->currency,
                'balance' => $a->balance,
            ])->toArray(),
            'count' => $accounts->count(),
        ];
    }
}
