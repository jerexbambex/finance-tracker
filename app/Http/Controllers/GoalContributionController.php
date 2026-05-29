<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\GoalContribution;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class GoalContributionController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, Goal $goal)
    {
        $this->authorize('update', $goal);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'note' => 'nullable|string|max:255',
            'contribution_date' => 'required|date',
        ]);

        GoalContribution::create([
            'goal_id' => $goal->id,
            'user_id' => auth()->id(),
            'amount' => $validated['amount'],
            'note' => $validated['note'],
            'contribution_date' => $validated['contribution_date'],
        ]);
        // GoalContributionObserver::created() recomputes current_amount and is_completed

        return redirect()->route('goals.index')->with('success', 'Contribution added successfully');
    }
}
