<?php

namespace Database\Factories;

use App\Models\Cabinet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Cabinet>
 */
class CabinetFactory extends Factory
{
    protected $model = Cabinet::class;

    public function definition(): array
    {
        return [
            'name' => 'Cabinet ' . fake()->company(),
            'address' => fake()->streetAddress(),
            'city' => fake()->city(),
            'phone' => fake()->phoneNumber(),
            'plan' => 'free',
        ];
    }
}

