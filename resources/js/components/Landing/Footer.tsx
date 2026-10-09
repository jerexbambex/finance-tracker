import { Link } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

const groups = [
    {
        title: 'Product',
        links: [
            { href: '/#features', label: 'Features' },
            { href: '/#getting-started', label: 'Getting started' },
            { href: '/#pricing', label: 'Pricing' },
        ],
    },
    {
        title: 'Account',
        links: [
            { href: '/login', label: 'Log in', inertia: true },
            { href: '/register', label: 'Create account', inertia: true },
        ],
    },
    {
        title: 'Trust',
        links: [
            { href: '/privacy-policy', label: 'Privacy policy', inertia: true },
            { href: '/status', label: 'Service status', inertia: true },
        ],
    },
];

export default function Footer() {
    return (
        <footer className="border-t border-border bg-background">
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
                <div className="grid gap-10 md:grid-cols-12">
                    <div className="md:col-span-5">
                        <Link href="/" className="inline-flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <AppLogoIcon className="h-4 w-4" />
                            </span>
                            <span className="font-display text-lg font-semibold tracking-tight text-foreground">Penniepal</span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
                            A personal ledger for accounts, budgets, goals and bills.
                        </p>
                    </div>

                    <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
                        {groups.map((group) => (
                            <div key={group.title}>
                                <h2 className="text-sm font-medium text-foreground">{group.title}</h2>
                                <ul className="mt-3 space-y-2.5">
                                    {group.links.map((link) => (
                                        <li key={link.href}>
                                            {'inertia' in link ? (
                                                <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                                    {link.label}
                                                </Link>
                                            ) : (
                                                <a href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                                                    {link.label}
                                                </a>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>

                <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">© {new Date().getFullYear()} Penniepal</p>
            </div>
        </footer>
    );
}
