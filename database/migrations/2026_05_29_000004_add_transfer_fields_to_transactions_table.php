<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            // Links the two legs of a transfer so they can be reversed together.
            $table->uuid('transfer_group_id')->nullable()->after('type');
            // 'out' decrements the account, 'in' increments it — lets the observer
            // own transfer balance effects instead of TransferController doing it manually.
            $table->string('transfer_direction')->nullable()->after('transfer_group_id');
            $table->index('transfer_group_id');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['transfer_group_id']);
            $table->dropColumn(['transfer_group_id', 'transfer_direction']);
        });
    }
};
