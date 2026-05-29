<?php

namespace App\Http\Controllers;

use App\Currency;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = auth()->user();

        $accounts = $user->accounts()->where('is_active', true)->get();
        $balancesByCurrency = $accounts->groupBy('currency')->map(fn ($accts) => $accts->sum('balance'));

        $recentTransactions = $user->transactions()
            ->with(['account', 'category'])
            ->latest('transaction_date')
            ->take(10)
            ->get();

        $startOfMonth = now()->startOfMonth();

        $incomeByCurrency = $user->transactions()
            ->where('transactions.type', 'income')
            ->where('transaction_date', '>=', $startOfMonth)
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->selectRaw('accounts.currency, SUM(transactions.amount) as total')
            ->groupBy('accounts.currency')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->currency => $item->total / 100]);

        $expensesByCurrency = $user->transactions()
            ->where('transactions.type', 'expense')
            ->where('transaction_date', '>=', $startOfMonth)
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->selectRaw('accounts.currency, SUM(transactions.amount) as total')
            ->groupBy('accounts.currency')
            ->get()
            ->mapWithKeys(fn ($item) => [$item->currency => $item->total / 100]);

        $categorySpending = $user->transactions()
            ->selectRaw('transactions.category_id, accounts.currency, SUM(transactions.amount) as total')
            ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
            ->with('category')
            ->where('transactions.type', 'expense')
            ->where('transactions.transaction_date', '>=', $startOfMonth)
            ->whereNotNull('transactions.category_id')
            ->where('transactions.category_id', '!=', '')
            ->whereHas('category', fn ($q) => $q->where('type', 'expense'))
            ->groupBy('transactions.category_id', 'accounts.currency')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(fn ($t) => [
                'name' => $t->category?->name ?? 'Uncategorized',
                'amount' => $t->total / 100,
                'currency' => $t->currency,
                'color' => $t->category?->color ?? '#6b7280',
            ]);

        $monthlyTrend = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);

            $rows = $user->transactions()
                ->join('accounts', 'transactions.account_id', '=', 'accounts.id')
                ->whereYear('transactions.transaction_date', $date->year)
                ->whereMonth('transactions.transaction_date', $date->month)
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

            $monthlyTrend->push([
                'month' => $date->format('M'),
                'income' => $income,
                'expense' => $expense,
            ]);
        }

        $currentMonth = now()->month;
        $currentYear = now()->year;

        $budgets = $user->budgets()
            ->with('category')
            ->where('period_year', $currentYear)
            ->where(function ($q) use ($currentMonth) {
                $q->where('period_type', 'yearly')
                    ->orWhere(function ($q2) use ($currentMonth) {
                        $q2->where('period_type', 'monthly')
                            ->where('period_month', $currentMonth);
                    });
            })
            ->get()
            ->map(function ($budget) {
                $percentage = $budget->getPercentageUsed();

                return [
                    'id' => $budget->id,
                    'category' => $budget->category->name,
                    'percentage' => $percentage,
                    'amount' => $budget->amount,
                    'spent' => $budget->getSpentAmount(),
                    'status' => $percentage >= 100 ? 'exceeded' : ($percentage >= 80 ? 'warning' : 'ok'),
                    'currency' => $budget->currency,
                ];
            });

        $budgetAlerts = $budgets->filter(fn ($b) => $b['status'] !== 'ok');

        $goals = $user->goals()
            ->where('is_active', true)
            ->where('is_completed', false)
            ->get()
            ->map(fn ($goal) => [
                'name' => $goal->name,
                'percentage' => $goal->getPercentageComplete(),
            ]);

        $upcomingReminders = $user->reminders()
            ->with('category')
            ->where('is_completed', false)
            ->where('due_date', '<=', now()->addDays(7))
            ->orderBy('due_date')
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'accounts' => $accounts,
            'balancesByCurrency' => $balancesByCurrency,
            'recentTransactions' => $recentTransactions,
            'incomeByCurrency' => $incomeByCurrency,
            'expensesByCurrency' => $expensesByCurrency,
            'categorySpending' => $categorySpending,
            'monthlyTrend' => $monthlyTrend,
            'budgets' => $budgets,
            'budgetAlerts' => $budgetAlerts,
            'goals' => $goals,
            'upcomingReminders' => $upcomingReminders,
            'categories' => Category::where(function ($q) use ($user) {
                $q->whereNull('user_id')->orWhere('user_id', $user->id);
            })->where('is_active', true)->get(),
            'currencies' => collect(Currency::cases())->mapWithKeys(fn ($currency) => [
                $currency->value => ['symbol' => $currency->symbol(), 'label' => $currency->label()],
            ]),
        ]);
    }
}
