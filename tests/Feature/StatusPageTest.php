<?php

use App\Services\HealthCheck;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;

function insertFailedJob(\DateTimeInterface $failedAt): void
{
    DB::table('failed_jobs')->insert([
        'uuid' => (string) Str::uuid(),
        'connection' => 'database',
        'queue' => 'default',
        'payload' => '{}',
        'exception' => 'boom',
        'failed_at' => $failedAt,
    ]);
}

function queueComponent(): array
{
    $components = (new HealthCheck)->components();

    return collect($components)->firstWhere('key', 'queue');
}

test('status page renders for guests', function () {
    $this->get(route('status'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('status')
            ->has('components', 4)
            ->where('overall', HealthCheck::OK)
            ->has('checkedAt')
        );
});

test('status json returns healthy payload with 200', function () {
    $this->getJson(route('status.check'))
        ->assertOk()
        ->assertJsonPath('overall', HealthCheck::OK)
        ->assertJsonCount(4, 'components')
        ->assertJsonStructure([
            'overall',
            'checkedAt',
            'components' => [['name', 'key', 'status', 'latency_ms', 'message']],
        ]);
});

test('status json returns 503 when a component is down', function () {
    $this->mock(HealthCheck::class, function ($mock) {
        $down = [
            ['name' => 'Database', 'key' => 'database', 'status' => HealthCheck::DOWN, 'latency_ms' => 1.0, 'message' => 'unreachable'],
        ];
        $mock->shouldReceive('components')->andReturn($down);
        $mock->shouldReceive('overall')->with($down)->andReturn(HealthCheck::DOWN);
    });

    $this->getJson(route('status.check'))
        ->assertStatus(503)
        ->assertJsonPath('overall', HealthCheck::DOWN);
});

test('a recent queue failure marks the queue degraded', function () {
    config(['queue.default' => 'database']);
    insertFailedJob(now()->subMinutes(5));

    expect(queueComponent()['status'])->toBe(HealthCheck::DEGRADED);
});

test('an old queue failure recovers to operational on its own', function () {
    config(['queue.default' => 'database']);
    insertFailedJob(now()->subHour());

    $queue = queueComponent();

    expect($queue['status'])->toBe(HealthCheck::OK)
        ->and($queue['message'])->toContain('historical failure');
});

test('overall status resolves to the worst component', function () {
    $health = new HealthCheck;

    expect($health->overall([
        ['status' => HealthCheck::OK],
        ['status' => HealthCheck::DEGRADED],
        ['status' => HealthCheck::OK],
    ]))->toBe(HealthCheck::DEGRADED);

    expect($health->overall([
        ['status' => HealthCheck::DEGRADED],
        ['status' => HealthCheck::DOWN],
    ]))->toBe(HealthCheck::DOWN);

    expect($health->overall([
        ['status' => HealthCheck::OK],
        ['status' => HealthCheck::OK],
    ]))->toBe(HealthCheck::OK);
});
