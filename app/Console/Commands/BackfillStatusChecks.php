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
    protected $signature = 'status:backfill {--days=90 : How many days back to fill} {--per-day=3 : Rows to insert per component per day} {--jitter=0 : Percent chance (0-100) a component-day gets one degraded (amber) result}';

    protected $description = 'Seed synthetic status history to populate empty uptime bars';

    public function handle(HealthCheck $health): int
    {
        $days = (int) $this->option('days');
        $perDay = max(1, (int) $this->option('per-day'));
        $jitter = max(0, min(100, (int) $this->option('jitter')));
        $keys = array_column($health->components(), 'key');
        $degradedCount = 0;

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
                // Optionally turn one of the day's rows amber so the bar reads
                // degraded and the uptime % dips a little below 100.
                $degradedSlot = $jitter > 0 && mt_rand(1, 100) <= $jitter ? mt_rand(0, $perDay - 1) : null;

                for ($n = 0; $n < $perDay; $n++) {
                    $degraded = $n === $degradedSlot;
                    $degradedCount += $degraded ? 1 : 0;

                    $rows[] = [
                        'component' => $key,
                        'status' => $degraded ? HealthCheck::DEGRADED : HealthCheck::OK,
                        'latency_ms' => $degraded ? round(mt_rand(600, 1200) / 10, 1) : round(mt_rand(5, 60) / 10, 1),
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

        $this->info(count($rows).' synthetic row(s) inserted across '.count($keys).' component(s)'
            .($degradedCount > 0 ? ', '.$degradedCount.' degraded.' : '.'));

        return self::SUCCESS;
    }
}
