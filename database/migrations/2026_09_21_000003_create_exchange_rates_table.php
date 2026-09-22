<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per currency (not per pair): rate_to_usd is how many USD
        // equal 1 unit of that currency, so any currency converts to any
        // other via USD as the pivot without an N^2 table of pairs.
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('currency', 3)->unique();
            $table->decimal('rate_to_usd', 20, 10);
            $table->string('source')->default('manual'); // manual, api
            $table->timestamp('fetched_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};
