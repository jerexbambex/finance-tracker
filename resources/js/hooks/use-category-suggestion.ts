import { useEffect, useEffectEvent, useState } from 'react';

interface Options {
    description: string;
    type: string;
    categoryId: string;
    /** Categories the form currently offers; a suggestion outside this list is ignored. */
    categories: { id: string; type: string }[];
    setCategoryId: (id: string) => void;
}

interface Suggestion {
    category_id: string;
    matched: string;
}

const DEBOUNCE_MS = 350;

/**
 * Pre-fills the category from the user's history as they type a description
 * ("Uber" → Transport). A category the user picked themselves is never
 * overwritten; one we filled in is replaced or cleared as the description
 * changes. Returns the past description the suggestion came from while the
 * suggested category is still selected, for an explanatory hint.
 */
export function useCategorySuggestion({ description, type, categoryId, categories, setCategoryId }: Options): string | null {
    const [applied, setApplied] = useState<Suggestion | null>(null);

    // Any category other than the one we filled in is the user's own choice.
    // When it flips, the effect below re-runs and aborts any in-flight request.
    const userChose = categoryId !== '' && categoryId !== applied?.category_id;
    const query = description.trim();

    const handleResult = useEffectEvent((suggestion: Suggestion | null) => {
        if (suggestion && categories.some((c) => c.id === suggestion.category_id && c.type === type)) {
            setApplied(suggestion);
            if (categoryId !== suggestion.category_id) setCategoryId(suggestion.category_id);
        } else if (applied && categoryId === applied.category_id) {
            // Description no longer matches what we filled in — don't leave a stale guess.
            setApplied(null);
            setCategoryId('');
        }
    });

    useEffect(() => {
        if (userChose || query.length < 3) return;

        const controller = new AbortController();
        const timer = setTimeout(() => {
            const params = new URLSearchParams({ description: query, type });
            fetch(`/transactions/suggest-category?${params}`, {
                headers: { Accept: 'application/json' },
                signal: controller.signal,
            })
                .then((r) => (r.ok ? r.json() : null))
                .then((json: { suggestion: Suggestion | null } | null) => {
                    if (json) handleResult(json.suggestion);
                })
                .catch(() => {
                    // Aborted or offline: suggestions are a convenience, never block entry.
                });
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, type, userChose]);

    return applied && categoryId === applied.category_id ? applied.matched : null;
}
