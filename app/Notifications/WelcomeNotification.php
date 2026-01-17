<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{
    use Queueable;

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Welcome to Budget App!')
            ->greeting("Hello {$notifiable->name}!")
            ->line('Welcome to Budget App! We\'re excited to have you on board.')
            ->line('Budget App helps you take control of your finances with powerful budgeting tools, expense tracking, and financial insights.')
            ->action('Get Started', url('/dashboard'))
            ->line('If you have any questions, feel free to reach out to our support team.')
            ->line('Happy budgeting!');
    }
}
