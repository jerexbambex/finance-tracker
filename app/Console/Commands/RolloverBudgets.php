<?php

namespace App\Console\Commands;

use App\Models\Budget;
use App\Models\User;
use App\Services\BudgetRollover;
use Illuminate\Console\Command;

class RolloverBudgets extends Command
{
    protected $signature = 'budgets:rollover';

    protected $description = 'Carry auto-rollover budgets forward into the current period';

    public function handle(BudgetRollover $rollover): int
    {
        // Only users who still have an unrolled auto-rollover budget can produce
        // work, so the nightly run touches nothing once a month has been rolled.
        $userIds = Budget::query()
            ->where('auto_rollover', true)
            ->whereNull('rolled_over_at')
            ->distinct()
            ->pluck('user_id');

        $created = 0;
        $users = 0;

        User::whereIn('id', $userIds)->chunkById(100, function ($chunk) use ($rollover, &$created, &$users) {
            foreach ($chunk as $user) {
                $count = $rollover->rollForward($user, now());

                if ($count > 0) {
                    $users++;
                    $created += $count;
                }
            }
        });

        $this->info("Rolled forward {$created} budgets for {$users} users.");

        return self::SUCCESS;
    }
}
