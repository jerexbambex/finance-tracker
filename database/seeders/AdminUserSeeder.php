<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL', 'admin@example.com');
        
        // Check if admin already exists
        $existingAdmin = User::where('email', $email)->first();
        
        if ($existingAdmin && $existingAdmin->hasRole('admin')) {
            $this->command->info('Admin user already exists with admin role.');
            return;
        }

        if ($existingAdmin) {
            $existingAdmin->assignRole('admin');
            $this->command->info('Admin role assigned to existing user.');
            return;
        }

        $admin = User::create([
            'name' => env('ADMIN_NAME', 'Admin'),
            'email' => $email,
            'password' => Hash::make(env('ADMIN_PASSWORD', 'password')),
            'email_verified_at' => now(),
        ]);

        $admin->assignRole('admin');

        $this->command->info('Admin user created successfully with admin role.');
    }
}
