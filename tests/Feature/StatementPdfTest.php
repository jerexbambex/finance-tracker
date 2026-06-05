<?php

use App\Models\User;

test('guests cannot download the transaction statement', function () {
    $this->get(route('export.statement'))->assertRedirect(route('login'));
});

test('authenticated users can download a transaction statement pdf', function () {
    $this->actingAs(User::factory()->create());

    $response = $this->get(route('export.statement', [
        'date_from' => '2026-01-01',
        'date_to' => '2026-12-31',
    ]));

    $response->assertOk();
    expect($response->headers->get('content-type'))->toContain('application/pdf');
});

test('statement rejects an end date before the start date', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('export.statement', [
        'date_from' => '2026-12-31',
        'date_to' => '2026-01-01',
    ]))->assertSessionHasErrors('date_to');
});
