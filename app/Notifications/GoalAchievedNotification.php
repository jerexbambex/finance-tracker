<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class GoalAchievedNotification extends Notification
{
    use Queueable;

    public function __construct(public \App\Models\Goal $goal)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'goal_id' => $this->goal->id,
            'name' => $this->goal->name,
            'target_amount' => $this->goal->target_amount / 100,
            'message' => "Congratulations! You've achieved your goal: {$this->goal->name}",
        ];
    }
}
