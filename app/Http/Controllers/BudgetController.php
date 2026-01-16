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
                    'amount' => $budget->amount, // Accessor divides by 100
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

        return Inertia::render('budgets/CreateSimple', [
            'categories' => $categories
        ]);
    }

    public function store(Request $request)
    {
        \Log::info('Budget store - Raw request:', $request->all());
        
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'amount' => 'required|numeric|min:0.01',
            'period_type' => 'required|string|in:monthly,yearly',
            'period_year' => 'nullable|integer|min:2020',
            'period_month' => 'nullable|integer|min:1|max:12'
        ]);

        // Default to current year/month if not provided
        if (!isset($validated['period_year'])) {
            $validated['period_year'] = now()->year;
        }
        
        if ($validated['period_type'] === 'monthly' && !isset($validated['period_month'])) {
            $validated['period_month'] = now()->month;
        }

        \Log::info('Budget store - After defaults:', $validated);

        // Check if budget already exists for this category and period
        $exists = auth()->user()->budgets()
            ->where('category_id', $validated['category_id'])
            ->where('period_type', $validated['period_type'])
            ->where('period_year', $validated['period_year'])
            ->where('period_month', $validated['period_month'] ?? null)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'category_id' => 'A budget already exists for this category and period.'
            ]);
        }

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

        // Don't multiply here - the mutator handles it
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
