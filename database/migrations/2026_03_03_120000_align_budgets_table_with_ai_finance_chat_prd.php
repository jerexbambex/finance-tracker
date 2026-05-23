<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            if (! Schema::hasColumn('budgets', 'name')) {
                $table->string('name')->nullable()->after('user_id');
            }

            if (! Schema::hasColumn('budgets', 'currency')) {
                $table->string('currency', 3)->default('CAD')->after('amount');
            }

            if (! Schema::hasColumn('budgets', 'period')) {
                $table->enum('period', ['monthly', 'weekly', 'yearly'])->default('monthly')->after('currency');
            }
        });

        Schema::table('budgets', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->foreignUuid('category_id')->nullable()->change();
        });

        Schema::table('budgets', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->nullOnDelete();
        });

        DB::table('budgets')
            ->orderBy('id')
            ->get()
            ->each(function (object $budget): void {
                $period = in_array($budget->period_type, ['monthly', 'weekly', 'yearly'], true)
                    ? $budget->period_type
                    : 'monthly';

                $startDate = $budget->start_date
                    ? Carbon::parse($budget->start_date)
                    : $this->resolveStartDate($budget);

                $endDate = $budget->end_date
                    ? Carbon::parse($budget->end_date)
                    : $this->resolveEndDate($budget, $startDate, $period);

                $categoryName = null;

                if ($budget->category_id) {
                    $categoryName = DB::table('categories')
                        ->where('id', $budget->category_id)
                        ->value('name');
                }

                DB::table('budgets')
                    ->where('id', $budget->id)
                    ->update([
                        'name' => $budget->name ?? $this->resolveName($categoryName, $startDate, $period),
                        'currency' => $budget->currency ?? 'CAD',
                        'period' => $budget->period ?? $period,
                        'start_date' => $startDate->toDateString(),
                        'end_date' => $endDate->toDateString(),
                    ]);
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('budgets', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->foreignUuid('category_id')->nullable(false)->change();
        });

        Schema::table('budgets', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->cascadeOnDelete();
            $table->dropColumn(['name', 'currency', 'period']);
        });
    }

    private function resolveStartDate(object $budget): Carbon
    {
        $year = (int) ($budget->period_year ?: now()->year);
        $month = (int) ($budget->period_month ?: 1);

        return Carbon::create($year, $month, 1)->startOfDay();
    }

    private function resolveEndDate(object $budget, Carbon $startDate, string $period): Carbon
    {
        return match ($period) {
            'weekly' => $startDate->copy()->endOfWeek(),
            'yearly' => Carbon::create((int) ($budget->period_year ?: $startDate->year), 12, 31)->endOfDay(),
            default => $startDate->copy()->endOfMonth()->endOfDay(),
        };
    }

    private function resolveName(?string $categoryName, Carbon $startDate, string $period): string
    {
        $prefix = $categoryName ?: 'General';

        return match ($period) {
            'weekly' => sprintf('%s Budget - Week of %s', $prefix, $startDate->format('M j, Y')),
            'yearly' => sprintf('%s Budget - %s', $prefix, $startDate->format('Y')),
            default => sprintf('%s Budget - %s', $prefix, $startDate->format('M Y')),
        };
    }
};
