<?php

namespace App\Observers;

use App\Models\GoalContribution;
use Illuminate\Support\Facades\DB;

class GoalContributionObserver
{
    public function created(GoalContribution $contribution): void
    {
        $this->sync($contribution->goal_id);
    }

    public function updated(GoalContribution $contribution): void
    {
        $this->sync($contribution->goal_id);
    }

    public function deleted(GoalContribution $contribution): void
    {
        $this->sync($contribution->goal_id);
    }

    private function sync(string $goalId): void
    {
        $sumCents = GoalContribution::where('goal_id', $goalId)->sum('amount');

        $goal = DB::table('goals')->where('id', $goalId)->first();
        if (! $goal) {
            return;
        }

        DB::table('goals')->where('id', $goalId)->update([
            'current_amount' => $sumCents,
            'is_completed' => $goal->target_amount > 0 && $sumCents >= $goal->target_amount,
        ]);
    }
}
