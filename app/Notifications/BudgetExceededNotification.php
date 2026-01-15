<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BudgetExceededNotification extends Notification
{
    use Queueable;

    public function __construct(public \App\Models\Budget $budget, public float $spent, public float $percentage)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'budget_id' => $this->budget->id,
            'category' => $this->budget->category->name,
            'amount' => $this->budget->amount / 100,
            'spent' => $this->spent,
            'percentage' => round($this->percentage, 1),
            'message' => "You've spent " . round($this->percentage, 1) . "% of your {$this->budget->category->name} budget",
        ];
    }
}
