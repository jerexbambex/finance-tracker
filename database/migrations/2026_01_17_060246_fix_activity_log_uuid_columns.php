<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            $table->dropColumn(['subject_id', 'subject_type', 'causer_id', 'causer_type']);
        });

        Schema::table('activity_log', function (Blueprint $table) {
            $table->nullableUuidMorphs('subject', 'subject');
            $table->nullableUuidMorphs('causer', 'causer');
        });
    }

    public function down(): void
    {
        Schema::table('activity_log', function (Blueprint $table) {
            $table->dropColumn(['subject_id', 'subject_type', 'causer_id', 'causer_type']);
        });

        Schema::table('activity_log', function (Blueprint $table) {
            $table->nullableMorphs('subject', 'subject');
            $table->nullableMorphs('causer', 'causer');
        });
    }
};
