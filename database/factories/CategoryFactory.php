<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => $this->faker->word(),
            'type' => 'expense',
            'is_active' => true,
        ];
    }

    /**
     * A global (system) category not owned by any user.
     */
    public function global(): static
    {
        return $this->state(['user_id' => null]);
    }
}
