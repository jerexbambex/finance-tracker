<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const UNCATEGORIZED_SCOPE = '00000000-0000-0000-0000-000000000000';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('budgets', 'category_scope')) {
            Schema::table('budgets', function (Blueprint $table) {
                $table->string('category_scope', 36)
                    ->default(self::UNCATEGORIZED_SCOPE)
                    ->after('category_id');
            });
        }

        DB::table('budgets')->update([
            'category_scope' => DB::raw("COALESCE(category_id, '".self::UNCATEGORIZED_SCOPE."')"),
        ]);

        Schema::table('budgets', function (Blueprint $table) {
            $table->unique(
                ['user_id', 'period', 'start_date', 'end_date', 'category_scope'],
                'budgets_idempotency_unique'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropUnique('budgets_idempotency_unique');
        });

        if (Schema::hasColumn('budgets', 'category_scope')) {
            Schema::table('budgets', function (Blueprint $table) {
                $table->dropColumn('category_scope');
            });
        }
    }
};
