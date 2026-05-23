<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class RefreshToken extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'token_hash',
        'device_name',
        'expires_at',
        'revoked_at',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        return $this->revoked_at === null && $this->expires_at->isFuture();
    }

    public function revoke(): void
    {
        $this->forceFill(['revoked_at' => now()])->save();
    }

    /**
     * Issue a new refresh token. Returns the plain-text token to hand to
     * the client (only available here — only the hash is stored).
     *
     * @return array{model: RefreshToken, plainText: string}
     */
    public static function issue(User $user, ?string $deviceName = null, ?int $ttlDays = null): array
    {
        $ttlDays ??= (int) config('sanctum.refresh_ttl_days', 30);
        $secret = Str::random(64);

        $model = static::create([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $secret),
            'device_name' => $deviceName,
            'expires_at' => Carbon::now()->addDays($ttlDays),
        ]);

        return [
            'model' => $model,
            'plainText' => $model->id.'|'.$secret,
        ];
    }

    /**
     * Look up an active refresh token from the plain-text value the client
     * sent. Returns null if the token is malformed, unknown, revoked, or expired.
     */
    public static function findActive(string $plainText): ?self
    {
        if (! str_contains($plainText, '|')) {
            return null;
        }

        [$id, $secret] = explode('|', $plainText, 2);

        $token = static::query()->whereKey($id)->first();

        if ($token === null) {
            return null;
        }

        if (! hash_equals($token->token_hash, hash('sha256', $secret))) {
            return null;
        }

        return $token->isActive() ? $token : null;
    }
}
