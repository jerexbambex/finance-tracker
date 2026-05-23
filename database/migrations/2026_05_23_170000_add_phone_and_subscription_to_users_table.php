<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone_number')->nullable()->unique()->after('email');
            $table->string('subscription_tier')->default('free')->after('phone_number');
            $table->timestamp('premium_since')->nullable()->after('subscription_tier');
            $table->timestamp('subscription_expires_at')->nullable()->after('premium_since');
        });

        // Email must remain present for existing web/Fortify users, but
        // mobile users register with phone_number only. Drop the NOT NULL
        // constraint while preserving the unique index.
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('email')->nullable(false)->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['phone_number']);
            $table->dropColumn([
                'phone_number',
                'subscription_tier',
                'premium_since',
                'subscription_expires_at',
            ]);
        });
    }
};
