<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Guarded: some environments already have this column added outside
        // migrations (see the app's schema-drift note), so this must be a
        // no-op there rather than fail, while still creating it on a clean
        // install/CI/production.
        if (Schema::hasColumn('goals', 'currency')) {
            return;
        }

        Schema::table('goals', function (Blueprint $table) {
            // Goals had no currency at all, so every goal silently displayed
            // as USD regardless of which account it was actually saving
            // toward. Default 'USD' backfills existing rows to match that
            // prior (implicit) behavior exactly, so nothing changes for them.
            $table->string('currency', 3)->default('USD')->after('current_amount');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('goals', 'currency')) {
            return;
        }

        Schema::table('goals', function (Blueprint $table) {
            $table->dropColumn('currency');
        });
    }
};
