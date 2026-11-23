<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Highest progress milestone (25/50/75/100) already announced for the
     * goal, so each is celebrated once (see GoalMilestones).
     */
    public function up(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->unsignedTinyInteger('milestone_notified')->default(0)->after('is_completed');
        });

        // Don't announce milestones existing goals passed before this shipped.
        foreach ([25, 50, 75, 100] as $milestone) {
            DB::table('goals')
                ->where('target_amount', '>', 0)
                ->whereRaw('current_amount * 100 >= target_amount * ?', [$milestone])
                ->update(['milestone_notified' => $milestone]);
        }
    }

    public function down(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->dropColumn('milestone_notified');
        });
    }
};
