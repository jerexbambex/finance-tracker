<?php

namespace App\Http\Controllers\Api;

use App\Ai\Agents\FinanceAssistant;
use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use App\Models\AiMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatController extends Controller
{
    public function chat(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'conversation_id' => 'nullable|uuid|exists:ai_conversations,id',
            'message' => 'required|string|max:5000',
            'client_message_id' => 'required|uuid',
        ]);

        $user = $request->user();

        // Check for duplicate message (idempotency)
        $existing = AiMessage::where('client_message_id', $validated['client_message_id'])->first();
        if ($existing) {
            return $this->streamExistingResponse($existing);
        }

        // Get or create conversation
        $conversation = $validated['conversation_id']
            ? AiConversation::where('id', $validated['conversation_id'])->where('user_id', $user->id)->firstOrFail()
            : AiConversation::create(['user_id' => $user->id]);

        // Store user message
        AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => ['text' => $validated['message']],
            'client_message_id' => $validated['client_message_id'],
        ]);

        // Load conversation context (last 20 messages)
        $messages = $conversation->messages()
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->reverse()
            ->values();

        // Invoke agent with streaming
        $agent = FinanceAssistant::make();

        return response()->stream(function () use ($agent, $validated, $conversation, $messages) {
            $fullResponse = '';

            try {
                $stream = $agent->stream($validated['message']);

                foreach ($stream as $chunk) {
                    $fullResponse .= $chunk;
                    echo "data: " . json_encode(['type' => 'content', 'content' => $chunk]) . "\n\n";
                    if (ob_get_level() > 0) {
                        ob_flush();
                    }
                    flush();
                }

                // Store assistant message
                AiMessage::create([
                    'conversation_id' => $conversation->id,
                    'role' => 'assistant',
                    'content' => ['text' => $fullResponse],
                ]);

                echo "data: " . json_encode(['type' => 'done']) . "\n\n";
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
            } catch (\Exception $e) {
                echo "data: " . json_encode(['type' => 'error', 'message' => $e->getMessage()]) . "\n\n";
                if (ob_get_level() > 0) {
                    ob_flush();
                }
                flush();
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    private function streamExistingResponse(AiMessage $message): StreamedResponse
    {
        return response()->stream(function () use ($message) {
            $content = $message->content['text'] ?? '';
            echo "data: " . json_encode(['type' => 'content', 'content' => $content]) . "\n\n";
            echo "data: " . json_encode(['type' => 'done']) . "\n\n";
            if (ob_get_level() > 0) {
                ob_flush();
            }
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}

