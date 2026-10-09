import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const consent = localStorage.getItem('penniepal_cookie_consent');
        if (!consent) {
            // Slight delay to not overwhelm the user immediately
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const respond = (answer: 'accepted' | 'declined') => {
        localStorage.setItem('penniepal_cookie_consent', answer);
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div
            role="region"
            aria-label="Cookies"
            className="animate-in fade-in slide-in-from-bottom-2 fixed inset-x-4 bottom-4 z-[100] duration-300 motion-reduce:animate-none sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm"
        >
            <div className="rounded-xl border border-border bg-card p-4 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.45)]">
                <p className="text-sm leading-relaxed text-muted-foreground">
                    Penniepal uses cookies to keep you signed in, remember your preferences and measure traffic.{' '}
                    <Link href="/privacy-policy" className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
                        Privacy policy
                    </Link>
                </p>
                <div className="mt-3 flex gap-2">
                    <button
                        type="button"
                        onClick={() => respond('accepted')}
                        className="h-9 flex-1 rounded-lg bg-foreground px-3 text-sm font-medium text-background transition-colors hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        Accept
                    </button>
                    <button
                        type="button"
                        onClick={() => respond('declined')}
                        className="h-9 flex-1 rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                        Decline
                    </button>
                </div>
            </div>
        </div>
    );
}
