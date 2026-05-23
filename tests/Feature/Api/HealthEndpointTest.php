<?php

it('returns the standard success envelope from the health endpoint', function () {
    $response = $this->getJson('/api/v1/health');

    $response->assertOk()
        ->assertJson(fn ($json) => $json
            ->where('success', true)
            ->has('data', fn ($data) => $data
                ->where('status', 'ok')
                ->has('time')
            )
            ->etc()
        );
});

it('forces a JSON response on the api group even without an Accept header', function () {
    $response = $this->get('/api/v1/health');

    $response->assertOk();
    expect($response->headers->get('Content-Type'))->toStartWith('application/json');
});

it('returns a JSON 404 envelope for unknown api routes', function () {
    $response = $this->getJson('/api/v1/this-route-does-not-exist');

    $response->assertNotFound()
        ->assertJsonPath('success', false)
        ->assertJsonStructure(['success', 'message']);
});
