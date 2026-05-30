<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Validation\Rule;

/**
 * Validation rules that confine foreign-key references to records the
 * authenticated user is allowed to reference, preventing cross-user (IDOR)
 * references through plain `exists:` checks.
 */
trait ScopesOwnership
{
    /**
     * Account must belong to the current user.
     */
    protected function ownedAccountExists(): \Illuminate\Validation\Rules\Exists
    {
        return Rule::exists('accounts', 'id')->where('user_id', auth()->id());
    }

    /**
     * Category must be the user's own OR a global (system) category.
     */
    protected function ownedCategoryExists(): \Illuminate\Validation\Rules\Exists
    {
        return Rule::exists('categories', 'id')->where(function ($query) {
            $query->where('user_id', auth()->id())->orWhereNull('user_id');
        });
    }
}
