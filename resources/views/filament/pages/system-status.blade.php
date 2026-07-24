@php
    use App\Services\HealthCheck;

    $badge = fn (string $status) => match ($status) {
        HealthCheck::OK => ['Operational', 'success'],
        HealthCheck::DEGRADED => ['Degraded', 'warning'],
        default => ['Down', 'danger'],
    };
    $dot = fn (string $status) => match ($status) {
        HealthCheck::OK => 'bg-success-500',
        HealthCheck::DEGRADED => 'bg-warning-500',
        default => 'bg-danger-500',
    };
    [$overallLabel, $overallColor] = $badge($overall);
@endphp

<x-filament-panels::page>
    {{-- Overall banner --}}
    <x-filament::section>
        <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
                <span class="relative flex h-3 w-3">
                    <span @class(['absolute inline-flex h-full w-full animate-ping rounded-full opacity-75', $dot($overall)])></span>
                    <span @class(['relative inline-flex h-3 w-3 rounded-full', $dot($overall)])></span>
                </span>
                <x-filament::badge :color="$overallColor" size="lg">{{ $overallLabel }}</x-filament::badge>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                    Last checked {{ $checkedAt->diffForHumans() }}
                </span>
            </div>
            <x-filament::button
                wire:click="$refresh"
                wire:loading.attr="disabled"
                icon="heroicon-o-arrow-path"
                color="gray"
                size="sm"
            >
                Re-run checks
            </x-filament::button>
        </div>
    </x-filament::section>

    {{-- Dependencies --}}
    <x-filament::section heading="Dependencies" icon="heroicon-o-server-stack">
        <ul role="list" class="-my-3 divide-y divide-gray-100 dark:divide-white/10">
            @foreach ($components as $c)
                @php [$label, $color] = $badge($c['status']); @endphp
                <li class="flex items-center gap-4 py-3">
                    <span @class(['h-2.5 w-2.5 shrink-0 rounded-full', $dot($c['status'])])></span>

                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-gray-950 dark:text-white">{{ $c['name'] }}</p>
                        <p class="truncate text-xs text-gray-500 dark:text-gray-400">{{ $c['message'] }}</p>
                    </div>

                    @if (! is_null($c['latency_ms']))
                        <span class="shrink-0 font-mono text-xs tabular-nums text-gray-400">{{ $c['latency_ms'] }} ms</span>
                    @endif

                    <x-filament::badge :color="$color" class="shrink-0">{{ $label }}</x-filament::badge>
                </li>
            @endforeach
        </ul>
    </x-filament::section>

    <div class="grid gap-6 lg:grid-cols-3">
        {{-- System info --}}
        <x-filament::section heading="System" icon="heroicon-o-cpu-chip" class="lg:col-span-2">
            <dl class="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                @foreach ($system as $key => $value)
                    <div class="flex items-center justify-between gap-4 border-b border-gray-100 pb-2 dark:border-white/10">
                        <dt class="text-sm text-gray-500 dark:text-gray-400">{{ $key }}</dt>
                        <dd class="font-mono text-sm text-gray-950 dark:text-white">{{ $value }}</dd>
                    </div>
                @endforeach
            </dl>
        </x-filament::section>

        {{-- Queue stats as tiles --}}
        <x-filament::section heading="Queue" icon="heroicon-o-queue-list">
            @if (is_null($queue['pending']))
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Driver &ldquo;{{ config('queue.default') }}&rdquo; exposes no readable counts.
                </p>
            @else
                <div class="grid grid-cols-2 gap-4">
                    <div class="rounded-xl bg-gray-50 p-4 text-center dark:bg-white/5">
                        <p class="text-3xl font-bold tabular-nums text-gray-950 dark:text-white">{{ $queue['pending'] }}</p>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Pending</p>
                    </div>
                    <div @class(['rounded-xl p-4 text-center', 'bg-danger-50 dark:bg-danger-500/10' => $queue['failed'] > 0, 'bg-gray-50 dark:bg-white/5' => $queue['failed'] === 0])>
                        <p @class(['text-3xl font-bold tabular-nums', 'text-danger-600 dark:text-danger-400' => $queue['failed'] > 0, 'text-gray-950 dark:text-white' => $queue['failed'] === 0])>{{ $queue['failed'] }}</p>
                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Failed</p>
                    </div>
                </div>
            @endif
        </x-filament::section>
    </div>
</x-filament-panels::page>
