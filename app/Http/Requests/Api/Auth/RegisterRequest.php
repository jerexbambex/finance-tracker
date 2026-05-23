<?php

namespace App\Http\Requests\Api\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
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
            'phoneNumber' => ['required', 'string', 'max:32', Rule::unique('users', 'phone_number')],
            'password' => ['required', 'string', 'min:8', 'max:128'],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')],
            'firstName' => ['nullable', 'string', 'max:120'],
            'lastName' => ['nullable', 'string', 'max:120'],
            'goal' => ['nullable', 'string', 'max:64'],
            'deviceName' => ['nullable', 'string', 'max:120'],
        ];
    }
}
