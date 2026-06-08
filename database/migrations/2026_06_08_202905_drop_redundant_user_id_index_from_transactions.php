<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // The standalone user_id index is redundant: its lookups (and the user_id
        // foreign key) are served by the leftmost prefix of the (user_id,
        // transaction_date) and (user_id, client_id) composite indexes.
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex('transactions_user_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->index('user_id', 'transactions_user_id_index');
        });
    }
};
