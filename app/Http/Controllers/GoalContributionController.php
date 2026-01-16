<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\GoalContribution;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

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

        // Update goal current amount (convert to cents for raw increment)
        $goal->increment('current_amount', $validated['amount'] * 100);

        // Check if goal is completed
        if ($goal->fresh()->current_amount >= $goal->target_amount) {
            $goal->update(['is_completed' => true]);
        }

        return redirect()->route('goals.index')->with('success', 'Contribution added successfully');
    }
}
