<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per page view, powering the admin panel's visits/visitors
     * widgets. No raw IP or user identity is stored — see RecordPageVisit
     * for how visitor_hash is derived — matching the "anonymous telemetry"
     * already disclosed in the privacy policy and cookie banner.
     */
    public function up(): void
    {
        Schema::create('page_visits', function (Blueprint $table) {
            $table->id();
            $table->string('path', 2048);
            $table->string('route_name')->nullable();
            $table->string('visitor_hash', 64);
            $table->boolean('is_authenticated')->default(false);
            $table->timestamp('visited_at');

            $table->index('visited_at');
            $table->index(['route_name', 'visited_at']);
            $table->index(['visitor_hash', 'visited_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_visits');
    }
};
