<?php

namespace App\Http\Controllers\Api;

use App\Ai\Agents\FinanceAssistant;
use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use App\Models\AiMessage;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Laravel\Ai\Streaming\Events\TextDelta;
use Laravel\Ai\Streaming\Events\ToolCall;
use Laravel\Ai\Streaming\Events\ToolResult;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class ChatController extends Controller
{
    private const MAX_CONTEXT_MESSAGES = 20;

    private const MAX_CONTEXT_MESSAGE_CHARS = 500;

    public function chat(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'conversation_id' => 'nullable|uuid|exists:ai_conversations,id',
            'message' => 'required|string|max:5000',
            'client_message_id' => 'required|uuid',
        ]);

        $user = $request->user();

        // Check for duplicate message (idempotency)
        $existing = AiMessage::query()
            ->where('client_message_id', $validated['client_message_id'])
            ->whereHas('conversation', fn ($query) => $query->where('user_id', $user->id))
            ->first();

        if ($existing) {
            Log::info('Duplicate chat client message replayed.', [
                'client_message_id' => $validated['client_message_id'],
                'user_id' => $user->id,
                'conversation_id' => $existing->conversation_id,
            ]);

            return $this->streamExistingResponse($existing, $user);
        }

        // Get or create conversation
        $conversationId = $validated['conversation_id'] ?? null;

        $conversation = $conversationId
            ? AiConversation::where('id', $conversationId)->where('user_id', $user->id)->firstOrFail()
            : AiConversation::create([
                'user_id' => $user->id,
                'title' => Str::limit($validated['message'], 80),
            ]);

        // Store user message
        $userMessage = AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => ['text' => $validated['message']],
            'client_message_id' => $validated['client_message_id'],
        ]);

        // Keep prompt context compact: exclude the just-saved user message and skip raw tool messages.
        $messages = $conversation->messages()
            ->whereIn('role', ['user', 'assistant'])
            ->whereKeyNot($userMessage->id)
            ->orderBy('created_at', 'desc')
            ->limit(self::MAX_CONTEXT_MESSAGES)
            ->get()
            ->reverse()
            ->values();

        // Invoke agent with streaming
        $agent = FinanceAssistant::make();
        $prompt = $this->buildPrompt($validated['message'], $messages);

        return response()->stream(function () use ($agent, $prompt, $conversation, $userMessage) {
            $fullResponse = '';
            $toolCalls = [];
            $toolResults = [];

            try {
                $this->sendSseData([
                    'type' => 'start',
                    'conversation_id' => $conversation->id,
                ]);

                $stream = $agent->stream($prompt);

                foreach ($stream as $event) {
                    if ($event instanceof TextDelta) {
                        $fullResponse .= $event->delta;
                        $this->sendSseData([
                            'type' => 'content',
                            'content' => $event->delta,
                            'conversation_id' => $conversation->id,
                        ]);

                        continue;
                    }

                    if ($event instanceof ToolCall) {
                        $toolCalls[] = $event->toolCall->toArray();

                        $this->sendSseData(
                            [
                                'type' => 'tool_call',
                                'conversation_id' => $conversation->id,
                                'tool_call' => $event->toolCall->toArray(),
                            ],
                            'tool_call'
                        );

                        continue;
                    }

                    if ($event instanceof ToolResult) {
                        $toolResults[] = $event->toolResult->toArray();

                        $this->sendSseData(
                            [
                                'type' => 'tool_result',
                                'conversation_id' => $conversation->id,
                                'tool_result' => $event->toolResult->toArray(),
                                'successful' => $event->successful,
                                'error' => $event->error,
                            ],
                            'tool_result'
                        );
                    }
                }

                $assistantMessage = AiMessage::create([
                    'conversation_id' => $conversation->id,
                    'role' => 'assistant',
                    'content' => [
                        'text' => $fullResponse,
                        'tool_calls' => $toolCalls,
                        'tool_results' => $toolResults,
                    ],
                ]);

                foreach ($toolResults as $toolResult) {
                    AiMessage::create([
                        'conversation_id' => $conversation->id,
                        'role' => 'tool',
                        'content' => $toolResult,
                    ]);
                }

                $this->sendSseData([
                    'type' => 'done',
                    'conversation_id' => $conversation->id,
                    'assistant_message_id' => $assistantMessage->id,
                    'reply_to' => $userMessage->id,
                ]);
            } catch (Throwable $e) {
                Log::error('Chat streaming failed.', [
                    'conversation_id' => $conversation->id,
                    'user_message_id' => $userMessage->id,
                    'error' => $e->getMessage(),
                    'exception' => $e::class,
                ]);

                $this->sendSseData([
                    'type' => 'error',
                    'conversation_id' => $conversation->id,
                    'message' => $e->getMessage(),
                ]);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    private function streamExistingResponse(AiMessage $message, Authenticatable $user): StreamedResponse
    {
        return response()->stream(function () use ($message, $user) {
            $assistantMessage = AiMessage::query()
                ->where('conversation_id', $message->conversation_id)
                ->where('role', 'assistant')
                ->where('created_at', '>=', $message->created_at)
                ->orderBy('created_at')
                ->first();

            $content = $assistantMessage?->content['text'] ?? '';

            $this->sendSseData([
                'type' => 'start',
                'conversation_id' => $message->conversation_id,
            ]);
            $this->sendSseData([
                'type' => 'content',
                'content' => $content,
                'conversation_id' => $message->conversation_id,
            ]);
            $this->sendSseData([
                'type' => 'done',
                'conversation_id' => $message->conversation_id,
                'assistant_message_id' => $assistantMessage?->id,
            ]);
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    private function buildPrompt(string $message, $messages): string
    {
        $today = now();
        $startOfMonth = $today->copy()->startOfMonth()->toDateString();
        $endOfMonth = $today->copy()->endOfMonth()->toDateString();

        $history = $messages
            ->map(fn (AiMessage $message) => $this->formatConversationMessage($message))
            ->implode("\n");

        if ($history === '') {
            $history = '(none)';
        }

        return trim(<<<PROMPT
Today is {$today->toFormattedDateString()}.
Current month range: {$startOfMonth} to {$endOfMonth}.

Conversation history (oldest first):
{$history}

Latest user message:
{$message}
PROMPT);
    }

    private function formatConversationMessage(AiMessage $message): string
    {
        $content = $message->content['text'] ?? json_encode($message->content, JSON_UNESCAPED_SLASHES);
        $content = preg_replace('/\s+/', ' ', (string) $content) ?? '';
        $content = Str::limit(trim($content), self::MAX_CONTEXT_MESSAGE_CHARS);

        return sprintf('%s: %s', $message->role, $content);
    }

    private function sendSseData(array $payload, ?string $event = null): void
    {
        if ($event) {
            echo 'event: '.$event."\n";
        }

        echo 'data: '.json_encode($payload)."\n\n";

        if (ob_get_level() > 0) {
            ob_flush();
        }

        flush();
    }
}
