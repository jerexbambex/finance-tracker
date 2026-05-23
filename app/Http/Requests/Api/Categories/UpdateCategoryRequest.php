<?php

namespace App\Http\Requests\Api\Categories;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:120'],
            'type' => ['sometimes', Rule::in(['income', 'expense'])],
            'budgetCategory' => ['sometimes', 'nullable', Rule::in(['needs', 'wants', 'savings', 'investment'])],
            'icon' => ['sometimes', 'nullable', 'string', 'max:64'],
            'color' => ['sometimes', 'nullable', 'string', 'max:32'],
            'monthlyBudget' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'order' => ['sometimes', 'integer', 'min:0'],
            'isArchived' => ['sometimes', 'boolean'],
            'parentId' => ['sometimes', 'nullable', 'uuid', Rule::exists('categories', 'id')],
        ];
    }
}
