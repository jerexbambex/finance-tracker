<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * accounts.balance was unsignedBigInteger, but the observer legitimately
     * drives balances negative (expense/transfer-out exceeding funds, credit
     * accounts). On MySQL an unsigned column rejects/wraps negatives; SQLite
     * silently allows them, so tests masked the bug. Make the column signed.
     */
    public function up(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->bigInteger('balance')->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('accounts', function (Blueprint $table) {
            $table->unsignedBigInteger('balance')->default(0)->change();
        });
    }
};
