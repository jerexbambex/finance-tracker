<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\GoalContribution;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

        // Atomic: contribution insert + the observer's current_amount/is_completed recompute
        DB::transaction(fn () => GoalContribution::create([
            'goal_id' => $goal->id,
            'user_id' => auth()->id(),
            'amount' => $validated['amount'],
            'note' => $validated['note'],
            'contribution_date' => $validated['contribution_date'],
        ]));

        return redirect()->route('goals.index')->with('success', 'Contribution added successfully');
    }
}
