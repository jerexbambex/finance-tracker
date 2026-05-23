<?php

use App\Ai\Agents\FinanceAssistant;
use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\User;
use Illuminate\Support\Str;

it('streams a new assistant response and persists conversation messages', function () {
    FinanceAssistant::fake(['Budget created successfully.']);

    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->post(route('api.chat'), [
            'message' => 'Set a $500 food budget for this month',
            'client_message_id' => (string) Str::uuid(),
        ]);

    $response->assertOk()->assertStreamed();

    $stream = $response->streamedContent();

    expect($stream)->toContain('"type":"start"')
        ->toContain('"type":"content"')
        ->toContain('"content":"Budget"')
        ->toContain('"content":" created"')
        ->toContain('"content":" successfully."')
        ->toContain('"type":"done"');

    $conversation = AiConversation::query()->first();
    $messages = AiMessage::query()->orderBy('created_at')->get();

    expect($conversation)->not->toBeNull()
        ->and($conversation->user_id)->toBe($user->id)
        ->and($messages)->toHaveCount(2)
        ->and($messages[0]->role)->toBe('user')
        ->and($messages[1]->role)->toBe('assistant')
        ->and($messages[1]->content['text'])->toBe('Budget created successfully.');

    FinanceAssistant::assertPrompted(function ($prompt) {
        return str_contains($prompt->prompt, 'Latest user message:')
            && str_contains($prompt->prompt, 'Set a $500 food budget for this month')
            && str_contains($prompt->prompt, 'Current month range:');
    });
});

it('replays the stored assistant response for duplicate client message ids', function () {
    FinanceAssistant::fake(['Original assistant reply.']);

    $user = User::factory()->create();
    $clientMessageId = (string) Str::uuid();

    $firstResponse = $this->actingAs($user)->post(route('api.chat'), [
        'message' => 'List my budgets',
        'client_message_id' => $clientMessageId,
    ])->assertOk();

    $firstResponse->streamedContent();

    FinanceAssistant::assertPrompted(fn ($prompt) => str_contains($prompt->prompt, 'List my budgets'));

    $secondResponse = $this
        ->actingAs($user)
        ->post(route('api.chat'), [
            'message' => 'List my budgets',
            'client_message_id' => $clientMessageId,
        ]);

    $secondResponse->assertOk()->assertStreamed();

    expect($secondResponse->streamedContent())->toContain('Original assistant reply.');
    expect(AiConversation::query()->count())->toBe(1)
        ->and(AiMessage::query()->count())->toBe(2);
});

it('keeps prompt context compact and excludes tool payload replay', function () {
    FinanceAssistant::fake(['Done.']);

    $user = User::factory()->create();
    $conversation = AiConversation::create([
        'user_id' => $user->id,
        'title' => 'Existing thread',
    ]);
    $baseTime = now()->startOfDay();

    foreach (range(1, 5) as $index) {
        AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => ['text' => "Older user message {$index}"],
            'created_at' => $baseTime->copy()->addMinutes(($index - 1) * 2),
            'updated_at' => $baseTime->copy()->addMinutes(($index - 1) * 2),
        ]);

        AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => [
                'text' => str_repeat("Assistant reply {$index} ", 80),
                'tool_results' => [['verbose' => 'SHOULD_NOT_BE_REPLAYED']],
            ],
            'created_at' => $baseTime->copy()->addMinutes((($index - 1) * 2) + 1),
            'updated_at' => $baseTime->copy()->addMinutes((($index - 1) * 2) + 1),
        ]);
    }

    AiMessage::create([
        'conversation_id' => $conversation->id,
        'role' => 'tool',
        'content' => ['verbose' => 'RAW_TOOL_PAYLOAD_SHOULD_NOT_BE_REPLAYED'],
        'created_at' => $baseTime->copy()->addMinutes(11),
        'updated_at' => $baseTime->copy()->addMinutes(11),
    ]);

    $latestMessage = 'Show my spending this month';

    $response = $this
        ->actingAs($user)
        ->post(route('api.chat'), [
            'conversation_id' => $conversation->id,
            'message' => $latestMessage,
            'client_message_id' => (string) Str::uuid(),
        ]);

    $response->assertOk();
    $response->streamedContent();

    FinanceAssistant::assertPrompted(function ($prompt) use ($latestMessage) {
        // All 5 historical user + 5 assistant messages fit within MAX_CONTEXT_MESSAGES=20
        return substr_count($prompt->prompt, 'user: ') === 5
            && substr_count($prompt->prompt, 'assistant: ') === 5
            && ! str_contains($prompt->prompt, 'RAW_TOOL_PAYLOAD_SHOULD_NOT_BE_REPLAYED')
            && ! str_contains($prompt->prompt, 'SHOULD_NOT_BE_REPLAYED')
            && substr_count($prompt->prompt, $latestMessage) === 1;
    });
});
