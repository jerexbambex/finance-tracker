<?php

namespace App\Services;

use App\Models\User;

/**
 * Suggests a category for a new transaction from the user's own history:
 * if "Uber" was filed under Transport last time, suggest Transport again.
 *
 * Descriptions are normalised (lowercased, digits and punctuation dropped) so
 * "UBER *TRIP 4821" and "Uber trip" are treated as the same payee. An exact
 * normalised match wins; otherwise the first meaningful word is used
 * ("POS Shoprite Ikeja" matches "Shoprite Lekki"). The most recent match wins in both cases, so a
 * user re-categorising a payee changes future suggestions straight away.
 */
class CategorySuggester
{
    /** How far back to look. Recent history is what reflects current habits. */
    private const HISTORY_LIMIT = 500;

    private const MIN_KEYWORD_LENGTH = 3;

    /**
     * Bank-statement boilerplate that says nothing about the payee. Without
     * this, "POS purchase Shoprite" and "POS purchase Uber" would share a keyword.
     */
    private const NOISE_WORDS = [
        'the', 'and', 'for', 'from', 'with', 'pos', 'purchase', 'payment', 'pmt',
        'transfer', 'trf', 'debit', 'credit', 'card', 'online', 'web', 'www', 'com',
        'bill', 'fee', 'charge', 'paid', 'pay', 'via', 'ref', 'txn', 'nip', 'ussd',
    ];

    /**
     * @return array{category_id: string, matched: string}|null
     */
    public function suggest(User $user, string $description, string $type): ?array
    {
        $needle = $this->normalise($description);
        if (mb_strlen($needle) < self::MIN_KEYWORD_LENGTH) {
            return null;
        }
        $needleKeyword = $this->keyword($needle);

        $keywordMatch = null;

        foreach ($this->history($user, $type) as $row) {
            $candidate = $row['normalised'];

            if ($candidate === $needle) {
                return ['category_id' => $row['category_id'], 'matched' => $row['description']];
            }

            if ($keywordMatch === null && $needleKeyword !== null && $this->keyword($candidate) === $needleKeyword) {
                $keywordMatch = ['category_id' => $row['category_id'], 'matched' => $row['description']];
            }
        }

        return $keywordMatch;
    }

    /**
     * Loaded once per user and type for the lifetime of this instance, so a
     * CSV import can suggest for hundreds of rows with a single query.
     *
     * @var array<string, list<array{description: string, category_id: string, normalised: string}>>
     */
    private array $history = [];

    /**
     * @return list<array{description: string, category_id: string, normalised: string}>
     */
    private function history(User $user, string $type): array
    {
        return $this->history[$user->id.':'.$type] ??= $user->transactions()
            ->where('transactions.type', $type)
            ->whereNotNull('transactions.category_id')
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->where('categories.is_active', true)
            ->orderByDesc('transactions.transaction_date')
            ->orderByDesc('transactions.created_at')
            ->limit(self::HISTORY_LIMIT)
            ->get(['transactions.description', 'transactions.category_id'])
            ->map(fn ($row) => [
                'description' => (string) $row->description,
                'category_id' => (string) $row->category_id,
                'normalised' => $this->normalise((string) $row->description),
            ])
            ->all();
    }

    private function normalise(string $description): string
    {
        $letters = preg_replace('/[^\p{L}]+/u', ' ', mb_strtolower($description));

        return trim(preg_replace('/\s+/', ' ', $letters));
    }

    private function keyword(string $normalised): ?string
    {
        foreach (explode(' ', $normalised) as $word) {
            if (mb_strlen($word) >= self::MIN_KEYWORD_LENGTH && ! in_array($word, self::NOISE_WORDS, true)) {
                return $word;
            }
        }

        return null;
    }
}
