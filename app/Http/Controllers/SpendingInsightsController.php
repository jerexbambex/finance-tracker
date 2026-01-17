<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SpendingInsightsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $insights = [];

        $insights['unusual_spending'] = $this->detectUnusualSpending($user);
        $insights['category_trends'] = $this->analyzeCategoryTrends($user);
        $insights['recurring_expenses'] = $this->detectRecurringExpenses($user);
        $insights['spending_patterns'] = $this->analyzeSpendingPatterns($user);
        $insights['savings_opportunities'] = $this->findSavingsOpportunities($user);

        return Inertia::render('insights/Index', [
            'insights' => $insights,
        ]);
    }

    public function generateAiInsights(Request $request)
    {
        $user = $request->user();

        // Prepare spending summary for AI
        $spendingSummary = $this->prepareSpendingSummary($user);

        // Call AWS Bedrock for AI analysis
        $aiInsights = $this->callBedrockForAnalysis($spendingSummary);

        return response()->json(['insights' => $aiInsights]);
    }

    private function detectUnusualSpending($user)
    {
        $results = [];
        $categories = $user->categories()->where('type', 'expense')->get();

        foreach ($categories as $category) {
            $threeMonthsAgo = now()->subMonths(3);
            $lastMonth = now()->subMonth();

            $avgSpending = $user->transactions()
                ->where('category_id', $category->id)
                ->where('type', 'expense')
                ->whereBetween('transaction_date', [$threeMonthsAgo, $lastMonth])
                ->avg(\DB::raw('amount'));

            $currentMonth = $user->transactions()
                ->where('category_id', $category->id)
                ->where('type', 'expense')
                ->where('transaction_date', '>=', now()->startOfMonth())
                ->sum(\DB::raw('amount'));

            if ($avgSpending > 0 && $currentMonth > ($avgSpending * 1.5)) {
                $increase = (($currentMonth - $avgSpending) / $avgSpending) * 100;
                $results[] = [
                    'category' => $category->name,
                    'current' => $currentMonth / 100,
                    'average' => $avgSpending / 100,
                    'increase_percent' => round($increase, 1),
                    'type' => 'warning',
                    'message' => "Your {$category->name} spending is ".round($increase, 0).'% higher than usual',
                ];
            }
        }

        return $results;
    }

    private function analyzeCategoryTrends($user)
    {
        $results = [];
        $categories = $user->categories()->where('type', 'expense')->get();

        foreach ($categories as $category) {
            $months = [];
            for ($i = 2; $i >= 0; $i--) {
                $date = now()->subMonths($i);
                $amount = $user->transactions()
                    ->where('category_id', $category->id)
                    ->where('type', 'expense')
                    ->whereYear('transaction_date', $date->year)
                    ->whereMonth('transaction_date', $date->month)
                    ->sum(\DB::raw('amount'));
                $months[] = $amount / 100;
            }

            if (array_sum($months) > 0) {
                $trend = 'stable';
                if ($months[2] > $months[1] && $months[1] > $months[0]) {
                    $trend = 'increasing';
                } elseif ($months[2] < $months[1] && $months[1] < $months[0]) {
                    $trend = 'decreasing';
                }

                $results[] = [
                    'category' => $category->name,
                    'trend' => $trend,
                    'months' => $months,
                    'total' => array_sum($months),
                ];
            }
        }

        return collect($results)->sortByDesc('total')->take(5)->values()->all();
    }

    private function detectRecurringExpenses($user)
    {
        $results = [];
        $threeMonthsAgo = now()->subMonths(3);

        $transactions = $user->transactions()
            ->where('type', 'expense')
            ->where('transaction_date', '>=', $threeMonthsAgo)
            ->whereNotNull('category_id')
            ->where('category_id', '!=', '')
            ->get()
            ->groupBy(function ($transaction) {
                return round($transaction->amount / 100).'-'.substr($transaction->description, 0, 10);
            });

        foreach ($transactions as $group) {
            if ($group->count() >= 2) {
                $first = $group->first();
                $results[] = [
                    'description' => $first->description,
                    'amount' => $first->amount / 100,
                    'category' => $first->category->name ?? 'Uncategorized',
                    'frequency' => $group->count(),
                ];
            }
        }

        return collect($results)->sortByDesc('frequency')->take(5)->values()->all();
    }

    private function analyzeSpendingPatterns($user)
    {
        $results = [];

        $weekendSpending = $user->transactions()
            ->where('type', 'expense')
            ->where('transaction_date', '>=', now()->subMonth())
            ->get()
            ->filter(fn ($t) => in_array($t->transaction_date->dayOfWeek, [0, 6]))
            ->sum('amount') / 100;

        $weekdaySpending = $user->transactions()
            ->where('type', 'expense')
            ->where('transaction_date', '>=', now()->subMonth())
            ->get()
            ->filter(fn ($t) => ! in_array($t->transaction_date->dayOfWeek, [0, 6]))
            ->sum('amount') / 100;

        if ($weekendSpending > 0 || $weekdaySpending > 0) {
            $results[] = [
                'type' => 'weekend_vs_weekday',
                'weekend' => $weekendSpending,
                'weekday' => $weekdaySpending,
            ];
        }

        $avgTransaction = $user->transactions()
            ->where('type', 'expense')
            ->where('transaction_date', '>=', now()->subMonth())
            ->avg(\DB::raw('amount')) / 100;

        if ($avgTransaction > 0) {
            $results[] = [
                'type' => 'average_transaction',
                'amount' => round($avgTransaction, 2),
            ];
        }

        return $results;
    }

    private function findSavingsOpportunities($user)
    {
        $results = [];

        $budgets = $user->budgets()
            ->with('category')
            ->where('period_year', now()->year)
            ->where('period_month', now()->month)
            ->get();

        foreach ($budgets as $budget) {
            $spent = $user->transactions()
                ->where('category_id', $budget->category_id)
                ->where('type', 'expense')
                ->where('transaction_date', '>=', now()->startOfMonth())
                ->sum(\DB::raw('amount')) / 100;

            if ($spent > $budget->amount) {
                $overspend = $spent - $budget->amount;
                $results[] = [
                    'category' => $budget->category->name,
                    'budgeted' => $budget->amount,
                    'spent' => $spent,
                    'overspend' => $overspend,
                ];
            }
        }

        $smallPurchases = $user->transactions()
            ->where('type', 'expense')
            ->where('transaction_date', '>=', now()->subMonth())
            ->get()
            ->filter(fn ($t) => ($t->amount / 100) < 20);

        if ($smallPurchases->count() > 10) {
            $results[] = [
                'type' => 'small_purchases',
                'count' => $smallPurchases->count(),
                'total' => $smallPurchases->sum('amount') / 100,
            ];
        }

        return $results;
    }

    private function prepareSpendingSummary($user)
    {
        return [
            'monthly_income' => $user->transactions()
                ->where('type', 'income')
                ->where('transaction_date', '>=', now()->startOfMonth())
                ->sum(\DB::raw('amount')) / 100,
            'monthly_expenses' => $user->transactions()
                ->where('type', 'expense')
                ->where('transaction_date', '>=', now()->startOfMonth())
                ->sum(\DB::raw('amount')) / 100,
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
            'budgets' => $user->budgets()
                ->with('category')
                ->where('period_year', now()->year)
                ->where('period_month', now()->month)
                ->get()
                ->map(fn ($b) => [
                    'category' => $b->category->name,
                    'budgeted' => $b->amount,
                ]),
        ];
    }

    private function callBedrockForAnalysis($spendingSummary)
    {
        try {
            $prompt = "Analyze this spending data and provide 3-5 personalized insights and recommendations:\n\n".
                      'Monthly Income: $'.number_format($spendingSummary['monthly_income'], 2)."\n".
                      'Monthly Expenses: $'.number_format($spendingSummary['monthly_expenses'], 2)."\n\n".
                      "Category Breakdown:\n".
                      $spendingSummary['category_breakdown']->map(fn ($c) => "- {$c['category']}: $".number_format($c['amount'], 2))->join("\n")."\n\n".
                      'Provide actionable, specific advice in a friendly tone.';

            $result = \Aws\BedrockRuntime\BedrockRuntimeClient::factory([
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
                        [
                            'role' => 'user',
                            'content' => $prompt,
                        ],
                    ],
                ]),
            ]);

            $response = json_decode($result['body'], true);

            return $response['content'][0]['text'] ?? 'Unable to generate AI insights at this time.';
        } catch (\Exception $e) {
            \Log::error('Bedrock API error: '.$e->getMessage());

            return 'AI insights temporarily unavailable. Please try again later.';
        }
    }
}
