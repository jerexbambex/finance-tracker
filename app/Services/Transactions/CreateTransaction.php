<?php

namespace App\Services\Transactions;

use App\Models\Category;
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

        $account = $this->resolveOwnedAccount($user, $validated['account_id']);
        $category = $this->resolveCategory($user, $validated);

        $transaction = $user->transactions()->create([
            'user_id' => $user->id,
            'account_id' => $account->id,
            'category_id' => $category?->id,
            'type' => $validated['type'],
            'amount' => $validated['amount'],
            'currency' => strtoupper($validated['currency'] ?? $account->currency ?? 'CAD'),
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
            'category' => $category?->name,
            'account_id' => $transaction->account_id,
            'account' => $account->name,
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
            'category' => 'nullable|string|max:255',
            'account_id' => 'required|uuid|exists:accounts,id',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return $validator->validated();
    }

    private function resolveOwnedAccount(User $user, string $accountId)
    {
        $account = $user->accounts()->find($accountId);

        if (! $account) {
            throw ValidationException::withMessages([
                'account_id' => 'Account not found or does not belong to user.',
            ]);
        }

        return $account;
    }

    private function resolveCategory(User $user, array $validated): ?Category
    {
        $categoryId = $validated['category_id'] ?? null;
        $categoryName = $validated['category'] ?? null;

        if (! $categoryId && ! $categoryName) {
            return null;
        }

        $query = Category::query()
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereNull('user_id');
            });

        if ($categoryId) {
            $category = $query->whereKey($categoryId)->first();

            if (! $category) {
                throw ValidationException::withMessages([
                    'category_id' => 'Category not found or does not belong to user.',
                ]);
            }

            return $category;
        }

        $category = $query
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($categoryName)])
            ->first();

        if (! $category) {
            throw ValidationException::withMessages([
                'category' => 'Category not found or does not belong to user.',
            ]);
        }

        return $category;
    }

    private function normalizeDate($date): Carbon
    {
        return ($date instanceof Carbon ? $date : Carbon::parse($date))->startOfDay();
    }
}
