import React from 'react';
import { cn } from '@/lib/utils';

interface KravioCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    innerClassName?: string;
    noPadding?: boolean;
    pattern?: boolean;
}

export function KravioCardPattern({ className }: { className?: string }) {
    return (
        <svg
            className={cn('pointer-events-none absolute inset-0 h-full w-full opacity-[0.35] dark:opacity-[0.12]', className)}
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            fill="none"
        >
            <defs>
                <pattern id="kravio-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M24 0H0v24" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 3" className="text-foreground/30" />
                </pattern>
                <pattern id="kravio-dots" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="0.8" fill="currentColor" className="text-foreground/20" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#kravio-dots)" />
        </svg>
    );
}

export function KravioCard({
    children,
    className,
    innerClassName,
    noPadding = false,
    pattern = false,
    ...props
}: KravioCardProps) {
    return (
        <div
            className={cn(
                'relative flex flex-col items-start overflow-hidden rounded-2xl bg-muted/40 p-1 border border-border/70 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-border',
                className,
            )}
            {...props}
        >
            {pattern && <KravioCardPattern />}
            <div
                className={cn(
                    'relative z-10 flex w-full flex-col rounded-xl bg-card border border-border/40 text-card-foreground shadow-xs transition-colors',
                    noPadding ? 'p-0' : 'p-4 sm:p-5',
                    innerClassName,
                )}
            >
                {children}
            </div>
        </div>
    );
}
