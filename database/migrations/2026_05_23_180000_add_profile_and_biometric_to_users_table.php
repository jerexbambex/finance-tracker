<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('first_name')->nullable()->after('name');
            $table->string('last_name')->nullable()->after('first_name');
            $table->string('goal')->nullable()->after('last_name');
            $table->boolean('biometric_enabled')->default(false)->after('goal');
            $table->string('biometric_token_hash')->nullable()->after('biometric_enabled');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'first_name',
                'last_name',
                'goal',
                'biometric_enabled',
                'biometric_token_hash',
            ]);
        });
    }
};
