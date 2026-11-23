import { Sparkles } from 'lucide-react';

/** Explains an auto-filled category so it never feels like a silent guess. */
export function CategorySuggestionHint({ matched }: { matched: string | null }) {
    if (!matched) return null;

    return (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground" aria-live="polite">
            <Sparkles className="h-3 w-3 shrink-0 text-primary" />
            <span className="truncate">
                Suggested — you used this for &ldquo;{matched}&rdquo;
            </span>
        </p>
    );
}
