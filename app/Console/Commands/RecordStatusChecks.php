<?php

namespace App\Console\Commands;

use App\Models\StatusCheck;
use App\Services\HealthCheck;
use Illuminate\Console\Command;

class RecordStatusChecks extends Command
{
    protected $signature = 'status:record';

    protected $description = 'Run health checks and record each component result for uptime history';

    public function handle(HealthCheck $health): int
    {
        $now = now();
        $rows = [];

        foreach ($health->components() as $component) {
            $rows[] = [
                'component' => $component['key'],
                'status' => $component['status'],
                'latency_ms' => $component['latency_ms'],
                'checked_at' => $now,
            ];
        }

        StatusCheck::insert($rows);

        $this->info(count($rows).' component result(s) recorded.');

        return self::SUCCESS;
    }
}
