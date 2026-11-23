<?php

namespace App\Notifications;

use App\Currency;
use App\Models\Goal;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class GoalMilestoneNotification extends Notification
{
    use Queueable;

    public function __construct(public Goal $goal, public int $milestone) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $remaining = max(0, $this->goal->target_amount - $this->goal->current_amount);
        $message = "You're {$this->milestone}% of the way to {$this->goal->name} — {$this->money($remaining)} to go.";

        if ($monthly = $this->goal->suggestedMonthlyContribution()) {
            $message .= " Saving {$this->money($monthly)} a month gets you there by {$this->goal->target_date->format('M Y')}.";
        }

        return [
            'goal_id' => $this->goal->id,
            'name' => $this->goal->name,
            'milestone' => $this->milestone,
            'remaining' => $remaining,
            'message' => $message,
        ];
    }

    private function money(float $amount): string
    {
        $symbol = Currency::tryFrom((string) $this->goal->currency)?->symbol() ?? $this->goal->currency.' ';

        return $symbol.number_format($amount, 2);
    }
}
