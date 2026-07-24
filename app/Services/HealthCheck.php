<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * Runs live health checks against the app's core dependencies.
 *
 * Each check returns a normalised array:
 *   ['name', 'status' => ok|degraded|down, 'latency_ms', 'message']
 *
 * Shared by the public /status page and the Filament admin System Status page.
 */
class HealthCheck
{
    public const OK = 'ok';

    public const DEGRADED = 'degraded';

    public const DOWN = 'down';

    /**
     * Latency (ms) above which an otherwise-healthy check is marked degraded.
     */
    protected int $degradedThresholdMs = 500;

    /**
     * A queue failure only counts as "degraded" if it happened within this
     * window. Older rows in failed_jobs are historical, not a live problem,
     * so the queue recovers on its own once the window passes with no new
     * failures — no manual queue:flush required.
     */
    protected int $queueFailureWindowMinutes = 15;

    /**
     * @return array<int, array{name: string, key: string, status: string, latency_ms: float|null, message: string}>
     */
    public function components(): array
    {
        return [
            $this->checkDatabase(),
            $this->checkCache(),
            $this->checkQueue(),
            $this->checkStorage(),
        ];
    }

    /**
     * Overall status = worst component status.
     */
    public function overall(array $components): string
    {
        $statuses = array_column($components, 'status');

        if (in_array(self::DOWN, $statuses, true)) {
            return self::DOWN;
        }

        if (in_array(self::DEGRADED, $statuses, true)) {
            return self::DEGRADED;
        }

        return self::OK;
    }

    protected function checkDatabase(): array
    {
        return $this->timed('Database', 'database', function () {
            DB::connection()->getPdo();
            DB::select('select 1');

            return 'Connected ('.config('database.default').').';
        });
    }

    protected function checkCache(): array
    {
        return $this->timed('Cache', 'cache', function () {
            $key = 'health-check:'.uniqid();
            Cache::put($key, 'ok', 5);
            $value = Cache::get($key);
            Cache::forget($key);

            if ($value !== 'ok') {
                throw new \RuntimeException('Cache write/read mismatch.');
            }

            return 'Read/write ok ('.config('cache.default').').';
        });
    }

    protected function checkQueue(): array
    {
        return $this->timed('Queue', 'queue', function () {
            $connection = config('queue.default');

            // Only the database driver exposes counts we can read cheaply.
            if ($connection !== 'database') {
                return 'Driver: '.$connection.'.';
            }

            $pending = DB::table('jobs')->count();
            $failedTotal = DB::table('failed_jobs')->count();
            $recentFailures = DB::table('failed_jobs')
                ->where('failed_at', '>=', now()->subMinutes($this->queueFailureWindowMinutes))
                ->count();

            // Only a fresh failure is a live problem; degraded self-clears
            // once the window passes with no new failures.
            if ($recentFailures > 0) {
                throw new HealthDegraded(
                    $recentFailures.' failed job'.($recentFailures === 1 ? '' : 's')
                    .' in the last '.$this->queueFailureWindowMinutes.'m, '.$pending.' pending.'
                );
            }

            if ($failedTotal > 0) {
                return $pending.' pending. '.$failedTotal.' historical failure'
                    .($failedTotal === 1 ? '' : 's').' (none recent).';
            }

            return $pending.' pending, no failed jobs.';
        });
    }

    protected function checkStorage(): array
    {
        return $this->timed('Storage', 'storage', function () {
            $disk = Storage::disk(config('filesystems.default'));
            $file = 'health-check-'.uniqid().'.tmp';
            $disk->put($file, 'ok');
            $ok = $disk->get($file) === 'ok';
            $disk->delete($file);

            if (! $ok) {
                throw new \RuntimeException('Storage write/read mismatch.');
            }

            return 'Writable ('.config('filesystems.default').').';
        });
    }

    /**
     * Run a check callback, measure latency, and normalise the result.
     *
     * The callback returns a success message, or throws:
     *   - HealthDegraded  => status degraded (working but unhealthy)
     *   - any Throwable    => status down
     */
    protected function timed(string $name, string $key, callable $callback): array
    {
        $start = microtime(true);
        $status = self::OK;
        $message = '';

        try {
            $message = $callback();
        } catch (HealthDegraded $e) {
            $status = self::DEGRADED;
            $message = $e->getMessage();
        } catch (Throwable $e) {
            $status = self::DOWN;
            $message = $e->getMessage();
        }

        $latency = round((microtime(true) - $start) * 1000, 1);

        if ($status === self::OK && $latency > $this->degradedThresholdMs) {
            $status = self::DEGRADED;
            $message .= ' Slow response.';
        }

        return [
            'name' => $name,
            'key' => $key,
            'status' => $status,
            'latency_ms' => $latency,
            'message' => trim($message),
        ];
    }
}
