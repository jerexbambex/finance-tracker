<?php

namespace App\Services;

use App\Models\User;

/**
 * The dashboard's "get set up" checklist. Each step is complete when the
 * user's data says so (an account exists, a budget exists, …), so the list
 * can't drift out of sync with what they've actually done. Only currency
 * confirmation and dismissal are stored, in users.onboarding.
 */
class OnboardingChecklist
{
    /**
     * Null when there's nothing to show: dismissed, or every step done.
     *
     * @return array{steps: list<array<string, mixed>>, completed: int, total: int}|null
     */
    public function for(User $user): ?array
    {
        $state = $user->onboarding ?? [];
        if (! empty($state['dismissed_at'])) {
            return null;
        }

        $steps = [
            [
                'id' => 'currency',
                'title' => 'Choose your main currency',
                'description' => 'Totals and net worth are shown in this currency.',
                'done' => ! empty($state['currency_confirmed_at']),
                'href' => null,
                'action' => null,
            ],
            [
                'id' => 'account',
                'title' => 'Add an account',
                'description' => 'A bank account, card, wallet or cash, with its current balance.',
                'done' => $user->accounts()->exists(),
                'href' => '/accounts/create',
                'action' => 'Add account',
            ],
            [
                'id' => 'transaction',
                'title' => 'Record your spending',
                'description' => 'Add a transaction, or import a CSV statement from your bank.',
                // Opening balances are created with the account, so they don't count.
                'done' => $user->transactions()->where('type', '!=', 'opening')->exists(),
                'href' => '/transactions/create',
                'action' => 'Add transaction',
                'secondary' => ['href' => '/import/transactions', 'action' => 'Import CSV'],
            ],
            [
                'id' => 'budget',
                'title' => 'Set a monthly budget',
                'description' => 'Pick a category and a limit. We’ll warn you before you go over.',
                'done' => $user->budgets()->exists(),
                'href' => '/budgets/create',
                'action' => 'Create budget',
            ],
            [
                'id' => 'goal',
                'title' => 'Start a savings goal',
                'description' => 'An emergency fund, a trip, a new laptop — anything you’re saving for.',
                'done' => $user->goals()->exists(),
                'href' => '/goals/create',
                'action' => 'Add goal',
            ],
        ];

        $completed = count(array_filter($steps, fn ($s) => $s['done']));

        // Everything done: the checklist has served its purpose.
        if ($completed === count($steps)) {
            return null;
        }

        return ['steps' => $steps, 'completed' => $completed, 'total' => count($steps)];
    }
}
