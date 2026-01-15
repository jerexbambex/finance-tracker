<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Carbon\Carbon;

class ProcessRecurringTransactions extends Command
{
    protected $signature = 'transactions:process-recurring';
    protected $description = 'Process due recurring transactions and create actual transactions';

    public function handle()
    {
        $dueTransactions = RecurringTransaction::where('is_active', true)
            ->whereDate('next_due_date', '<=', now())
            ->get();

        $processed = 0;

        foreach ($dueTransactions as $recurring) {
            Transaction::create([
                'user_id' => $recurring->user_id,
                'account_id' => $recurring->account_id,
                'category_id' => $recurring->category_id,
                'type' => $recurring->type,
                'amount' => $recurring->amount,
                'description' => $recurring->description . ' (Auto)',
                'transaction_date' => now(),
                'is_recurring' => true,
            ]);

            // Update next due date
            $recurring->next_due_date = $this->calculateNextDueDate(
                $recurring->next_due_date,
                $recurring->frequency
            );
            $recurring->save();

            $processed++;
        }

        $this->info("Processed {$processed} recurring transactions.");
        return 0;
    }

    private function calculateNextDueDate(Carbon $currentDate, string $frequency): Carbon
    {
        return match ($frequency) {
            'daily' => $currentDate->addDay(),
            'weekly' => $currentDate->addWeek(),
            'biweekly' => $currentDate->addWeeks(2),
            'monthly' => $currentDate->addMonth(),
            'quarterly' => $currentDate->addMonths(3),
            'yearly' => $currentDate->addYear(),
            default => $currentDate->addMonth(),
        };
    }
}
