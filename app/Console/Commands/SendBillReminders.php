<?php

namespace App\Console\Commands;

use App\Models\Reminder;
use App\Notifications\BillReminderNotification;
use Illuminate\Console\Command;

class SendBillReminders extends Command
{
    protected $signature = 'reminders:send';

    protected $description = 'Send email notifications for upcoming bill reminders';

    public function handle()
    {
        // Get reminders due in the next 3 days
        $reminders = Reminder::with('user')
            ->where('is_completed', false)
            ->whereBetween('due_date', [now(), now()->addDays(3)])
            ->get();

        $sent = 0;

        foreach ($reminders as $reminder) {
            $reminder->user->notify(new BillReminderNotification($reminder));
            $sent++;
        }

        $this->info("Sent {$sent} bill reminder notifications.");

        return Command::SUCCESS;
    }
}
