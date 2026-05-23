<?php

namespace App\Http\Requests\Api\Settings;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSettingsRequest extends FormRequest
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
            'themeMode' => ['sometimes', Rule::in(['system', 'light', 'dark'])],
            'accentColor' => ['sometimes', 'string', 'max:32'],
            'currency' => ['sometimes', Rule::in(['usd', 'eur', 'gbp', 'sar', 'aed', 'ngn', 'cad', 'aud', 'jpy', 'cny', 'inr'])],
            'dailyReminderHour' => ['sometimes', 'integer', 'between:0,23'],
            'dailyReminderMinute' => ['sometimes', 'integer', 'between:0,59'],
            'dailyReminderEnabled' => ['sometimes', 'boolean'],
            'budgetAlertEnabled' => ['sometimes', 'boolean'],
            'flexibleStreakDays' => ['sometimes', 'integer', 'between:1,7'],
            'cloudSyncEnabled' => ['sometimes', 'boolean'],
        ];
    }
}
