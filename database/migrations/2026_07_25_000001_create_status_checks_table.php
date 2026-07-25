<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * History of health-check results, one row per component per run.
     * Powers the uptime bars and percentages on the public status page.
     */
    public function up(): void
    {
        Schema::create('status_checks', function (Blueprint $table) {
            $table->id();
            $table->string('component')->index();
            $table->string('status'); // ok | degraded | down
            $table->float('latency_ms')->nullable();
            $table->timestamp('checked_at')->index();

            // Aggregation groups by component + day over a time window.
            $table->index(['component', 'checked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('status_checks');
    }
};
