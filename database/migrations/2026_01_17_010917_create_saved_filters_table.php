<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('saved_filters', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('type')->default('transaction'); // transaction, budget, etc.
            $table->json('filters');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_filters');
    }
};
