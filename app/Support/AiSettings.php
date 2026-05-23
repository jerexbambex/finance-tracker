<?php

namespace App\Support;

use App\Models\AiSetting;

class AiSettings
{
    public function current(): AiSetting
    {
        return AiSetting::query()->firstOrCreate(
            [],
            [
                'provider' => config('ai.default', env('AI_PROVIDER', 'openai')),
                'model' => env('AI_MODEL', 'gpt-4.1-mini'),
                'chat_rate_limit_per_minute' => 20,
            ]
        );
    }

    public function provider(): string
    {
        return $this->current()->provider;
    }

    public function model(): string
    {
        return $this->current()->model;
    }

    public function chatRateLimitPerMinute(): int
    {
        return max(1, $this->current()->chat_rate_limit_per_minute);
    }
}
