<?php

use App\Models\User;
use Illuminate\Support\Facades\DB;

test('guests cannot download the report pdf', function () {
    $this->get(route('reports.pdf'))->assertRedirect(route('login'));
});

test('authenticated users can download a report pdf', function () {
    $this->actingAs(User::factory()->create());

    $response = $this->get(route('reports.pdf', [
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
    ]));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
})->skip(
    fn () => DB::connection()->getDriverName() === 'sqlite',
    'Reports queries use MySQL YEAR()/MONTH(); run against MySQL.',
);

test('report pdf rejects an end date before the start date', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('reports.pdf', [
        'start_date' => '2026-12-31',
        'end_date' => '2026-01-01',
    ]))->assertSessionHasErrors('end_date');
});
