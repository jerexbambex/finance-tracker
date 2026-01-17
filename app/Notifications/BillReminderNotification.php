<?php

namespace App\Notifications;

use App\Models\Reminder;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BillReminderNotification extends Notification
{
    use Queueable;

    public function __construct(public Reminder $reminder) {}

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $dueDate = $this->reminder->due_date->format('M d, Y');
        $amount = $this->reminder->amount ? '$'.number_format($this->reminder->amount, 2) : '';

        return (new MailMessage)
            ->subject('Bill Reminder: '.$this->reminder->title)
            ->greeting('Hello!')
            ->line('This is a reminder that you have a bill due soon:')
            ->line('**'.$this->reminder->title.'**')
            ->line('Due Date: '.$dueDate)
            ->lineIf($amount, 'Amount: '.$amount)
            ->action('View Reminders', url('/reminders'))
            ->line('Thank you for using our application!');
    }

    public function toArray($notifiable): array
    {
        return [
            'reminder_id' => $this->reminder->id,
            'title' => $this->reminder->title,
            'due_date' => $this->reminder->due_date->toDateString(),
            'amount' => $this->reminder->amount,
            'message' => "Bill reminder: {$this->reminder->title} is due on {$this->reminder->due_date->format('M d, Y')}",
        ];
    }
}
