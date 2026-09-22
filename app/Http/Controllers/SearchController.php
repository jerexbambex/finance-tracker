<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

/**
 * Backs the global command-palette search (Cmd/Ctrl+K). Every query is
 * scoped to the authenticated user via their relations — nothing here
 * queries a bare model, so there's no way to reach another user's data.
 */
class SearchController extends Controller
{
    private const PER_TYPE_LIMIT = 5;

    public function index(Request $request)
    {
        $query = trim((string) $request->input('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json([
                'transactions' => [],
                'accounts' => [],
                'budgets' => [],
                'goals' => [],
                'categories' => [],
            ]);
        }

        $user = $request->user();
        $like = $this->likeTerm($query);

        $transactions = $user->transactions()
            ->whereRaw("description LIKE ? ESCAPE '\\'", [$like])
            ->latest('transaction_date')
            ->limit(self::PER_TYPE_LIMIT)
            ->get(['id', 'description', 'amount', 'currency', 'transaction_date', 'type'])
            ->map(fn ($t) => [
                'id' => $t->id,
                'label' => $t->description,
                'meta' => $t->transaction_date->format('M j, Y'),
                'amount' => $t->amount,
                'currency' => $t->currency,
                'type' => $t->type,
            ]);

        $accounts = $user->accounts()
            ->whereRaw("name LIKE ? ESCAPE '\\'", [$like])
            ->limit(self::PER_TYPE_LIMIT)
            ->get(['id', 'name', 'type', 'currency', 'balance'])
            ->map(fn ($a) => [
                'id' => $a->id,
                'label' => $a->name,
                'meta' => ucfirst(str_replace('_', ' ', $a->type)),
                'amount' => $a->balance,
                'currency' => $a->currency,
            ]);

        $budgets = $user->budgets()
            ->with('category')
            ->whereHas('category', fn ($q) => $q->whereRaw("name LIKE ? ESCAPE '\\'", [$like]))
            ->limit(self::PER_TYPE_LIMIT)
            ->get()
            ->map(fn ($b) => [
                'id' => $b->id,
                'label' => $b->category->name,
                'meta' => $b->period_type === 'yearly' ? "{$b->period_year} · Yearly" : "{$b->period_year}-{$b->period_month}",
                'amount' => $b->amount,
                'currency' => $b->currency,
            ]);

        $goals = $user->goals()
            ->whereRaw("name LIKE ? ESCAPE '\\'", [$like])
            ->limit(self::PER_TYPE_LIMIT)
            ->get(['id', 'name', 'target_amount', 'currency'])
            ->map(fn ($g) => [
                'id' => $g->id,
                'label' => $g->name,
                'meta' => 'Goal',
                'amount' => $g->target_amount,
                'currency' => $g->currency,
            ]);

        $categories = Category::where(function ($q) use ($user) {
            $q->whereNull('user_id')->orWhere('user_id', $user->id);
        })
            ->whereRaw("name LIKE ? ESCAPE '\\'", [$like])
            ->limit(self::PER_TYPE_LIMIT)
            ->get(['id', 'name', 'type'])
            ->map(fn ($c) => [
                'id' => $c->id,
                'label' => $c->name,
                'meta' => ucfirst($c->type),
            ]);

        return response()->json([
            'transactions' => $transactions,
            'accounts' => $accounts,
            'budgets' => $budgets,
            'goals' => $goals,
            'categories' => $categories,
        ]);
    }

    /**
     * Escape LIKE's own wildcards so a literal '%' or '_' in the search term
     * is matched literally instead of acting as a wildcard. Paired with an
     * explicit `ESCAPE '\'` on every query that uses this: MySQL treats
     * backslash as the LIKE escape character by default, but SQLite (what
     * the test suite runs on) does not, so it must be spelled out to behave
     * the same on both.
     */
    private function likeTerm(string $term): string
    {
        return '%'.str_replace(['\\', '%', '_'], ['\\\\', '\%', '\_'], $term).'%';
    }
}
