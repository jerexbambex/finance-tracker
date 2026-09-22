<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // The currency net worth is converted into. Defaults to USD; a
            // user with only one currency in play never needs to touch it.
            $table->string('base_currency', 3)->default('USD')->after('email_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('base_currency');
        });
    }
};
