<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            // Opt a single budget out of the monthly carry-forward.
            $table->boolean('auto_rollover')->default(true)->after('is_active');

            // Set once a budget has produced its successor period, so a daily
            // rollover run never resurrects a copy the user deleted on purpose.
            $table->timestamp('rolled_over_at')->nullable()->after('auto_rollover');
        });
    }

    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropColumn(['auto_rollover', 'rolled_over_at']);
        });
    }
};
