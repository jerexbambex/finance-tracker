<?php

namespace App\Http\Requests\Api\Goals;

use Illuminate\Foundation\Http\FormRequest;

class StoreGoalRequest extends FormRequest
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
            'description' => ['nullable', 'string', 'max:500'],
            'targetAmount' => ['required', 'numeric', 'min:0.01'],
            'savedAmount' => ['nullable', 'numeric', 'min:0'],
            'deadline' => ['nullable', 'date', 'after_or_equal:today'],
            'category' => ['nullable', 'string', 'max:64'],
        ];
    }
}
