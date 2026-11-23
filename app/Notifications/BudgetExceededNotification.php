<?php

namespace App\Notifications;

use App\Currency;
use App\Models\Budget;
use App\Services\BudgetAlerts;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent by BudgetAlerts at each level (pace, 80%, over) — once per level per
 * budget period. The class name is kept for existing stored notifications.
 */
class BudgetExceededNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Budget $budget,
        public float $spent,
        public float $percentage,
        public int $level = BudgetAlerts::WARNING,
        public ?float $projected = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $category = $this->budget->category->name;

        $mail = (new MailMessage)
            ->subject($this->subject($category))
            ->greeting($this->headline())
            ->line($this->message($category))
            ->line('Budget: '.$this->money($this->budget->amount))
            ->line('Spent so far: '.$this->money($this->spent));

        if ($this->level === BudgetAlerts::PACE && $this->projected !== null) {
            $mail->line('Projected by period end: '.$this->money($this->projected));
        }

        return $mail
            ->action('View budgets', url('/budgets'))
            ->line($this->level === BudgetAlerts::EXCEEDED
                ? 'You won’t get another alert for this budget this period.'
                : 'We’ll only email you again if you reach the next level.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'budget_id' => $this->budget->id,
            'category' => $this->budget->category->name,
            'amount' => $this->budget->amount,
            'spent' => $this->spent,
            'percentage' => round($this->percentage, 1),
            'level' => $this->levelName(),
            'projected' => $this->projected,
            'currency' => $this->budget->currency,
            'message' => $this->message($this->budget->category->name),
        ];
    }

    private function message(string $category): string
    {
        return match ($this->level) {
            BudgetAlerts::PACE => "At your current pace you'll spend about {$this->money((float) $this->projected)} on {$category} — "
                .$this->money((float) $this->projected - $this->budget->amount).' over your '.$this->money($this->budget->amount).' budget.',
            BudgetAlerts::EXCEEDED => "You've gone over your {$category} budget: {$this->money($this->spent)} of {$this->money($this->budget->amount)}.",
            default => "You've used ".round($this->percentage)."% of your {$category} budget ({$this->money($this->spent)} of {$this->money($this->budget->amount)}).",
        };
    }

    private function subject(string $category): string
    {
        return match ($this->level) {
            BudgetAlerts::PACE => "Heads up: {$category} is on pace to go over budget",
            BudgetAlerts::EXCEEDED => "{$category} is over budget",
            default => "{$category} budget is ".round($this->percentage).'% used',
        };
    }

    private function headline(): string
    {
        return match ($this->level) {
            BudgetAlerts::PACE => 'Spending is running ahead',
            BudgetAlerts::EXCEEDED => 'Budget exceeded',
            default => 'Budget almost used',
        };
    }

    private function levelName(): string
    {
        return match ($this->level) {
            BudgetAlerts::PACE => 'pace',
            BudgetAlerts::EXCEEDED => 'exceeded',
            default => 'warning',
        };
    }

    private function money(float $amount): string
    {
        $symbol = Currency::tryFrom((string) $this->budget->currency)?->symbol() ?? $this->budget->currency.' ';

        return $symbol.number_format($amount, 2);
    }
}
