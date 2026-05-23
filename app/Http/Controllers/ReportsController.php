<?php

namespace App\Http\Controllers;

use App\Currency;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());

        // Load expense transactions once for reuse
        $expenseTransactions = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->with(['category', 'account'])
            ->get();

        // Category spending grouped by currency then category
        $categorySpending = collect();
        foreach ($expenseTransactions->groupBy('account.currency') as $currency => $currencyTxns) {
            $currencyTotal = $currencyTxns->sum('amount');
            foreach ($currencyTxns->groupBy('category.name') as $catName => $catTxns) {
                $amount = $catTxns->sum('amount');
                $categorySpending->push([
                    'category' => $catName ?: 'Uncategorized',
                    'amount' => $amount,
                    'count' => $catTxns->count(),
                    'percentage' => $currencyTotal > 0 ? ($amount / $currencyTotal) * 100 : 0,
                    'currency' => $currency,
                ]);
            }
        }
        $categorySpending = $categorySpending->sortByDesc('amount')->values();

        // Monthly trends (last 12 months) grouped by currency
        $monthlyTrends = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $rows = $user->transactions()
                ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
                ->whereBetween('transactions.transaction_date', [$date->copy()->startOfMonth(), $date->copy()->endOfMonth()])
                ->whereIn('transactions.type', ['income', 'expense'])
                ->selectRaw('transactions.type, accounts.currency, SUM(transactions.amount) as total')
                ->groupBy('transactions.type', 'accounts.currency')
                ->get();

            $income = [];
            $expense = [];
            foreach ($rows as $row) {
                if ($row->type === 'income') {
                    $income[$row->currency] = ($income[$row->currency] ?? 0) + $row->total / 100;
                } else {
                    $expense[$row->currency] = ($expense[$row->currency] ?? 0) + $row->total / 100;
                }
            }

            $net = [];
            foreach (array_unique(array_merge(array_keys($income), array_keys($expense))) as $cur) {
                $net[$cur] = ($income[$cur] ?? 0) - ($expense[$cur] ?? 0);
            }

            $monthlyTrends->push([
                'month' => $date->format('M Y'),
                'income' => $income,
                'expense' => $expense,
                'net' => $net,
            ]);
        }

        // Totals by currency for the selected date range
        $totalIncomeByCurrency = $user->transactions()
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->selectRaw('accounts.currency, SUM(transactions.amount) as total')
            ->groupBy('accounts.currency')
            ->get()
            ->mapWithKeys(fn ($r) => [$r->currency => $r->total / 100]);

        $totalExpenseByCurrency = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->selectRaw('accounts.currency, SUM(transactions.amount) as total')
            ->groupBy('accounts.currency')
            ->get()
            ->mapWithKeys(fn ($r) => [$r->currency => $r->total / 100]);

        $days = max(1, now()->parse($startDate)->diffInDays(now()->parse($endDate)) + 1);
        $avgDailySpendingByCurrency = $totalExpenseByCurrency->map(fn ($total) => $total / $days);

        // Spending by account (each account has one currency)
        $accountSpending = $expenseTransactions
            ->groupBy('account_id')
            ->map(function ($txns) {
                $account = $txns->first()->account;

                return [
                    'account' => $account?->name ?? 'Unknown',
                    'amount' => $txns->sum('amount'),
                    'currency' => $account?->currency ?? 'USD',
                ];
            })
            ->sortByDesc('amount')
            ->values();

        // Year-over-year comparison by currency
        $currentYear = now()->year;
        $previousYear = $currentYear - 1;
        $yoyComparison = collect();

        for ($month = 1; $month <= 12; $month++) {
            $currentAmounts = $user->transactions()
                ->where('type', 'expense')
                ->whereYear('transaction_date', $currentYear)
                ->whereMonth('transaction_date', $month)
                ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
                ->selectRaw('accounts.currency, SUM(transactions.amount) as total')
                ->groupBy('accounts.currency')
                ->get()
                ->mapWithKeys(fn ($r) => [$r->currency => $r->total / 100]);

            $previousAmounts = $user->transactions()
                ->where('type', 'expense')
                ->whereYear('transaction_date', $previousYear)
                ->whereMonth('transaction_date', $month)
                ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
                ->selectRaw('accounts.currency, SUM(transactions.amount) as total')
                ->groupBy('accounts.currency')
                ->get()
                ->mapWithKeys(fn ($r) => [$r->currency => $r->total / 100]);

            $change = collect($currentAmounts->keys())->merge($previousAmounts->keys())->unique()
                ->mapWithKeys(function ($cur) use ($currentAmounts, $previousAmounts) {
                    $curr = $currentAmounts[$cur] ?? 0;
                    $prev = $previousAmounts[$cur] ?? 0;

                    return [$cur => $prev > 0 ? (($curr - $prev) / $prev) * 100 : 0];
                })->all();

            $yoyComparison->push([
                'month' => date('M', mktime(0, 0, 0, $month, 1)),
                'currentYear' => $currentAmounts->all(),
                'previousYear' => $previousAmounts->all(),
                'change' => $change,
            ]);
        }

        return Inertia::render('reports/Index', [
            'categorySpending' => $categorySpending,
            'monthlyTrends' => $monthlyTrends,
            'totalIncomeByCurrency' => $totalIncomeByCurrency,
            'totalExpenseByCurrency' => $totalExpenseByCurrency,
            'avgDailySpendingByCurrency' => $avgDailySpendingByCurrency,
            'accountSpending' => $accountSpending,
            'yoyComparison' => $yoyComparison,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'currencies' => collect(Currency::cases())->mapWithKeys(fn ($c) => [
                $c->value => ['symbol' => $c->symbol(), 'label' => $c->label()],
            ]),
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        //
    }

    public function show(string $id)
    {
        //
    }

    public function edit(string $id)
    {
        //
    }

    public function update(Request $request, string $id)
    {
        //
    }

    public function destroy(string $id)
    {
        //
    }
}
