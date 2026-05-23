<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Settings\UpdateSettingsRequest;
use App\Http\Resources\Api\SettingsResource;
use App\Models\User;
use App\Models\UserSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $settings = $this->resolveSettings($request->user());

        return response()->apiSuccess(
            data: (new SettingsResource($settings))->toArray($request),
        );
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $settings = $this->resolveSettings($request->user());
        $data = $request->validated();

        $map = [
            'themeMode' => 'theme_mode',
            'accentColor' => 'accent_color',
            'currency' => 'currency',
            'dailyReminderHour' => 'daily_reminder_hour',
            'dailyReminderMinute' => 'daily_reminder_minute',
            'dailyReminderEnabled' => 'daily_reminder_enabled',
            'budgetAlertEnabled' => 'budget_alert_enabled',
            'flexibleStreakDays' => 'flexible_streak_days',
            'cloudSyncEnabled' => 'cloud_sync_enabled',
        ];

        $attrs = [];
        foreach ($map as $camel => $snake) {
            if (array_key_exists($camel, $data)) {
                $attrs[$snake] = $data[$camel];
            }
        }

        if ($attrs !== []) {
            $settings->update($attrs);
        }

        return response()->apiSuccess(
            data: (new SettingsResource($settings->fresh()))->toArray($request),
        );
    }

    private function resolveSettings(User $user): UserSettings
    {
        $settings = $user->settings()->firstOrCreate(['user_id' => $user->id]);

        // Eloquent doesn't re-read DB-side column defaults after insert, so
        // a freshly-created row has null attributes even though the DB has
        // 'system' / 'usd' / etc. Refresh so the resource sees them.
        if ($settings->wasRecentlyCreated) {
            $settings->refresh();
        }

        return $settings;
    }
}
