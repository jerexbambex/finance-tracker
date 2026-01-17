<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BudgetExceededNotification extends Notification
{
    use Queueable;

    public function __construct(public \App\Models\Budget $budget, public float $spent, public float $percentage) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $category = $this->budget->category->name;
        $budgetAmount = '$'.number_format($this->budget->amount, 2);
        $spentAmount = '$'.number_format($this->spent, 2);
        $percentage = round($this->percentage, 1);

        return (new MailMessage)
            ->subject('Budget Alert: '.$category)
            ->greeting('Budget Alert!')
            ->line("Your **{$category}** budget has reached {$percentage}% of its limit.")
            ->line("Budget: {$budgetAmount}")
            ->line("Spent: {$spentAmount}")
            ->action('View Budgets', url('/budgets'))
            ->line('Consider reviewing your spending in this category.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'budget_id' => $this->budget->id,
            'category' => $this->budget->category->name,
            'amount' => $this->budget->amount,
            'spent' => $this->spent,
            'percentage' => round($this->percentage, 1),
            'message' => "You've spent ".round($this->percentage, 1)."% of your {$this->budget->category->name} budget",
        ];
    }
}
