<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class GoalController extends Controller
{
    use AuthorizesRequests;
    public function index()
    {
        $goals = auth()->user()->goals()
            ->where('is_active', true)
            ->get()
            ->map(function($goal) {
                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'description' => $goal->description,
                    'target_amount' => $goal->target_amount,
                    'current_amount' => $goal->current_amount,
                    'target_date' => $goal->target_date,
                    'category' => $goal->category,
                    'is_completed' => $goal->is_completed,
                    'percentage' => $goal->getPercentageComplete(),
                ];
            });

        return Inertia::render('goals/Index', [
            'goals' => $goals
        ]);
    }

    public function create()
    {
        return Inertia::render('goals/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'required|numeric|min:0.01',
            'current_amount' => 'nullable|numeric|min:0',
            'target_date' => 'nullable|date',
            'category' => 'nullable|string|max:100',
        ]);

        auth()->user()->goals()->create($validated);

        return redirect()->route('goals.index');
    }

    public function edit(Goal $goal)
    {
        $this->authorize('update', $goal);

        return Inertia::render('goals/Edit', [
            'goal' => $goal
        ]);
    }

    public function update(Request $request, Goal $goal)
    {
        $this->authorize('update', $goal);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'required|numeric|min:0.01',
            'current_amount' => 'nullable|numeric|min:0',
            'target_date' => 'nullable|date',
            'category' => 'nullable|string|max:100',
        ]);

        $goal->update($validated);

        if ($goal->current_amount >= $goal->target_amount) {
            $goal->update(['is_completed' => true]);
        }

        return redirect()->route('goals.index');
    }

    public function destroy(Goal $goal)
    {
        $this->authorize('delete', $goal);
        
        $goal->delete();

        return redirect()->route('goals.index');
    }
}
