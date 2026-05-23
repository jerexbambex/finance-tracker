<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Insights\InsightsRangeRequest;
use App\Http\Resources\Api\CategoryResource;
use App\Http\Resources\Api\GoalResource;
use App\Http\Resources\Api\TransactionResource;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class InsightsController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        $startOfMonth = now()->startOfMonth()->toDateString();
        $endOfMonth = now()->endOfMonth()->toDateString();

        $monthSums = Transaction::query()
            ->where('user_id', $user->id)
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->groupBy('type')
            ->selectRaw('type, SUM(amount) as cents')
            ->pluck('cents', 'type');

        $income = (int) ($monthSums['income'] ?? 0) / 100;
        $expense = (int) ($monthSums['expense'] ?? 0) / 100;

        $recent = Transaction::query()
            ->where('user_id', $user->id)
            ->orderByDesc('transaction_date')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $activeGoals = $user->goals()
            ->where('is_active', true)
            ->where('is_completed', false)
            ->orderBy('created_at')
            ->get();

        return response()->apiSuccess([
            'month' => now()->format('Y-m'),
            'income' => (float) $income,
            'expense' => (float) $expense,
            'net' => (float) ($income - $expense),
            'savingsRate' => $income > 0 ? round(($income - $expense) / $income, 4) : 0.0,
            'recentTransactions' => TransactionResource::collection($recent)->resolve(),
            'activeGoals' => GoalResource::collection($activeGoals)->resolve(),
        ]);
    }

    public function spendingBreakdown(InsightsRangeRequest $request): JsonResponse
    {
        $user = $request->user();
        [$start, $end] = $this->resolveRange($request);

        $rows = Transaction::query()
            ->where('transactions.user_id', $user->id)
            ->where('transactions.type', 'expense')
            ->whereBetween('transaction_date', [$start, $end])
            ->leftJoin('categories', 'categories.id', '=', 'transactions.category_id')
            ->groupBy('transactions.category_id', 'categories.name', 'categories.color', 'categories.budget_category')
            ->selectRaw('transactions.category_id, categories.name, categories.color, categories.budget_category, SUM(transactions.amount) as cents')
            ->orderByDesc(DB::raw('SUM(transactions.amount)'))
            ->get();

        $total = (int) $rows->sum('cents');

        $items = $rows->map(function ($row) use ($total) {
            $cents = (int) $row->cents;

            return [
                'categoryId' => $row->category_id,
                'name' => $row->name ?? 'Uncategorized',
                'color' => CategoryResource::colorToInt($row->color),
                'budgetCategory' => $row->budget_category,
                'amount' => (float) ($cents / 100),
                'share' => $total > 0 ? round($cents / $total, 4) : 0.0,
            ];
        })->all();

        return response()->apiSuccess([
            'startDate' => $start,
            'endDate' => $end,
            'total' => (float) ($total / 100),
            'items' => $items,
        ]);
    }

    public function trends(InsightsRangeRequest $request): JsonResponse
    {
        $user = $request->user();
        $months = (int) ($request->validated('months') ?? 6);

        $series = collect();
        for ($i = $months - 1; $i >= 0; $i--) {
            $month = now()->subMonths($i)->startOfMonth();
            $start = $month->toDateString();
            $end = $month->copy()->endOfMonth()->toDateString();

            $sums = Transaction::query()
                ->where('user_id', $user->id)
                ->whereBetween('transaction_date', [$start, $end])
                ->groupBy('type')
                ->selectRaw('type, SUM(amount) as cents')
                ->pluck('cents', 'type');

            $income = (int) ($sums['income'] ?? 0) / 100;
            $expense = (int) ($sums['expense'] ?? 0) / 100;

            $series->push([
                'month' => $month->format('Y-m'),
                'label' => $month->format('M'),
                'income' => (float) $income,
                'expense' => (float) $expense,
                'net' => (float) ($income - $expense),
                'savingsRate' => $income > 0 ? round(($income - $expense) / $income, 4) : 0.0,
            ]);
        }

        return response()->apiSuccess([
            'months' => $months,
            'series' => $series->all(),
        ]);
    }

    public function aiSummary(Request $request): JsonResponse
    {
        $user = $request->user();
        $insights = $this->generateTextInsights($user);

        return response()->apiSuccess([
            'generatedAt' => now()->toIso8601String(),
            'insights' => $insights,
        ]);
    }

    /**
     * Heuristic, deterministic text insights — no LLM call. These mirror
     * the kind of summary the dashboard renders on the web side, but as
     * a JSON list of strings the mobile client can render verbatim.
     *
     * @return list<string>
     */
    private function generateTextInsights(User $user): array
    {
        $now = now();
        $thisStart = $now->copy()->startOfMonth()->toDateString();
        $thisEnd = $now->copy()->endOfMonth()->toDateString();
        $lastStart = $now->copy()->subMonth()->startOfMonth()->toDateString();
        $lastEnd = $now->copy()->subMonth()->endOfMonth()->toDateString();

        $thisSums = $this->monthSums($user, $thisStart, $thisEnd);
        $lastSums = $this->monthSums($user, $lastStart, $lastEnd);

        $out = [];

        if ($thisSums['income'] > 0) {
            $rate = round(($thisSums['income'] - $thisSums['expense']) / $thisSums['income'] * 100, 1);
            $out[] = "Your savings rate this month is {$rate}%.";
        }

        if ($lastSums['expense'] > 0) {
            $delta = $thisSums['expense'] - $lastSums['expense'];
            $sign = $delta >= 0 ? 'more' : 'less';
            $abs = number_format(abs($delta), 2);
            $out[] = "You've spent ${abs} {$sign} than last month so far.";
        }

        if ($thisSums['expense'] === 0.0 && $thisSums['income'] === 0.0) {
            $out[] = 'No transactions yet this month — log an expense to start tracking.';
        }

        // Top category this month.
        $top = Transaction::query()
            ->where('transactions.user_id', $user->id)
            ->where('transactions.type', 'expense')
            ->whereBetween('transactions.transaction_date', [$thisStart, $thisEnd])
            ->leftJoin('categories', 'categories.id', '=', 'transactions.category_id')
            ->groupBy('categories.name')
            ->selectRaw('categories.name as name, SUM(transactions.amount) as cents')
            ->orderByDesc(DB::raw('SUM(transactions.amount)'))
            ->limit(1)
            ->first();

        if ($top !== null && (int) $top->cents > 0) {
            $name = $top->name ?? 'Uncategorized';
            $amt = number_format((int) $top->cents / 100, 2);
            $out[] = "Your top expense category this month is {$name} (${amt}).";
        }

        return $out;
    }

    /**
     * @return array{income: float, expense: float}
     */
    private function monthSums(User $user, string $start, string $end): array
    {
        $sums = Transaction::query()
            ->where('user_id', $user->id)
            ->whereBetween('transaction_date', [$start, $end])
            ->groupBy('type')
            ->selectRaw('type, SUM(amount) as cents')
            ->pluck('cents', 'type');

        return [
            'income' => (float) ((int) ($sums['income'] ?? 0) / 100),
            'expense' => (float) ((int) ($sums['expense'] ?? 0) / 100),
        ];
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function resolveRange(InsightsRangeRequest $request): array
    {
        $data = $request->validated();

        $start = isset($data['startDate'])
            ? Carbon::parse($data['startDate'])->toDateString()
            : now()->startOfMonth()->toDateString();
        $end = isset($data['endDate'])
            ? Carbon::parse($data['endDate'])->toDateString()
            : now()->endOfMonth()->toDateString();

        return [$start, $end];
    }
}
