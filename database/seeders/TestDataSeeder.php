<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Goal;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'admin@example.com')->first();

        if (! $user) {
            return;
        }

        // Create accounts
        $checking = Account::create([
            'user_id' => $user->id,
            'name' => 'Main Checking',
            'type' => 'checking',
            'balance' => 500000,
            'currency' => 'USD',
            'is_active' => true,
        ]);

        $savings = Account::create([
            'user_id' => $user->id,
            'name' => 'Emergency Fund',
            'type' => 'savings',
            'balance' => 1000000,
            'currency' => 'USD',
            'is_active' => true,
        ]);

        // Get categories
        $salary = Category::where('name', 'Salary')->first();
        $housing = Category::where('name', 'Housing')->first();
        $food = Category::where('name', 'Food & Dining')->first();
        $transport = Category::where('name', 'Transportation')->first();

        // Create transactions
        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $checking->id,
            'category_id' => $salary->id,
            'type' => 'income',
            'amount' => 500000,
            'description' => 'Monthly salary',
            'transaction_date' => now()->startOfMonth(),
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $checking->id,
            'category_id' => $housing->id,
            'type' => 'expense',
            'amount' => 150000,
            'description' => 'Rent payment',
            'transaction_date' => now()->startOfMonth()->addDays(1),
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $checking->id,
            'category_id' => $food->id,
            'type' => 'expense',
            'amount' => 45000,
            'description' => 'Groceries',
            'transaction_date' => now()->subDays(5),
        ]);

        Transaction::create([
            'user_id' => $user->id,
            'account_id' => $checking->id,
            'category_id' => $transport->id,
            'type' => 'expense',
            'amount' => 8000,
            'description' => 'Gas',
            'transaction_date' => now()->subDays(3),
        ]);

        // Create budgets
        Budget::create([
            'user_id' => $user->id,
            'category_id' => $housing->id,
            'amount' => 150000,
            'period_type' => 'monthly',
            'period_year' => now()->year,
            'period_month' => now()->month,
            'is_active' => true,
        ]);

        Budget::create([
            'user_id' => $user->id,
            'category_id' => $food->id,
            'amount' => 60000,
            'period_type' => 'monthly',
            'period_year' => now()->year,
            'period_month' => now()->month,
            'is_active' => true,
        ]);

        Budget::create([
            'user_id' => $user->id,
            'category_id' => $transport->id,
            'amount' => 20000,
            'period_type' => 'monthly',
            'period_year' => now()->year,
            'period_month' => now()->month,
            'is_active' => true,
        ]);

        // Create goals
        Goal::create([
            'user_id' => $user->id,
            'name' => 'Emergency Fund',
            'description' => 'Save 6 months of expenses',
            'target_amount' => 2000000,
            'current_amount' => 1000000,
            'target_date' => now()->addYear(),
            'category' => 'Savings',
            'is_completed' => false,
            'is_active' => true,
        ]);

        Goal::create([
            'user_id' => $user->id,
            'name' => 'Vacation Fund',
            'description' => 'Summer vacation to Europe',
            'target_amount' => 500000,
            'current_amount' => 150000,
            'target_date' => now()->addMonths(6),
            'category' => 'Travel',
            'is_completed' => false,
            'is_active' => true,
        ]);
    }
}
