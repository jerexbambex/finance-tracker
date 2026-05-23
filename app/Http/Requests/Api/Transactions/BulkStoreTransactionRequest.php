<?php

namespace App\Http\Requests\Api\Transactions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkStoreTransactionRequest extends FormRequest
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
            'transactions' => ['required', 'array', 'min:1', 'max:500'],
            'transactions.*.amount' => ['required', 'numeric', 'min:0'],
            'transactions.*.type' => ['required', Rule::in(['income', 'expense'])],
            'transactions.*.categoryId' => ['nullable', 'uuid'],
            'transactions.*.accountId' => ['nullable', 'uuid'],
            'transactions.*.description' => ['nullable', 'string', 'max:500'],
            'transactions.*.notes' => ['nullable', 'string', 'max:1000'],
            'transactions.*.date' => ['nullable', 'date'],
            'transactions.*.currency' => ['nullable', 'string', 'size:3'],
        ];
    }
}
