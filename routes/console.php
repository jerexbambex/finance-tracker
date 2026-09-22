<?php

use App\Models\StatusCheck;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('transactions:process-recurring')->daily();

// Carry budgets into the new period. Runs daily (not only on the 1st) so a
// missed night still recovers; the rolled_over_at stamp keeps it idempotent.
Schedule::command('budgets:rollover')->dailyAt('00:10')->withoutOverlapping();

// Refresh FX rates, then record today's net worth. Order doesn't matter for
// the snapshot itself (raw per-currency balances are stored, converted at
// read time), but keeping rates fresh first means anyone looking right after
// midnight sees today's rate, not yesterday's.
Schedule::command('exchangerates:update')->dailyAt('00:05')->withoutOverlapping();
Schedule::command('networth:snapshot')->dailyAt('00:15')->withoutOverlapping();
Schedule::command('reminders:send')->dailyAt('09:00');

// Uptime history for the public status page.
Schedule::command('status:record')->everyFiveMinutes()->withoutOverlapping();

// Keep ~90 days of history; drop anything older.
Schedule::call(function () {
    StatusCheck::where('checked_at', '<', now()->subDays(95))->delete();
})->daily();
