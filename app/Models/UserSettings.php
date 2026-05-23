<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Per-user app preferences. Mirrors the Flutter `AppSettings` model.
 * Created lazily on first GET /settings.
 */
class UserSettings extends Model
{
    use HasUuids;

    protected $table = 'user_settings';

    protected $fillable = [
        'user_id',
        'theme_mode',
        'accent_color',
        'currency',
        'daily_reminder_hour',
        'daily_reminder_minute',
        'daily_reminder_enabled',
        'budget_alert_enabled',
        'flexible_streak_days',
        'cloud_sync_enabled',
    ];

    protected $casts = [
        'daily_reminder_hour' => 'integer',
        'daily_reminder_minute' => 'integer',
        'daily_reminder_enabled' => 'boolean',
        'budget_alert_enabled' => 'boolean',
        'flexible_streak_days' => 'integer',
        'cloud_sync_enabled' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
