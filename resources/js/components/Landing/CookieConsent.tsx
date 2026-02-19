import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already consented
        const consent = localStorage.getItem('budgetapp_cookie_consent');
        if (!consent) {
            // Slight delay to not overwhelm the user immediately
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('budgetapp_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('budgetapp_cookie_consent', 'declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[100] md:max-w-[400px]"
                >
                    <div className="bg-card/85 backdrop-blur-2xl border border-border/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                        {/* Subtle glow */}
                        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />

                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="flex items-center gap-2.5 text-foreground font-semibold">
                                <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center">
                                    <Cookie className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-base">Cookie Consent</h3>
                            </div>
                            <button
                                onClick={handleDecline}
                                className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-md transition-colors"
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="text-sm text-muted-foreground mb-5 leading-relaxed relative z-10">
                            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                            {' '}<Link href="/privacy-policy" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">Read our Privacy Policy</Link>.
                        </p>

                        <div className="flex items-center gap-3 relative z-10">
                            <button
                                onClick={handleAccept}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Accept All
                            </button>
                            <button
                                onClick={handleDecline}
                                className="flex-1 bg-muted hover:bg-muted/80 text-foreground text-sm font-medium py-2.5 px-4 rounded-xl transition-colors border border-border"
                            >
                                Decline
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
