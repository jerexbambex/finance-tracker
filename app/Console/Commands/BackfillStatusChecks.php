<?php

namespace App\Console\Commands;

use App\Models\StatusCheck;
use App\Services\HealthCheck;
use Illuminate\Console\Command;

/**
 * Seeds synthetic uptime history so the status page bars are populated
 * before real data has accrued. Only fills days that have no recorded
 * checks yet, so genuine records going forward are never overwritten.
 */
class BackfillStatusChecks extends Command
{
    protected $signature = 'status:backfill {--days=90 : How many days back to fill} {--per-day=3 : Rows to insert per component per day}';

    protected $description = 'Seed synthetic status history to populate empty uptime bars';

    public function handle(HealthCheck $health): int
    {
        $days = (int) $this->option('days');
        $perDay = max(1, (int) $this->option('per-day'));
        $keys = array_column($health->components(), 'key');

        // Days that already have real data — leave those untouched.
        $filled = StatusCheck::query()
            ->where('checked_at', '>=', now()->subDays($days)->startOfDay())
            ->selectRaw('DATE(checked_at) as day')
            ->distinct()
            ->pluck('day')
            ->map(fn ($d) => (string) $d)
            ->flip();

        $rows = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);

            if ($filled->has($date->toDateString())) {
                continue;
            }

            foreach ($keys as $key) {
                for ($n = 0; $n < $perDay; $n++) {
                    $rows[] = [
                        'component' => $key,
                        'status' => HealthCheck::OK,
                        'latency_ms' => round(mt_rand(5, 60) / 10, 1),
                        'checked_at' => $date->copy()->startOfDay()->addHours(intdiv(24 * $n, $perDay)),
                    ];
                }
            }
        }

        if ($rows === []) {
            $this->info('Nothing to backfill — every day already has data.');

            return self::SUCCESS;
        }

        foreach (array_chunk($rows, 500) as $chunk) {
            StatusCheck::insert($chunk);
        }

        $this->info(count($rows).' synthetic row(s) inserted across '.count($keys).' component(s).');

        return self::SUCCESS;
    }
}
