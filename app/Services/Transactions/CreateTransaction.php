<?php

namespace App\Services\Transactions;

use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CreateTransaction
{
    public function execute(User $user, array $data): array
    {
        $validated = $this->validate($data);

        $this->validateOwnership($user, $validated);

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'account_id' => $validated['account_id'],
            'category_id' => $validated['category_id'] ?? null,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'currency' => $validated['currency'] ?? 'CAD',
            'description' => $validated['description'] ?? null,
            'transaction_date' => $this->normalizeDate($validated['date'] ?? now()),
            'notes' => $validated['notes'] ?? null,
        ]);

        return [
            'id' => $transaction->id,
            'type' => $transaction->type,
            'amount' => $transaction->amount,
            'currency' => $transaction->currency,
            'description' => $transaction->description,
            'date' => $transaction->transaction_date->format('Y-m-d'),
            'category_id' => $transaction->category_id,
            'account_id' => $transaction->account_id,
        ];
    }

    private function validate(array $data): array
    {
        $validator = Validator::make($data, [
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:income,expense',
            'currency' => 'nullable|string|size:3',
            'description' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'category_id' => 'nullable|uuid|exists:categories,id',
            'account_id' => 'required|uuid|exists:accounts,id',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    private function validateOwnership(User $user, array $validated): void
    {
        if (isset($validated['account_id'])) {
            $account = $user->accounts()->find($validated['account_id']);
            if (!$account) {
                throw ValidationException::withMessages(['account_id' => 'Account not found or does not belong to user.']);
            }
        }

        if (isset($validated['category_id'])) {
            $category = $user->categories()->find($validated['category_id']);
            if (!$category) {
                throw ValidationException::withMessages(['category_id' => 'Category not found or does not belong to user.']);
            }
        }
    }

    private function normalizeDate($date): Carbon
    {
        return $date instanceof Carbon ? $date : Carbon::parse($date);
    }
}
