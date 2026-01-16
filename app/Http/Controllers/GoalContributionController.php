<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\GoalContribution;
use Illuminate\Http\Request;

class GoalContributionController extends Controller
{
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

        // Update goal current amount
        $goal->increment('current_amount', $validated['amount']);

        // Check if goal is completed
        if ($goal->current_amount >= $goal->target_amount) {
            $goal->update(['is_completed' => true]);
        }

        return redirect()->route('goals.index')->with('success', 'Contribution added successfully');
    }
}
