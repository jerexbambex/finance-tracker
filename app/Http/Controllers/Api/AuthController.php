<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Auth\BiometricRequest;
use App\Http\Requests\Api\Auth\LoginRequest;
use App\Http\Requests\Api\Auth\RefreshRequest;
use App\Http\Requests\Api\Auth\RegisterRequest;
use App\Http\Resources\Api\UserResource;
use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $first = $data['firstName'] ?? null;
        $last = $data['lastName'] ?? null;
        $displayName = trim(($first ?? '').' '.($last ?? '')) ?: $data['phoneNumber'];

        $user = User::create([
            'name' => $displayName,
            'first_name' => $first,
            'last_name' => $last,
            'email' => $data['email'] ?? null,
            'phone_number' => $data['phoneNumber'],
            'password' => $data['password'],
            'goal' => $data['goal'] ?? 'finance',
            'subscription_tier' => 'free',
        ]);

        return response()->apiSuccess(
            data: $this->issueTokensPayload($user, $data['deviceName'] ?? null),
            status: 201,
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::query()->where('phone_number', $data['phoneNumber'])->first();

        if ($user === null || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'phoneNumber' => ['Invalid phone number or password.'],
            ]);
        }

        return response()->apiSuccess(
            data: $this->issueTokensPayload($user, $data['deviceName'] ?? null),
        );
    }

    public function refresh(RefreshRequest $request): JsonResponse
    {
        $existing = RefreshToken::findActive($request->validated('refreshToken'));

        if ($existing === null) {
            return response()->apiError(
                message: 'Invalid or expired refresh token.',
                status: 401,
            );
        }

        $existing->revoke();

        return response()->apiSuccess(
            data: $this->issueTokensPayload($existing->user, $existing->device_name),
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        $token = $request->user()->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        $user->refreshTokens()
            ->whereNull('revoked_at')
            ->update(['revoked_at' => now()]);

        return response()->apiSuccess(message: 'Logged out.');
    }

    public function me(Request $request): JsonResponse
    {
        return response()->apiSuccess(
            data: (new UserResource($request->user()))->toArray($request),
        );
    }

    public function biometricEnroll(BiometricRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->forceFill([
            'biometric_enabled' => true,
            'biometric_token_hash' => hash('sha256', $request->validated('biometricToken')),
        ])->save();

        return response()->apiSuccess(message: 'Biometric enrolled.');
    }

    public function biometricVerify(BiometricRequest $request): JsonResponse
    {
        $data = $request->validated();
        $phone = $data['phoneNumber'] ?? null;

        if ($phone === null) {
            return response()->apiError(
                message: 'phoneNumber is required for biometric verification.',
                status: 422,
            );
        }

        $user = User::query()->where('phone_number', $phone)->first();

        if (
            $user === null
            || ! $user->biometric_enabled
            || $user->biometric_token_hash === null
            || ! hash_equals($user->biometric_token_hash, hash('sha256', $data['biometricToken']))
        ) {
            return response()->apiError(
                message: 'Biometric verification failed.',
                status: 401,
            );
        }

        return response()->apiSuccess(
            data: $this->issueTokensPayload($user, $data['deviceName'] ?? null),
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function issueTokensPayload(User $user, ?string $deviceName): array
    {
        $deviceName ??= 'api';

        $accessTtl = (int) config('sanctum.expiration', 15);
        $access = $user->createToken(
            name: $deviceName,
            expiresAt: Carbon::now()->addMinutes($accessTtl),
        );

        $refresh = RefreshToken::issue($user, $deviceName);

        return [
            'accessToken' => $access->plainTextToken,
            'refreshToken' => $refresh['plainText'],
            'tokenType' => 'Bearer',
            'expiresIn' => $accessTtl * 60,
            'user' => (new UserResource($user))->toArray(request()),
        ];
    }
}
