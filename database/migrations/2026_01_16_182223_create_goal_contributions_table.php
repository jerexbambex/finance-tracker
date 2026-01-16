<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goal_contributions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('goal_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->integer('amount'); // in cents
            $table->text('note')->nullable();
            $table->date('contribution_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goal_contributions');
    }
};
