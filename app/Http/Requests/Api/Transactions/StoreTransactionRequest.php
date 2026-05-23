<?php

namespace App\Http\Requests\Api\Transactions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
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
            'amount' => ['required', 'numeric', 'min:0'],
            'type' => ['required', Rule::in(['income', 'expense'])],
            'categoryId' => ['nullable', 'uuid'],
            'accountId' => ['nullable', 'uuid'],
            'description' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'date' => ['nullable', 'date'],
            'currency' => ['nullable', 'string', 'size:3'],
        ];
    }
}
