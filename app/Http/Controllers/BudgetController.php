<?php

namespace App\Http\Controllers;

use App\Currency;
use App\Http\Controllers\Concerns\ScopesOwnership;
use App\Models\Budget;
use App\Models\Category;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BudgetController extends Controller
{
    use AuthorizesRequests, ScopesOwnership;

    public function index(Request $request)
    {
        $view = $request->input('view') === 'period' ? 'period' : 'all';
        $currentYear = (int) $request->input('year', now()->year);
        $currentMonth = (int) $request->input('month', now()->month);

        $query = auth()->user()->budgets()
            ->with('category')
            ->orderByDesc('period_year')
            ->orderByRaw('period_month IS NULL') // yearly (null month) after monthly within a year
            ->orderByDesc('period_month');

        // Only narrow to a single month/year when explicitly browsing by period
        if ($view === 'period') {
            $query->where('period_year', $currentYear)
                ->where(function ($q) use ($currentMonth) {
                    $q->where('period_type', 'yearly')
                        ->orWhere(function ($q2) use ($currentMonth) {
                            $q2->where('period_type', 'monthly')
                                ->where('period_month', $currentMonth);
                        });
                });
        }

        $budgets = $query->get()->map(function ($budget) {
            // Compute spend once; derive percentage from it (avoids a second pass of queries)
            $spent = $budget->getSpentAmount();

            return [
                'id' => $budget->id,
                'category' => $budget->category,
                'amount' => $budget->amount,
                'currency' => $budget->currency,
                'period_type' => $budget->period_type,
                'period_year' => $budget->period_year,
                'period_month' => $budget->period_month,
                'spent' => $spent,
                'percentage' => $budget->amount > 0 ? ($spent / $budget->amount) * 100 : 0,
            ];
        });

        $categories = Category::where(function ($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('type', 'expense')->where('is_active', true)->get();

        // Years the user actually has budgets for (+ current and viewed year), newest first
        $availableYears = auth()->user()->budgets()
            ->distinct()
            ->pluck('period_year')
            ->push(now()->year)
            ->push($currentYear)
            ->unique()
            ->sortDesc()
            ->values();

        return Inertia::render('budgets/Index', [
            'budgets' => $budgets,
            'categories' => $categories,
            'view' => $view,
            'availableYears' => $availableYears,
            'currentPeriod' => [
                'year' => $currentYear,
                'month' => $currentMonth,
            ],
            'currencies' => collect(Currency::cases())->map(fn ($c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ]),
        ]);
    }

    public function create()
    {
        $categories = Category::where(function ($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('type', 'expense')->where('is_active', true)->get();

        return Inertia::render('budgets/CreateSimple', [
            'categories' => $categories,
            'currencies' => collect(Currency::cases())->map(fn ($c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ]),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => ['required', $this->ownedCategoryExists()],
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
            'period_type' => 'required|string|in:monthly,yearly',
            'period_year' => 'nullable|integer|min:2020',
            'period_month' => 'nullable|integer|min:1|max:12',
        ]);

        // Default to current year/month if not provided
        if (! isset($validated['period_year'])) {
            $validated['period_year'] = now()->year;
        }

        if ($validated['period_type'] === 'monthly' && ! isset($validated['period_month'])) {
            $validated['period_month'] = now()->month;
        }

        // Check if budget already exists for this category and period
        $exists = auth()->user()->budgets()
            ->where('category_id', $validated['category_id'])
            ->where('period_type', $validated['period_type'])
            ->where('period_year', $validated['period_year'])
            ->where('period_month', $validated['period_month'] ?? null)
            ->exists();

        if ($exists) {
            return back()->withErrors([
                'category_id' => 'A budget already exists for this category and period.',
            ]);
        }

        auth()->user()->budgets()->create($validated);

        return redirect()->route('budgets.index');
    }

    public function edit(Budget $budget)
    {
        $this->authorize('update', $budget);

        $categories = Category::where(function ($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('type', 'expense')->where('is_active', true)->get();

        return Inertia::render('budgets/Edit', [
            'budget' => $budget,
            'categories' => $categories,
            'currencies' => collect(Currency::cases())->map(fn ($c) => [
                'value' => $c->value,
                'label' => $c->label(),
            ]),
        ]);
    }

    public function update(Request $request, Budget $budget)
    {
        $this->authorize('update', $budget);

        $validated = $request->validate([
            'category_id' => ['required', $this->ownedCategoryExists()],
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
            'period_type' => 'required|string|in:monthly,yearly',
            'period_year' => 'required|integer|min:2020',
            'period_month' => 'required_if:period_type,monthly|nullable|integer|min:1|max:12',
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
