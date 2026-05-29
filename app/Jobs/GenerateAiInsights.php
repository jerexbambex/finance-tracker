<?php

namespace App\Jobs;

use App\Models\User;
use Aws\BedrockRuntime\BedrockRuntimeClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GenerateAiInsights implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public int $timeout = 60;

    public function __construct(public User $user) {}

    /**
     * Cache key holding the latest AI insights result for a user.
     */
    public static function cacheKey(string $userId): string
    {
        return "ai_insights:{$userId}";
    }

    public function handle(): void
    {
        $summary = $this->prepareSpendingSummary();
        $text = $this->callBedrock($summary);

        Cache::put(self::cacheKey($this->user->id), [
            'status' => 'completed',
            'insights' => $text,
            'generated_at' => now()->toIso8601String(),
        ], now()->addDay());
    }

    public function failed(\Throwable $e): void
    {
        Log::error('GenerateAiInsights job failed: '.$e->getMessage());

        Cache::put(self::cacheKey($this->user->id), [
            'status' => 'failed',
            'insights' => 'AI insights temporarily unavailable. Please try again later.',
            'generated_at' => now()->toIso8601String(),
        ], now()->addHour());
    }

    private function prepareSpendingSummary(): array
    {
        $user = $this->user;

        return [
            'monthly_income' => $user->transactions()
                ->where('type', 'income')
                ->where('transaction_date', '>=', now()->startOfMonth())
                ->sum('amount') / 100,
            'monthly_expenses' => $user->transactions()
                ->where('type', 'expense')
                ->where('transaction_date', '>=', now()->startOfMonth())
                ->sum('amount') / 100,
            'category_breakdown' => $user->transactions()
                ->selectRaw('category_id, SUM(amount) as total')
                ->with('category')
                ->where('type', 'expense')
                ->where('transaction_date', '>=', now()->startOfMonth())
                ->groupBy('category_id')
                ->get()
                ->map(fn ($t) => [
                    'category' => $t->category->name ?? 'Uncategorized',
                    'amount' => $t->total / 100,
                ]),
        ];
    }

    private function callBedrock(array $summary): string
    {
        $prompt = "Analyze this spending data and provide 3-5 personalized insights and recommendations:\n\n".
            'Monthly Income: $'.number_format($summary['monthly_income'], 2)."\n".
            'Monthly Expenses: $'.number_format($summary['monthly_expenses'], 2)."\n\n".
            "Category Breakdown:\n".
            $summary['category_breakdown']->map(fn ($c) => "- {$c['category']}: $".number_format($c['amount'], 2))->join("\n")."\n\n".
            'Provide actionable, specific advice in a friendly tone.';

        $result = BedrockRuntimeClient::factory([
            'region' => config('services.aws.region', 'us-east-1'),
            'version' => 'latest',
        ])->invokeModel([
            'modelId' => 'anthropic.claude-3-haiku-20240307-v1:0',
            'contentType' => 'application/json',
            'accept' => 'application/json',
            'body' => json_encode([
                'anthropic_version' => 'bedrock-2023-05-31',
                'max_tokens' => 1000,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]),
        ]);

        $response = json_decode($result['body'], true);

        return $response['content'][0]['text'] ?? 'Unable to generate AI insights at this time.';
    }
}
