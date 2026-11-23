<?php

namespace App\Services;

use App\Models\Goal;
use App\Models\User;
use App\Notifications\GoalAchievedNotification;
use App\Notifications\GoalMilestoneNotification;

/**
 * Celebrates goal progress at 25%, 50%, 75% and 100%, each once.
 *
 * The highest milestone announced is stored on the goal. A big contribution
 * that jumps several milestones announces only the highest. If progress
 * drops (a contribution is removed) the stored milestone drops too, so
 * reaching it again is celebrated again.
 */
class GoalMilestones
{
    public const MILESTONES = [25, 50, 75, 100];

    public function check(User $user, Goal $goal): void
    {
        $goal->refresh();
        $reached = $this->reached($goal->getPercentageComplete());
        $notified = (int) $goal->milestone_notified;

        if ($reached > $notified) {
            $user->notify($reached === 100
                ? new GoalAchievedNotification($goal)
                : new GoalMilestoneNotification($goal, $reached));
        }

        if ($reached !== $notified) {
            $goal->forceFill(['milestone_notified' => $reached])->save();
        }
    }

    private function reached(float $percentage): int
    {
        $reached = 0;
        foreach (self::MILESTONES as $milestone) {
            if ($percentage >= $milestone) {
                $reached = $milestone;
            }
        }

        return $reached;
    }
}
