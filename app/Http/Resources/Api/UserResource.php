<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Mirrors the `ApiUserProfile` shape consumed by the Flutter client
 * (`margin_app/lib/services/api/auth_api_service.dart`).
 *
 * @mixin \App\Models\User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'phoneNumber' => $this->phone_number,
            'email' => $this->email,
            'firstName' => $this->first_name,
            'lastName' => $this->last_name,
            'biometricEnabled' => (bool) $this->biometric_enabled,
            'goal' => $this->goal,
            'subscriptionTier' => $this->subscription_tier,
            'isPremium' => $this->isPremium(),
            'createdAt' => optional($this->created_at)->toIso8601String(),
        ];
    }
}
