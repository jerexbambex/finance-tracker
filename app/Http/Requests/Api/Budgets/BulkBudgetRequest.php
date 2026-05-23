<?php

namespace App\Http\Requests\Api\Budgets;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BulkBudgetRequest extends FormRequest
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
            'budgets' => ['required', 'array', 'min:1', 'max:200'],
            'budgets.*.categoryId' => ['required', 'uuid', Rule::exists('categories', 'id')],
            'budgets.*.year' => ['required', 'integer', 'between:2000,2100'],
            'budgets.*.month' => ['required', 'integer', 'between:1,12'],
            'budgets.*.amount' => ['required', 'numeric', 'min:0'],
            'budgets.*.isRecurrent' => ['nullable', 'boolean'],
        ];
    }
}
