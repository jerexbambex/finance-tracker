<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recurring_transactions', function (Blueprint $table) {
            $table->uuid('client_id')->nullable()->after('id');
            $table->softDeletes();
            $table->index(['user_id', 'client_id'], 'recurring_user_client_idx');
            $table->index('updated_at', 'recurring_updated_at_idx');
        });
    }

    public function down(): void
    {
        Schema::table('recurring_transactions', function (Blueprint $table) {
            $table->dropIndex('recurring_user_client_idx');
            $table->dropIndex('recurring_updated_at_idx');
            $table->dropSoftDeletes();
            $table->dropColumn('client_id');
        });
    }
};
