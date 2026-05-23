<?php

namespace App\Http\Requests\Api\Goals;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGoalRequest extends FormRequest
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
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'targetAmount' => ['sometimes', 'numeric', 'min:0.01'],
            'savedAmount' => ['sometimes', 'numeric', 'min:0'],
            'deadline' => ['sometimes', 'nullable', 'date'],
            'category' => ['sometimes', 'nullable', 'string', 'max:64'],
            'isCompleted' => ['sometimes', 'boolean'],
            'isActive' => ['sometimes', 'boolean'],
        ];
    }
}
