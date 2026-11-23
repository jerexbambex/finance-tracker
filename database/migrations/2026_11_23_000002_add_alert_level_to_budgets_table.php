<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Highest alert already sent for this budget's period (see BudgetAlerts),
     * so each level is notified once rather than on every transaction.
     */
    public function up(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->unsignedTinyInteger('alert_level')->default(0)->after('auto_rollover');
        });
    }

    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropColumn('alert_level');
        });
    }
};
