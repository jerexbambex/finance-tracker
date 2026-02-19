import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Wallet, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SharedData } from '@/types';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';


export default function Navbar() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled || mobileMenuOpen
                ? 'border-b bg-background/80 backdrop-blur-xl py-2'
                : 'bg-transparent py-4'
                }`}
        >
            <div className="container mx-auto flex max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-blue-500/20">
                        <Wallet className="h-5 w-5" strokeWidth={2} />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        Budget App
                    </span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
                    <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How it Works</a>
                    <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Stories</a>
                    <a href="#security" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Security</a>
                </nav>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-4">
                    <AppearanceToggleDropdown />

                    {auth.user ? (
                        <Link
                            href="/dashboard"
                            className="h-10 inline-flex items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-md hover:shadow-lg"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="group h-10 inline-flex items-center justify-center rounded-lg bg-foreground px-5 text-sm font-bold text-background hover:bg-foreground/90 transition-all"
                            >
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b bg-background/95 backdrop-blur-xl"
                    >
                        <div className="container mx-auto px-6 py-6 space-y-4 flex flex-col">
                            <a href="#features" className="text-base font-medium py-2 border-b border-border/50" onClick={() => setMobileMenuOpen(false)}>Features</a>
                            <a href="#how-it-works" className="text-base font-medium py-2 border-b border-border/50" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
                            <a href="#testimonials" className="text-base font-medium py-2 border-b border-border/50" onClick={() => setMobileMenuOpen(false)}>Stories</a>

                            <div className="pt-4 flex flex-col gap-3">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="h-12 flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold"
                                    >
                                        Go to Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="h-12 flex items-center justify-center rounded-xl border border-border font-bold"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="h-12 flex items-center justify-center rounded-xl bg-foreground text-background font-bold"
                                        >
                                            Get Started Free
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
