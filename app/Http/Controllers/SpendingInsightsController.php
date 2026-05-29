<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateAiInsights;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
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

        $primaryCurrency = $user->accounts()->where('is_active', true)->value('currency') ?? 'USD';

        return Inertia::render('insights/Index', [
            'insights' => $insights,
            'primaryCurrency' => $primaryCurrency,
        ]);
    }

    public function generateAiInsights(Request $request)
    {
        $user = $request->user();
        $key = 'ai-insights:'.$user->id;

        // Per-user daily cap to bound AWS cost
        if (RateLimiter::tooManyAttempts($key, perMinute: 5)) {
            return response()->json([
                'status' => 'rate_limited',
                'message' => 'Daily AI insight limit reached. Try again tomorrow.',
                'retry_after' => RateLimiter::availableIn($key),
            ], 429);
        }

        RateLimiter::increment($key, amount: 1, decaySeconds: 86400);

        Cache::put(GenerateAiInsights::cacheKey($user->id), [
            'status' => 'processing',
            'insights' => null,
            'generated_at' => now()->toIso8601String(),
        ], now()->addDay());

        GenerateAiInsights::dispatch($user);

        return response()->json(['status' => 'processing']);
    }

    public function aiInsightsStatus(Request $request)
    {
        $result = Cache::get(GenerateAiInsights::cacheKey($request->user()->id));

        return response()->json($result ?? ['status' => 'idle', 'insights' => null]);
    }

    private function detectUnusualSpending($user)
    {
        $threeMonthsAgo = now()->subMonths(3);
        $lastMonth = now()->subMonth();

        // Two queries instead of O(N) per category
        $avgByCategory = $user->transactions()
            ->where('transactions.type', 'expense')
            ->whereBetween('transactions.transaction_date', [$threeMonthsAgo, $lastMonth])
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->selectRaw('transactions.category_id, accounts.currency, AVG(transactions.amount) as avg_amount')
            ->groupBy('transactions.category_id', 'accounts.currency')
            ->get()
            ->groupBy('category_id');

        $currentByCategory = $user->transactions()
            ->where('transactions.type', 'expense')
            ->where('transactions.transaction_date', '>=', now()->startOfMonth())
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->selectRaw('transactions.category_id, accounts.currency, SUM(transactions.amount) as total')
            ->groupBy('transactions.category_id', 'accounts.currency')
            ->get()
            ->groupBy('category_id')
            ->map(fn ($rows) => $rows->keyBy('currency'));

        $results = [];
        $categories = $user->categories()->where('type', 'expense')->get();

        foreach ($categories as $category) {
            $avgRows = $avgByCategory->get($category->id, collect());
            $currentRows = $currentByCategory->get($category->id, collect());

            foreach ($avgRows as $avgRow) {
                $currency = $avgRow->currency;
                $avgAmount = $avgRow->avg_amount;
                $currentAmount = $currentRows->get($currency)?->total ?? 0;

                if ($avgAmount > 0 && $currentAmount > ($avgAmount * 1.5)) {
                    $increase = (($currentAmount - $avgAmount) / $avgAmount) * 100;
                    $results[] = [
                        'category' => $category->name,
                        'current' => $currentAmount / 100,
                        'average' => $avgAmount / 100,
                        'increase_percent' => round($increase, 1),
                        'type' => 'warning',
                        'message' => "Your {$category->name} spending is ".round($increase, 0).'% higher than usual',
                        'currency' => $currency,
                    ];
                }
            }
        }

        return $results;
    }

    private function analyzeCategoryTrends($user)
    {
        // One query for all 3 months instead of O(N*3) per category
        $allRows = $user->transactions()
            ->where('transactions.type', 'expense')
            ->where('transactions.transaction_date', '>=', now()->subMonths(2)->startOfMonth())
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->selectRaw('transactions.category_id, accounts.currency, YEAR(transactions.transaction_date) as yr, MONTH(transactions.transaction_date) as mo, SUM(transactions.amount) as total')
            ->groupBy('transactions.category_id', 'accounts.currency', 'yr', 'mo')
            ->get()
            ->groupBy('category_id');

        // Month lookup: index 0=current, 1=last, 2=two months ago
        $monthKeys = [];
        for ($i = 0; $i <= 2; $i++) {
            $date = now()->subMonths($i);
            $monthKeys[$i] = [$date->year, $date->month];
        }

        $results = [];
        $categories = $user->categories()->where('type', 'expense')->get();

        foreach ($categories as $category) {
            $categoryRows = $allRows->get($category->id, collect());
            if ($categoryRows->isEmpty()) {
                continue;
            }

            $currencyMonths = [];
            foreach ($categoryRows as $row) {
                foreach ($monthKeys as $idx => [$yr, $mo]) {
                    if ((int) $row->yr === $yr && (int) $row->mo === $mo) {
                        $currencyMonths[$row->currency][$idx] = $row->total / 100;
                    }
                }
            }

            foreach ($currencyMonths as $currency => $monthData) {
                // months[0]=2mo ago, months[1]=1mo ago, months[2]=current
                $months = [
                    $monthData[2] ?? 0,
                    $monthData[1] ?? 0,
                    $monthData[0] ?? 0,
                ];

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
                        'currency' => $currency,
                    ];
                }
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
            ->with(['category', 'account'])
            ->get()
            ->groupBy(function ($transaction) {
                return ($transaction->account?->currency ?? 'USD').'-'.round($transaction->amount).'-'.substr($transaction->description, 0, 10);
            });

        foreach ($transactions as $group) {
            if ($group->count() >= 2) {
                $first = $group->first();
                $results[] = [
                    'description' => $first->description,
                    'amount' => $first->amount,
                    'category' => $first->category?->name ?? 'Uncategorized',
                    'frequency' => $group->count(),
                    'currency' => $first->account?->currency ?? 'USD',
                ];
            }
        }

        return collect($results)->sortByDesc('frequency')->take(5)->values()->all();
    }

    private function analyzeSpendingPatterns($user)
    {
        $results = [];

        $recentTransactions = $user->transactions()
            ->where('type', 'expense')
            ->where('transaction_date', '>=', now()->subMonth())
            ->with('account')
            ->get();

        $currencies = $recentTransactions->pluck('account.currency')->unique()->filter();

        foreach ($currencies as $currency) {
            $currencyTxns = $recentTransactions->filter(fn ($t) => $t->account?->currency === $currency);

            $weekendSpending = $currencyTxns
                ->filter(fn ($t) => in_array($t->transaction_date->dayOfWeek, [0, 6]))
                ->sum('amount');

            $weekdaySpending = $currencyTxns
                ->filter(fn ($t) => ! in_array($t->transaction_date->dayOfWeek, [0, 6]))
                ->sum('amount');

            if ($weekendSpending > 0 || $weekdaySpending > 0) {
                $results[] = [
                    'type' => 'weekend_vs_weekday',
                    'weekend' => $weekendSpending,
                    'weekday' => $weekdaySpending,
                    'currency' => $currency,
                ];
            }

            $avgTransaction = $currencyTxns->avg('amount');
            if ($avgTransaction > 0) {
                $results[] = [
                    'type' => 'average_transaction',
                    'amount' => round($avgTransaction, 2),
                    'currency' => $currency,
                ];
            }
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
                $results[] = [
                    'category' => $budget->category->name,
                    'budgeted' => $budget->amount,
                    'spent' => $spent,
                    'overspend' => $spent - $budget->amount,
                    'currency' => $budget->currency,
                ];
            }
        }

        $smallPurchases = $user->transactions()
            ->where('type', 'expense')
            ->where('transaction_date', '>=', now()->subMonth())
            ->with('account')
            ->get()
            ->filter(fn ($t) => $t->amount < 20);

        foreach ($smallPurchases->groupBy('account.currency') as $currency => $currencyTxns) {
            if ($currencyTxns->count() > 10) {
                $results[] = [
                    'type' => 'small_purchases',
                    'count' => $currencyTxns->count(),
                    'total' => $currencyTxns->sum('amount'),
                    'currency' => $currency,
                ];
            }
        }

        return $results;
    }

}
