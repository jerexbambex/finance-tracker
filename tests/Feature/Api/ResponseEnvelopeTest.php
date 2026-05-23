<?php

use Illuminate\Support\Facades\Route;

beforeEach(function () {
    // Register temporary routes under /api so they go through the api
    // middleware group and the JSON exception handler.
    Route::middleware('api')->prefix('api/v1')->group(function () {
        Route::get('/_test/success', function () {
            return response()->apiSuccess(
                data: ['hello' => 'world'],
                message: 'ok',
                pagination: ['page' => 1, 'limit' => 20, 'total' => 1, 'totalPages' => 1],
            );
        });

        Route::get('/_test/error', function () {
            return response()->apiError(
                message: 'Something broke',
                status: 418,
                errors: ['field' => ['too tealike']],
            );
        });

        Route::post('/_test/validate', function (\Illuminate\Http\Request $request) {
            $request->validate([
                'email' => ['required', 'email'],
                'name' => ['required'],
            ]);

            return response()->apiSuccess(['ok' => true]);
        });

        Route::get('/_test/auth', function () {
            throw new \Illuminate\Auth\AuthenticationException;
        });

        Route::get('/_test/forbidden', function () {
            throw new \Illuminate\Auth\Access\AuthorizationException('Nope.');
        });

        Route::get('/_test/boom', function () {
            throw new \RuntimeException('explode');
        });
    });
});

it('wraps success responses with the canonical envelope including pagination', function () {
    $this->getJson('/api/v1/_test/success')
        ->assertOk()
        ->assertExactJson([
            'success' => true,
            'data' => ['hello' => 'world'],
            'message' => 'ok',
            'pagination' => ['page' => 1, 'limit' => 20, 'total' => 1, 'totalPages' => 1],
        ]);
});

it('wraps error responses with the canonical envelope', function () {
    $this->getJson('/api/v1/_test/error')
        ->assertStatus(418)
        ->assertExactJson([
            'success' => false,
            'message' => 'Something broke',
            'errors' => ['field' => ['too tealike']],
        ]);
});

it('renders validation failures as a 422 JSON envelope with field errors', function () {
    $this->postJson('/api/v1/_test/validate', ['email' => 'not-an-email'])
        ->assertStatus(422)
        ->assertJsonPath('success', false)
        ->assertJsonStructure([
            'success',
            'message',
            'errors' => ['email', 'name'],
        ]);
});

it('returns a 401 JSON envelope for unauthenticated requests', function () {
    $this->getJson('/api/v1/_test/auth')
        ->assertUnauthorized()
        ->assertJsonPath('success', false);
});

it('returns a 403 JSON envelope for unauthorized requests', function () {
    $this->getJson('/api/v1/_test/forbidden')
        ->assertForbidden()
        ->assertExactJson([
            'success' => false,
            'message' => 'Nope.',
        ]);
});

it('returns a 500 JSON envelope for unhandled exceptions', function () {
    config(['app.debug' => false]);

    $this->getJson('/api/v1/_test/boom')
        ->assertStatus(500)
        ->assertExactJson([
            'success' => false,
            'message' => 'Server error.',
        ]);
});
