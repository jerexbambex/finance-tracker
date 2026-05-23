<?php

namespace App\Http\Requests\Api\Transactions;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTransactionRequest extends FormRequest
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
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'type' => ['sometimes', Rule::in(['income', 'expense'])],
            'categoryId' => ['sometimes', 'nullable', 'uuid'],
            'accountId' => ['sometimes', 'uuid'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'date' => ['sometimes', 'date'],
            'currency' => ['sometimes', 'string', 'size:3'],
        ];
    }
}
