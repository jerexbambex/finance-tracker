<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportsController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get spending by category
        $categorySpending = $user->transactions()
            ->where('type', 'expense')
            ->with('category')
            ->get()
            ->groupBy('category.name')
            ->map(function ($transactions, $category) {
                $total = $transactions->sum('amount'); // Accessor already converts to dollars
                return [
                    'category' => $category ?? 'Uncategorized',
                    'amount' => $total,
                ];
            })
            ->values();
        
        $totalExpense = $categorySpending->sum('amount');
        
        $categorySpending = $categorySpending->map(function ($item) use ($totalExpense) {
            $item['percentage'] = $totalExpense > 0 ? ($item['amount'] / $totalExpense) * 100 : 0;
            return $item;
        })->sortByDesc('amount')->values();
        
        // Monthly trends (last 6 months)
        $monthlyTrends = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $startOfMonth = $date->copy()->startOfMonth();
            $endOfMonth = $date->copy()->endOfMonth();
            
            $income = $user->transactions()
                ->where('type', 'income')
                ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
                ->sum('amount') / 100;
                
            $expense = $user->transactions()
                ->where('type', 'expense')
                ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
                ->sum('amount') / 100;
            
            $monthlyTrends->push([
                'month' => $date->format('M Y'),
                'income' => $income,
                'expense' => $expense,
                'net' => $income - $expense,
            ]);
        }
        
        // Total income and expenses
        $totalIncome = $user->transactions()
            ->where('type', 'income')
            ->sum('amount') / 100;
            
        $totalExpense = $user->transactions()
            ->where('type', 'expense')
            ->sum('amount') / 100;
        
        return Inertia::render('reports/Index', [
            'categorySpending' => $categorySpending,
            'monthlyTrends' => $monthlyTrends,
            'totalIncome' => $totalIncome,
            'totalExpense' => $totalExpense,
            'topCategories' => $categorySpending->take(5),
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
