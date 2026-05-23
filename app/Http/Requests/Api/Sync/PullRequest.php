<?php

namespace App\Http\Requests\Api\Sync;

use Illuminate\Foundation\Http\FormRequest;

class PullRequest extends FormRequest
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
            'lastSyncAt' => ['nullable', 'date'],
        ];
    }
}
