<?php

namespace App\Http\Requests\Api\Budgets;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Shared validation for endpoints that take ?year=&month= query params
 * (list, analysis, alerts). Year defaults to current, month to current.
 */
class MonthlyPeriodRequest extends FormRequest
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
            'year' => ['nullable', 'integer', 'between:2000,2100'],
            'month' => ['nullable', 'integer', 'between:1,12'],
        ];
    }

    public function year(): int
    {
        return (int) ($this->validated('year') ?? now()->year);
    }

    public function month(): int
    {
        return (int) ($this->validated('month') ?? now()->month);
    }
}
