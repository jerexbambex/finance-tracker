<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            DefaultCategoriesSeeder::class,
        ]);

        // call the RolesAndPermissionsSeeder to set up roles and permissions
        $this->call(RolesAndPermissionsSeeder::class);
        // call the AdminUserSeeder to create an admin user
        $this->call(AdminUserSeeder::class);
        // call the CategorySeeder to create some sample categories
        //        $this->call(CategorySeeder::class);

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
    }
}
