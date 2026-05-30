<?php

namespace App\Providers;

use App\Models\GoalContribution;
use App\Models\Transaction;
use App\Observers\GoalContributionObserver;
use App\Observers\TransactionObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        Transaction::observe(TransactionObserver::class);
        GoalContribution::observe(GoalContributionObserver::class);
    }
}
