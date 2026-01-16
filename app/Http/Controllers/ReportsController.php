<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Get date range from request or default to current month
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->endOfMonth()->toDateString());
        
        // Get spending by category for date range
        $categorySpending = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->with('category')
            ->get()
            ->groupBy('category.name')
            ->map(function ($transactions, $category) {
                $total = $transactions->sum('amount');
                return [
                    'category' => $category ?? 'Uncategorized',
                    'amount' => $total,
                    'count' => $transactions->count(),
                ];
            })
            ->values();
        
        $totalExpense = $categorySpending->sum('amount');
        
        $categorySpending = $categorySpending->map(function ($item) use ($totalExpense) {
            $item['percentage'] = $totalExpense > 0 ? ($item['amount'] / $totalExpense) * 100 : 0;
            return $item;
        })->sortByDesc('amount')->values();
        
        // Monthly trends (last 12 months)
        $monthlyTrends = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();
            
            $income = $user->transactions()
                ->where('type', 'income')
                ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
                ->sum(\DB::raw('amount')) / 100;
                
            $expense = $user->transactions()
                ->where('type', 'expense')
                ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
                ->sum(\DB::raw('amount')) / 100;
            
            $monthlyTrends->push([
                'month' => $date->format('M Y'),
                'income' => $income,
                'expense' => $expense,
                'net' => $income - $expense,
            ]);
        }
        
        // Total income and expenses for date range
        $totalIncome = $user->transactions()
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum(\DB::raw('amount')) / 100;
            
        $totalExpense = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum(\DB::raw('amount')) / 100;
        
        // Average daily spending
        $days = now()->parse($startDate)->diffInDays(now()->parse($endDate)) + 1;
        $avgDailySpending = $days > 0 ? $totalExpense / $days : 0;
        
        // Spending by account
        $accountSpending = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->with('account')
            ->get()
            ->groupBy('account.name')
            ->map(function ($transactions, $account) {
                return [
                    'account' => $account,
                    'amount' => $transactions->sum('amount'),
                ];
            })
            ->sortByDesc('amount')
            ->values();
        
        return Inertia::render('reports/Index', [
            'categorySpending' => $categorySpending,
            'monthlyTrends' => $monthlyTrends,
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'topCategories' => $categorySpending->take(5),
            'avgDailySpending' => $avgDailySpending,
            'accountSpending' => $accountSpending,
            'startDate' => $startDate,
            'endDate' => $endDate,
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
