<?php

use App\Models\StatusCheck;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('transactions:process-recurring')->daily();
Schedule::command('reminders:send')->dailyAt('09:00');

// Uptime history for the public status page.
Schedule::command('status:record')->everyFiveMinutes()->withoutOverlapping();

// Keep ~90 days of history; drop anything older.
Schedule::call(function () {
    StatusCheck::where('checked_at', '<', now()->subDays(95))->delete();
})->daily();
