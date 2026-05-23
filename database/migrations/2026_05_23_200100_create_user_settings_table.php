<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stores per-user app preferences synced from the Flutter `AppSettings`
 * model (`margin_app/lib/features/settings/data/models/app_settings.dart`).
 *
 * One row per user (enforced by the unique key). Currency uses the
 * lowercase enum names from the Flutter Currency enum (usd, eur, gbp,
 * sar, aed, ngn) — see SettingsResource for the serialization shape.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('theme_mode', 16)->default('system'); // system, light, dark
            $table->string('accent_color', 32)->default('black');
            $table->string('currency', 8)->default('usd');
            $table->unsignedTinyInteger('daily_reminder_hour')->default(21);
            $table->unsignedTinyInteger('daily_reminder_minute')->default(0);
            $table->boolean('daily_reminder_enabled')->default(false);
            $table->boolean('budget_alert_enabled')->default(true);
            $table->unsignedTinyInteger('flexible_streak_days')->default(5);
            $table->boolean('cloud_sync_enabled')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
