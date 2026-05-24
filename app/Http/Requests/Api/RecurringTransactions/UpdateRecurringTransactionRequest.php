<?php

namespace App\Http\Requests\Api\RecurringTransactions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRecurringTransactionRequest extends FormRequest
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
            'type' => ['sometimes', Rule::in(['income', 'expense'])],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'description' => ['sometimes', 'string', 'max:500'],
            'frequency' => ['sometimes', Rule::in(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'])],
            'nextDueDate' => ['sometimes', 'date'],
            'categoryId' => ['sometimes', 'nullable', 'uuid'],
            'accountId' => ['sometimes', 'nullable', 'uuid'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }
}
