import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

import AppLogoIcon from '@/components/app-logo-icon';
import { KravioCard } from '@/components/dashboard/KravioCard';
import { home } from '@/routes';

export default function AuthCardLayout({
    children,
    title,
    description,
}: PropsWithChildren<{
    name?: string;
    title?: string;
    description?: string;
}>) {
    return (
        <div className="relative min-h-svh flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 bg-background text-foreground overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />

            <div className="w-full max-w-md space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <Link
                        href={home()}
                        className="flex items-center gap-2 group transition-transform duration-200 hover:scale-105"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-xs">
                            <AppLogoIcon className="h-6 w-6 fill-current text-primary" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-foreground">Penniepal</span>
                    </Link>
                </div>

                <KravioCard pattern innerClassName="p-6 sm:p-8">
                    <div className="space-y-1.5 text-center pb-5 mb-5 border-b border-border/40">
                        {title && <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>}
                        {description && (
                            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                                {description}
                            </p>
                        )}
                    </div>
                    {children}
                </KravioCard>
            </div>
        </div>
    );
}
