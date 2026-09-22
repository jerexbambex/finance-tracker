<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per user/date/currency, storing that currency's raw total
        // (in cents, unconverted) across the user's accounts on that date.
        // Conversion to a single number happens at read time via the current
        // exchange rate, not baked in here.
        Schema::create('net_worth_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->string('currency', 3);
            $table->bigInteger('balance');
            $table->timestamps();

            $table->unique(['user_id', 'date', 'currency']);
            $table->index(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('net_worth_snapshots');
    }
};
