<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $categories = Category::where(function ($q) {
            $q->whereNull('user_id')->orWhere('user_id', auth()->id());
        })->where('is_active', true)->get()->groupBy('type');

        return Inertia::render('categories/Index', [
            'incomeCategories' => $categories->get('income', collect()),
            'expenseCategories' => $categories->get('expense', collect()),
        ]);
    }

    public function create()
    {
        return Inertia::render('categories/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:income,expense',
            'color' => 'nullable|string|max:7',
        ]);

        auth()->user()->categories()->create($validated);

        return redirect()->route('categories.index');
    }

    public function edit(Category $category)
    {
        $this->authorize('update', $category);

        return Inertia::render('categories/Edit', [
            'category' => $category,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $this->authorize('update', $category);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:income,expense',
            'color' => 'nullable|string|max:7',
        ]);

        $category->update($validated);

        return redirect()->route('categories.index');
    }

    public function destroy(Category $category)
    {
        $this->authorize('delete', $category);

        $category->update(['is_active' => false]);

        return redirect()->route('categories.index');
    }
}
