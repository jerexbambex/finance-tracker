<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\GoalContribution;
use App\Notifications\GoalAchievedNotification;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class GoalController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $goals = auth()->user()->goals()
            ->where('is_active', true)
            ->get()
            ->map(function ($goal) {
                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'description' => $goal->description,
                    'target_amount' => $goal->target_amount,
                    'current_amount' => $goal->current_amount,
                    'currency' => $goal->currency ?? 'USD',
                    'target_date' => $goal->target_date,
                    'category' => $goal->category,
                    'is_completed' => $goal->is_completed,
                    'percentage' => $goal->getPercentageComplete(),
                ];
            });

        return Inertia::render('goals/Index', [
            'goals' => $goals,
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

        // current_amount is derived from contributions by GoalContributionObserver.
        // A starting amount is materialized as the goal's first contribution so the
        // figure always reconstructs from the contribution ledger.
        $startingAmount = (float) ($validated['current_amount'] ?? 0);
        unset($validated['current_amount']);

        DB::transaction(function () use ($validated, $startingAmount) {
            $goal = auth()->user()->goals()->create($validated);

            if ($startingAmount > 0) {
                GoalContribution::create([
                    'goal_id' => $goal->id,
                    'user_id' => auth()->id(),
                    'amount' => $startingAmount,
                    'note' => 'Starting amount',
                    'contribution_date' => now(),
                ]);
            }
        });

        return redirect()->route('goals.index');
    }

    public function edit(Goal $goal)
    {
        $this->authorize('update', $goal);

        return Inertia::render('goals/Edit', [
            'goal' => $goal,
        ]);
    }

    public function update(Request $request, Goal $goal)
    {
        $this->authorize('update', $goal);

        // current_amount is NOT editable here — it is derived from contributions.
        // To change progress, add a contribution.
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_amount' => 'required|numeric|min:0.01',
            'target_date' => 'nullable|date',
            'category' => 'nullable|string|max:100',
        ]);

        $wasCompleted = $goal->is_completed;
        $goal->update($validated);

        // Changing the target can flip completion; re-evaluate against derived progress.
        $nowCompleted = $goal->fresh()->current_amount >= $goal->target_amount;
        if ($nowCompleted !== $wasCompleted) {
            $goal->update(['is_completed' => $nowCompleted]);
        }
        if (! $wasCompleted && $nowCompleted) {
            auth()->user()->notify(new GoalAchievedNotification($goal));
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
