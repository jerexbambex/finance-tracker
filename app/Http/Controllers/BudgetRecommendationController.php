<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ScopesOwnership;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetRecommendationController extends Controller
{
    use ScopesOwnership;

    public function index()
    {
        $user = auth()->user();

        // One query: 3-month spending per category (with currency)
        $spendingRows = $user->transactions()
            ->where('type', 'expense')
            ->where('transaction_date', '>=', now()->subMonths(2)->startOfMonth())
            ->selectRaw('category_id, currency, YEAR(transaction_date) as yr, MONTH(transaction_date) as mo, SUM(amount) as total')
            ->groupBy('category_id', 'currency', 'yr', 'mo')
            ->get()
            ->groupBy('category_id');

        // One query: already-budgeted category IDs this month
        $budgetedIds = $user->budgets()
            ->where('period_type', 'monthly')
            ->where('period_year', now()->year)
            ->where('period_month', now()->month)
            ->pluck('category_id')
            ->flip();

        $recommendations = Category::where(function ($q) use ($user) {
            $q->whereNull('user_id')->orWhere('user_id', $user->id);
        })
            ->where('is_active', true)
            ->where('type', 'expense')
            ->get()
            ->map(function ($category) use ($spendingRows, $budgetedIds) {
                if ($budgetedIds->has($category->id)) {
                    return null;
                }

                $categoryRows = $spendingRows->get($category->id, collect());
                if ($categoryRows->isEmpty()) {
                    return null;
                }

                $last3Months = collect();
                for ($i = 0; $i < 3; $i++) {
                    $date = now()->subMonths($i);
                    $monthTotal = $categoryRows
                        ->filter(fn ($r) => (int) $r->yr === $date->year && (int) $r->mo === $date->month)
                        ->sum('total');
                    $last3Months->push($monthTotal / 100);
                }

                $avgSpending = $last3Months->avg();
                if ($avgSpending <= 0) {
                    return null;
                }

                $currency = $categoryRows->sortByDesc('yr')->sortByDesc('mo')->first()->currency ?? 'USD';

                return [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'category_color' => $category->color,
                    'avg_spending' => $avgSpending,
                    'recommended_amount' => round($avgSpending * 1.1, 2),
                    'currency' => $currency,
                    'has_budget' => false,
                ];
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
            'category_id' => ['required', $this->ownedCategoryExists()],
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
        ]);

        auth()->user()->budgets()->create([
            'category_id' => $validated['category_id'],
            'amount' => $validated['amount'],
            'currency' => $validated['currency'],
            'period_type' => 'monthly',
            'period_year' => now()->year,
            'period_month' => now()->month,
        ]);

        return redirect()->back()->with('success', 'Budget created from recommendation');
    }
}
