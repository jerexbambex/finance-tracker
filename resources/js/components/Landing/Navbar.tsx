import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { type SharedData } from '@/types';

import { useActiveSection } from './motion';

const links = [
    { href: '/#features', label: 'Features' },
    { href: '/#getting-started', label: 'Getting started' },
    { href: '/#privacy', label: 'Privacy' },
    { href: '/#pricing', label: 'Pricing' },
];

export default function Navbar() {
    const { auth, canRegister = true } = usePage<SharedData & { canRegister?: boolean }>().props;
    const user = auth?.user;
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const active = useActiveSection(links.map((link) => link.href.replace('/#', '')));

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 z-50 w-full border-b transition-colors duration-200 ${
                scrolled || open ? 'border-border bg-background/90 backdrop-blur-md' : 'border-transparent bg-transparent'
            }`}
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
                <Link href="/" className="group flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105 motion-reduce:transform-none">
                        <AppLogoIcon className="h-4 w-4" />
                    </span>
                    <span className="font-display text-lg font-semibold tracking-tight text-foreground">Penniepal</span>
                </Link>

                <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
                    {links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            aria-current={active === link.href.replace('/#', '') ? 'location' : undefined}
                            className="group relative py-1 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current]:text-foreground"
                        >
                            {link.label}
                            <span
                                aria-hidden="true"
                                className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-foreground transition-transform duration-200 group-hover:scale-x-100 group-aria-[current]:scale-x-100 motion-reduce:transition-none"
                            />
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <AppearanceToggleDropdown />
                    {user ? (
                        <Link
                            href="/dashboard"
                            className="inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition hover:bg-foreground/85 active:scale-[0.97]"
                        >
                            Open dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                            >
                                Log in
                            </Link>
                            {canRegister && (
                                <Link
                                    href="/register"
                                    className="inline-flex h-9 items-center rounded-lg bg-foreground px-4 text-sm font-medium text-background transition hover:bg-foreground/85 active:scale-[0.97]"
                                >
                                    Create account
                                </Link>
                            )}
                        </>
                    )}
                </div>

                <button
                    type="button"
                    className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground md:hidden"
                    aria-expanded={open}
                    aria-controls="landing-mobile-menu"
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    onClick={() => setOpen(!open)}
                >
                    {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            {open && (
                <div id="landing-mobile-menu" className="border-t border-border bg-background md:hidden">
                    <div className="mx-auto flex max-w-6xl flex-col px-5 py-4 sm:px-8">
                        {links.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="border-b border-border/60 py-3 text-base text-foreground"
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="flex flex-col gap-2 pt-5">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="flex h-11 items-center justify-center rounded-lg bg-foreground text-sm font-medium text-background"
                                >
                                    Open dashboard
                                </Link>
                            ) : (
                                <>
                                    {canRegister && (
                                        <Link
                                            href="/register"
                                            className="flex h-11 items-center justify-center rounded-lg bg-foreground text-sm font-medium text-background"
                                        >
                                            Create account
                                        </Link>
                                    )}
                                    <Link
                                        href="/login"
                                        className="flex h-11 items-center justify-center rounded-lg border border-border text-sm font-medium text-foreground"
                                    >
                                        Log in
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
