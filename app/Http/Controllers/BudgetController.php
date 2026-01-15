<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetController extends Controller
{
    use AuthorizesRequests;
    
    public function index(Request $request)
    {
        $currentYear = $request->input('year', now()->year);
        $currentMonth = $request->input('month', now()->month);

        $budgets = auth()->user()->budgets()
            ->with('category')
            ->where('period_year', $currentYear)
            ->where(function($q) use ($currentMonth) {
                $q->where('period_type', 'yearly')
                  ->orWhere(function($q2) use ($currentMonth) {
                      $q2->where('period_type', 'monthly')
                         ->where('period_month', $currentMonth);
                  });
            })
            ->get()
            ->map(function($budget) {
                return [
                    'id' => $budget->id,
                    'category' => $budget->category,
                    'amount' => $budget->amount,
                    'period_type' => $budget->period_type,
                    'spent' => $budget->getSpentAmount(),
                    'percentage' => $budget->getPercentageUsed(),
                ];
            });

        $categories = Category::where(function($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('type', 'expense')->where('is_active', true)->get();

        return Inertia::render('budgets/Index', [
            'budgets' => $budgets,
            'categories' => $categories,
            'currentPeriod' => [
                'year' => $currentYear,
                'month' => $currentMonth,
            ]
        ]);
    }

    public function create()
    {
        $categories = Category::where(function($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('type', 'expense')->where('is_active', true)->get();

        return Inertia::render('budgets/Create', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'period_type' => 'required|string|in:monthly,yearly',
            'period_year' => 'required|integer|min:2020',
            'period_month' => 'required_if:period_type,monthly|nullable|integer|min:1|max:12'
        ]);

        $validated['amount'] = $validated['amount'] * 100;

        auth()->user()->budgets()->create($validated);

        return redirect()->route('budgets.index');
    }

    public function edit(Budget $budget)
    {
        $this->authorize('update', $budget);

        $categories = Category::where(function($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('type', 'expense')->where('is_active', true)->get();

        return Inertia::render('budgets/Edit', [
            'budget' => $budget,
            'categories' => $categories
        ]);
    }

    public function update(Request $request, Budget $budget)
    {
        $this->authorize('update', $budget);

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'period_type' => 'required|string|in:monthly,yearly',
            'period_year' => 'required|integer|min:2020',
            'period_month' => 'required_if:period_type,monthly|nullable|integer|min:1|max:12'
        ]);

        $validated['amount'] = $validated['amount'] * 100;

        $budget->update($validated);

        return redirect()->route('budgets.index');
    }

    public function destroy(Budget $budget)
    {
        $this->authorize('delete', $budget);
        
        $budget->delete();

        return redirect()->route('budgets.index');
    }
}
