<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Holds the setup-checklist choices that can't be derived from the user's
     * data: whether they confirmed their currency (base_currency defaults to
     * USD, so its value alone says nothing) and whether they hid the checklist.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('onboarding')->nullable()->after('base_currency');
        });

        // People already using the app are past onboarding; don't greet them
        // with a checklist. Anyone who has created an account counts.
        $now = now()->toIso8601String();
        DB::table('users')
            ->whereExists(fn ($q) => $q->select(DB::raw(1))->from('accounts')->whereColumn('accounts.user_id', 'users.id'))
            ->update(['onboarding' => json_encode(['currency_confirmed_at' => $now, 'dismissed_at' => $now])]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('onboarding');
        });
    }
};
