<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Accounts already have currency column, just ensure transactions inherit it
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('currency', 3)->default('USD')->after('amount');
        });

        Schema::table('budgets', function (Blueprint $table) {
            $table->string('currency', 3)->default('USD')->after('amount');
        });

        Schema::table('goals', function (Blueprint $table) {
            $table->string('currency', 3)->default('USD')->after('target_amount');
        });

        Schema::table('reminders', function (Blueprint $table) {
            $table->string('currency', 3)->default('USD')->after('amount');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('currency');
        });

        Schema::table('budgets', function (Blueprint $table) {
            $table->dropColumn('currency');
        });

        Schema::table('goals', function (Blueprint $table) {
            $table->dropColumn('currency');
        });

        Schema::table('reminders', function (Blueprint $table) {
            $table->dropColumn('currency');
        });
    }
};
