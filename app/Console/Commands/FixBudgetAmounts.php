<?php

namespace App\Console\Commands;

use App\Models\Budget;
use Illuminate\Console\Command;

class FixBudgetAmounts extends Command
{
    protected $signature = 'budgets:fix-amounts';

    protected $description = 'Fix budget amounts that were stored incorrectly (multiply by 100)';

    public function handle()
    {
        $budgets = Budget::where('amount', '<', 10000)->get();

        if ($budgets->isEmpty()) {
            $this->info('No budgets need fixing.');

            return 0;
        }

        $this->info("Found {$budgets->count()} budgets with amounts less than $100 (likely incorrect).");

        if (! $this->confirm('Do you want to multiply these amounts by 100?')) {
            $this->info('Cancelled.');

            return 0;
        }

        foreach ($budgets as $budget) {
            $oldAmount = $budget->amount;
            $budget->amount = $budget->amount * 100;
            $budget->save();

            $this->line("Fixed budget ID {$budget->id}: ${$oldAmount / 100} -> ${$budget->amount / 100}");
        }

        $this->info('Done!');

        return 0;
    }
}
