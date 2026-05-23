<?php

namespace App\Http\Requests\Api\Insights;

use Illuminate\Foundation\Http\FormRequest;

class InsightsRangeRequest extends FormRequest
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
            'startDate' => ['nullable', 'date'],
            'endDate' => ['nullable', 'date', 'after_or_equal:startDate'],
            'months' => ['nullable', 'integer', 'between:1,24'],
        ];
    }
}
