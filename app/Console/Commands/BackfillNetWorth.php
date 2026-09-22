<?php

namespace App\Console\Commands;

use App\Models\Account;
use App\Models\User;
use App\Services\NetWorthReconstructor;
use Illuminate\Console\Command;

class BackfillNetWorth extends Command
{
    protected $signature = 'networth:backfill {--days=365 : How far back to reconstruct, per user (bounded by their earliest transaction per currency)}';

    protected $description = 'Reconstruct historical net worth snapshots for every user from their transaction ledger';

    public function handle(NetWorthReconstructor $reconstructor): int
    {
        $days = (int) $this->option('days');
        $userIds = Account::query()->distinct()->pluck('user_id');

        $rows = 0;
        $users = 0;

        User::whereIn('id', $userIds)->chunkById(100, function ($chunk) use ($reconstructor, $days, &$rows, &$users) {
            foreach ($chunk as $user) {
                $rows += $reconstructor->backfill($user, $days);
                $users++;
            }
        });

        $this->info("Backfilled {$rows} snapshot row".($rows === 1 ? '' : 's')." across {$users} users.");

        return self::SUCCESS;
    }
}
