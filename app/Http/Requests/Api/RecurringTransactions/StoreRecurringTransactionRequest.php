<?php

namespace App\Http\Requests\Api\RecurringTransactions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecurringTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['income', 'expense'])],
            'amount' => ['required', 'numeric', 'min:0'],
            'description' => ['required', 'string', 'max:500'],
            'frequency' => ['required', Rule::in(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'])],
            'nextDueDate' => ['required', 'date'],
            'categoryId' => ['nullable', 'uuid'],
            'accountId' => ['nullable', 'uuid'],
            'isActive' => ['nullable', 'boolean'],
        ];
    }
}
