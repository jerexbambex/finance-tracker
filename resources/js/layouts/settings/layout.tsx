import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { User, Lock, ShieldCheck, Palette, Database } from 'lucide-react';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useActiveUrl } from '@/hooks/use-active-url';
import { cn, toUrl } from '@/lib/utils';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';
import { type NavItem } from '@/types';

const sidebarNavItems: Array<{ title: string; href: any; icon: any }> = [
    {
        title: 'Profile',
        href: edit(),
        icon: User,
    },
    {
        title: 'Password',
        href: editPassword(),
        icon: Lock,
    },
    {
        title: 'Two-Factor Auth',
        href: show(),
        icon: ShieldCheck,
    },
    {
        title: 'Appearance',
        href: editAppearance(),
        icon: Palette,
    },
    {
        title: 'Data Management',
        href: '/settings/data-management',
        icon: Database,
    },
];

import { KravioCard } from '@/components/dashboard/KravioCard';

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { urlIsActive } = useActiveUrl();

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
            <div className="flex flex-col gap-1 pb-4 border-b border-border/60">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Account Settings</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    Manage your personal profile, security preferences, and workspace settings.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row lg:space-x-8 gap-6">
                <aside className="w-full lg:w-56 flex-shrink-0">
                    <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0" aria-label="Settings">
                        {sidebarNavItems.map((item, index) => {
                            const active = urlIsActive(item.href);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={`${toUrl(item.href)}-${index}`}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-all whitespace-nowrap',
                                        active
                                            ? 'bg-foreground text-background font-semibold shadow-xs'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                    )}
                                >
                                    <Icon className={cn('h-3.5 w-3.5 flex-shrink-0', active ? 'text-background' : 'text-muted-foreground')} />
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="flex-1 max-w-3xl">
                    <KravioCard pattern innerClassName="p-5 sm:p-8">
                        {children}
                    </KravioCard>
                </div>
            </div>
        </div>
    );
}

