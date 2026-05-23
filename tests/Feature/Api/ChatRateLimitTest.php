<?php

use App\Ai\Agents\FinanceAssistant;
use App\Models\AiSetting;
use App\Models\User;
use Illuminate\Support\Str;

it('uses the configurable ai chat rate limit', function () {
    FinanceAssistant::fake(['Rate limit test response.']);

    AiSetting::query()->create([
        'provider' => 'openai',
        'model' => 'gpt-4.1-mini',
        'chat_rate_limit_per_minute' => 1,
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)->post(route('api.chat'), [
        'message' => 'First message',
        'client_message_id' => (string) Str::uuid(),
    ])->assertOk();

    $this->actingAs($user)->post(route('api.chat'), [
        'message' => 'Second message',
        'client_message_id' => (string) Str::uuid(),
    ])->assertStatus(429);
});
