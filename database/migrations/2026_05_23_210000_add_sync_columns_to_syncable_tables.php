<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the columns each sync-eligible table needs for last-write-wins
 * sync against the Flutter client:
 *
 *   - client_id: UUID assigned by the device when it first creates the
 *     row locally. Lets the device push a row before it knows the server
 *     UUID, and lets the server dedupe a re-pushed row from the same
 *     client. Indexed by (user_id, client_id) so lookups during push are
 *     a single index hit.
 *   - deleted_at: soft delete so deletes can propagate via pull.
 *
 * `updated_at` already exists on every Eloquent table — we reuse it as
 * the conflict tie-breaker.
 *
 * Also adds users.last_synced_at so /sync/status can report a baseline.
 */
return new class extends Migration
{
    /**
     * @var list<string>
     */
    private array $tables = ['transactions', 'categories', 'budgets', 'goals'];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $tableBlueprint) use ($table) {
                $tableBlueprint->uuid('client_id')->nullable()->after('id');
                $tableBlueprint->softDeletes();
                $tableBlueprint->index(['user_id', 'client_id'], $table.'_user_client_idx');
                $tableBlueprint->index('updated_at', $table.'_updated_at_idx');
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_synced_at')->nullable()->after('subscription_expires_at');
        });
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $tableBlueprint) use ($table) {
                $tableBlueprint->dropIndex($table.'_user_client_idx');
                $tableBlueprint->dropIndex($table.'_updated_at_idx');
                $tableBlueprint->dropSoftDeletes();
                $tableBlueprint->dropColumn('client_id');
            });
        }

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('last_synced_at');
        });
    }
};
