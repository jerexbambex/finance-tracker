<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Mirrors the Flutter `AppSettings.toJson` shape
 * (`margin_app/lib/features/settings/data/models/app_settings.dart`).
 *
 * Keys use the same lowercase enum names the Flutter client emits
 * (themeMode: system|light|dark; currency: usd|eur|gbp|sar|aed|ngn) so
 * round-tripping through this endpoint preserves them losslessly.
 *
 * @mixin \App\Models\UserSettings
 */
class SettingsResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'themeMode' => $this->theme_mode,
            'accentColor' => $this->accent_color,
            'currency' => $this->currency,
            'dailyReminderHour' => $this->daily_reminder_hour,
            'dailyReminderMinute' => $this->daily_reminder_minute,
            'dailyReminderEnabled' => (bool) $this->daily_reminder_enabled,
            'budgetAlertEnabled' => (bool) $this->budget_alert_enabled,
            'flexibleStreakDays' => $this->flexible_streak_days,
            'cloudSyncEnabled' => (bool) $this->cloud_sync_enabled,
        ];
    }
}
