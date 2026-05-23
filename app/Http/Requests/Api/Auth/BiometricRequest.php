<?php

namespace App\Http\Requests\Api\Auth;

use Illuminate\Foundation\Http\FormRequest;

class BiometricRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'biometricToken' => ['required', 'string', 'min:16', 'max:255'],
            'phoneNumber' => ['nullable', 'string', 'max:32'],
            'deviceName' => ['nullable', 'string', 'max:120'],
        ];
    }
}
