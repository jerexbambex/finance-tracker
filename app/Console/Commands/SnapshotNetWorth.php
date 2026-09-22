<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\NetWorthReconstructor;
use Illuminate\Console\Command;

class SnapshotNetWorth extends Command
{
    protected $signature = 'networth:snapshot';

    protected $description = "Record today's net worth snapshot for every user with an account";

    public function handle(NetWorthReconstructor $reconstructor): int
    {
        $userIds = \App\Models\Account::query()->distinct()->pluck('user_id');

        $rows = 0;
        $users = 0;

        User::whereIn('id', $userIds)->chunkById(100, function ($chunk) use ($reconstructor, &$rows, &$users) {
            foreach ($chunk as $user) {
                $rows += $reconstructor->snapshotToday($user);
                $users++;
            }
        });

        $this->info("Snapshotted {$rows} currency balance".($rows === 1 ? '' : 's')." across {$users} users.");

        return self::SUCCESS;
    }
}
