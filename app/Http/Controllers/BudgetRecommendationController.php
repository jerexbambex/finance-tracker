<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetRecommendationController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Get spending history for last 3 months by category
        $recommendations = Category::where(function ($q) use ($user) {
            $q->whereNull('user_id')->orWhere('user_id', $user->id);
        })
            ->where('is_active', true)
            ->where('type', 'expense')
            ->get()
            ->map(function ($category) use ($user) {
                // Calculate average spending for this category over last 3 months
                $last3Months = collect();

                for ($i = 0; $i < 3; $i++) {
                    $date = now()->subMonths($i);
                    $spent = $user->transactions()
                        ->where('type', 'expense')
                        ->where('category_id', $category->id)
                        ->whereYear('transaction_date', $date->year)
                        ->whereMonth('transaction_date', $date->month)
                        ->sum(\DB::raw('amount')) / 100;

                    $last3Months->push($spent);
                }

                $avgSpending = $last3Months->avg();

                // Check if user already has a budget for this category
                $existingBudget = $user->budgets()
                    ->where('category_id', $category->id)
                    ->where('period_type', 'monthly')
                    ->where('period_year', now()->year)
                    ->where('period_month', now()->month)
                    ->first();

                // Only recommend if there's spending and no existing budget
                if ($avgSpending > 0 && ! $existingBudget) {
                    // Recommend 10% buffer above average
                    $recommended = round($avgSpending * 1.1, 2);

                    return [
                        'category_id' => $category->id,
                        'category_name' => $category->name,
                        'category_color' => $category->color,
                        'avg_spending' => $avgSpending,
                        'recommended_amount' => $recommended,
                        'has_budget' => false,
                    ];
                }

                return null;
            })
            ->filter()
            ->sortByDesc('avg_spending')
            ->values();

        return Inertia::render('budgets/Recommendations', [
            'recommendations' => $recommendations,
        ]);
    }

    public function apply(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
        ]);

        auth()->user()->budgets()->create([
            'category_id' => $validated['category_id'],
            'amount' => $validated['amount'],
            'period_type' => 'monthly',
            'period_year' => now()->year,
            'period_month' => now()->month,
        ]);

        return redirect()->back()->with('success', 'Budget created from recommendation');
    }
}
