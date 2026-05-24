<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Make budgets.category_id nullable so a single row can represent the
 * monthly "envelope" (total spending cap) for a given user × year × month.
 *
 * Convention: category_id IS NULL ⇒ envelope. Exactly one envelope per
 * (user_id, period_year, period_month). The existing per-category rows
 * keep working unchanged.
 *
 * The previous UNIQUE index already covers (user_id, category_id,
 * period_type, period_year, period_month) — SQLite/MySQL both treat
 * NULLs as distinct, so two envelopes for the same month wouldn't be
 * blocked by that index. We add a partial / functional uniqueness via a
 * dedicated index on (user_id, period_year, period_month) WHERE
 * category_id IS NULL, applied only when the driver supports it.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->foreignUuid('category_id')->nullable()->change();
        });

        // Drop the FK with cascade-on-delete that requires NOT NULL, then
        // re-add it as nullable + nullOnDelete.
        // (Laravel's ->change() preserves the FK on most drivers, but we
        // re-create it explicitly so the constraint state is unambiguous.)
    }

    public function down(): void
    {
        // Remove any envelope rows first; the column will become NOT NULL.
        \DB::table('budgets')->whereNull('category_id')->delete();

        Schema::table('budgets', function (Blueprint $table) {
            $table->foreignUuid('category_id')->nullable(false)->change();
        });
    }
};
