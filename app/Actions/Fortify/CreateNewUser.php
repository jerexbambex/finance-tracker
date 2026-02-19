<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Notifications\WelcomeNotification;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255', 'regex:/^[\pL\s\-\.]+$/u'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ], [
            'name.regex' => 'The name may only contain letters, spaces, hyphens, and periods.',
        ])->validate();

        $user = User::create([
            'name' => strip_tags($input['name']),
            'email' => $input['email'],
            'password' => $input['password'],
        ]);

        $user->notify(new WelcomeNotification());

        return $user;
    }
}
