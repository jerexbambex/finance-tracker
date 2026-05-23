<?php

namespace App\Providers;

use Illuminate\Http\JsonResponse;
use Illuminate\Routing\ResponseFactory;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->registerApiResponseMacros();
    }

    /**
     * Response macros used by the JSON API to enforce the
     * `{ success, data, message, pagination? }` envelope expected by the
     * mobile client (see `lib/services/api/api_response.dart` in margin_app).
     */
    private function registerApiResponseMacros(): void
    {
        ResponseFactory::macro('apiSuccess', function (
            mixed $data = null,
            ?string $message = null,
            int $status = 200,
            ?array $pagination = null,
        ): JsonResponse {
            /** @var ResponseFactory $this */
            $payload = ['success' => true];

            $payload['data'] = $data;

            if ($message !== null) {
                $payload['message'] = $message;
            }

            if ($pagination !== null) {
                $payload['pagination'] = $pagination;
            }

            return $this->json($payload, $status);
        });

        ResponseFactory::macro('apiError', function (
            string $message,
            int $status = 400,
            ?array $errors = null,
            mixed $data = null,
        ): JsonResponse {
            /** @var ResponseFactory $this */
            $payload = [
                'success' => false,
                'message' => $message,
            ];

            if ($errors !== null) {
                $payload['errors'] = $errors;
            }

            if ($data !== null) {
                $payload['data'] = $data;
            }

            return $this->json($payload, $status);
        });
    }
}
