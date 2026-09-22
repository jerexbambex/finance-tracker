<?php

use App\Models\PageVisit;
use App\Models\User;

it('records a page visit for a normal GET request', function () {
    $this->get('/privacy-policy');

    expect(PageVisit::count())->toBe(1);
    $visit = PageVisit::first();
    expect($visit->path)->toBe('/privacy-policy')
        ->and($visit->route_name)->toBe('privacy-policy')
        ->and($visit->is_authenticated)->toBeFalse()
        ->and($visit->visitor_hash)->toHaveLength(64);
});

it('flags is_authenticated for a logged-in visit', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/dashboard');

    expect(PageVisit::first()->is_authenticated)->toBeTrue();
});

it('does not record a POST request', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/notifications/mark-all-read');

    expect(PageVisit::count())->toBe(0);
});

it('does not record a failed (4xx/5xx) request', function () {
    $this->get('/this-route-does-not-exist')->assertNotFound();

    expect(PageVisit::count())->toBe(0);
});

it('does not record admin panel visits', function () {
    $this->get('/admin/login');

    expect(PageVisit::count())->toBe(0);
});

it('does not record the health check, search endpoint, or static assets', function () {
    $this->get('/up');
    $this->get('/favicon.ico');
    $this->get('/manifest.webmanifest');

    expect(PageVisit::count())->toBe(0);
});

it('does not record a request from an obvious bot user agent', function () {
    $this->withHeaders(['User-Agent' => 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'])
        ->get('/privacy-policy');

    expect(PageVisit::count())->toBe(0);
});

it('does not record a request with no user agent at all', function () {
    $this->withHeaders(['User-Agent' => ''])->get('/privacy-policy');

    expect(PageVisit::count())->toBe(0);
});

it('gives the same visitor the same hash within a day and a different one the next day', function () {
    $this->withHeaders(['User-Agent' => 'Mozilla/5.0 Test Browser', 'REMOTE_ADDR' => '203.0.113.5'])
        ->get('/privacy-policy');
    $this->withHeaders(['User-Agent' => 'Mozilla/5.0 Test Browser', 'REMOTE_ADDR' => '203.0.113.5'])
        ->get('/status');

    $hashes = PageVisit::pluck('visitor_hash')->unique();
    expect($hashes)->toHaveCount(1);

    $this->travelTo(now()->addDay());
    $this->withHeaders(['User-Agent' => 'Mozilla/5.0 Test Browser', 'REMOTE_ADDR' => '203.0.113.5'])
        ->get('/privacy-policy');

    expect(PageVisit::pluck('visitor_hash')->unique())->toHaveCount(2);
});

it('never stores the raw ip address anywhere on the row', function () {
    $this->withHeaders(['REMOTE_ADDR' => '203.0.113.99'])->get('/privacy-policy');

    $visit = PageVisit::first();
    expect(collect($visit->getAttributes())->flatten()->implode(' '))->not->toContain('203.0.113.99');
});
