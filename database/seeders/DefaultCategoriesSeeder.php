<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DefaultCategoriesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Income Categories
            ['name' => 'Salary', 'type' => 'income', 'color' => '#10b981'],
            ['name' => 'Freelance', 'type' => 'income', 'color' => '#059669'],
            ['name' => 'Investment Returns', 'type' => 'income', 'color' => '#047857'],
            ['name' => 'Business Income', 'type' => 'income', 'color' => '#065f46'],
            ['name' => 'Other Income', 'type' => 'income', 'color' => '#064e3b'],

            // Expense Categories
            ['name' => 'Housing', 'type' => 'expense', 'color' => '#ef4444'],
            ['name' => 'Transportation', 'type' => 'expense', 'color' => '#dc2626'],
            ['name' => 'Food & Dining', 'type' => 'expense', 'color' => '#b91c1c'],
            ['name' => 'Healthcare', 'type' => 'expense', 'color' => '#991b1b'],
            ['name' => 'Entertainment', 'type' => 'expense', 'color' => '#7f1d1d'],
            ['name' => 'Shopping', 'type' => 'expense', 'color' => '#f97316'],
            ['name' => 'Personal Care', 'type' => 'expense', 'color' => '#ea580c'],
            ['name' => 'Education', 'type' => 'expense', 'color' => '#c2410c'],
            ['name' => 'Insurance', 'type' => 'expense', 'color' => '#9a3412'],
            ['name' => 'Taxes', 'type' => 'expense', 'color' => '#7c2d12'],
            ['name' => 'Savings & Investments', 'type' => 'expense', 'color' => '#3b82f6'],
            ['name' => 'Debt Payments', 'type' => 'expense', 'color' => '#1d4ed8'],
            ['name' => 'Miscellaneous', 'type' => 'expense', 'color' => '#6b7280'],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create($category + ['user_id' => null]); // Global categories
        }
    }
}
