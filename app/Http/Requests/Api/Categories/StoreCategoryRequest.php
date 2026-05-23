<?php

namespace App\Http\Requests\Api\Categories;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:120'],
            'type' => ['required', Rule::in(['income', 'expense'])],
            'budgetCategory' => ['nullable', Rule::in(['needs', 'wants', 'savings', 'investment'])],
            'icon' => ['nullable', 'string', 'max:64'],
            'color' => ['nullable', 'string', 'max:32'],
            'monthlyBudget' => ['nullable', 'numeric', 'min:0'],
            'order' => ['nullable', 'integer', 'min:0'],
            'isArchived' => ['nullable', 'boolean'],
            'parentId' => ['nullable', 'uuid', Rule::exists('categories', 'id')],
        ];
    }
}
