import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KravioCard } from './KravioCard';

export interface KravioKPICardProps {
    title: string;
    value: React.ReactNode;
    subtitle?: React.ReactNode;
    icon: LucideIcon;
    iconColorClass?: string;
    headerRight?: React.ReactNode;
    children?: React.ReactNode;
    delta?: {
        value: string;
        isPositive: boolean;
        label?: string;
    };
    metaRight?: React.ReactNode;
    index?: number;
    className?: string;
    highlight?: 'default' | 'emerald' | 'amber' | 'rose' | 'blue';
}

export function KravioKPICard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColorClass = 'text-primary bg-primary/10',
    headerRight,
    children,
    delta,
    metaRight,
    index = 0,
    className,
    highlight = 'default',
}: KravioKPICardProps) {
    return (
        <KravioCard
            pattern
            className={cn(
                'group/kpi animate-rise transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between',
                className,
            )}
            style={{ animationDelay: `${80 + index * 60}ms` }}
        >
            <div>
                <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                            {title}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {headerRight}
                        <div
                            className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover/kpi:scale-105',
                                iconColorClass,
                            )}
                        >
                            <Icon className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex items-baseline justify-between gap-2">
                    {typeof value === 'string' ? (
                        <span className="font-mono text-xl sm:text-2xl font-semibold tracking-tight text-foreground tabular-nums truncate">
                            {value}
                        </span>
                    ) : (
                        value
                    )}
                </div>

                {children}
            </div>

            <div className="mt-3 flex w-full items-center justify-between border-t border-border/40 pt-2.5 text-xs">
                {delta ? (
                    <div className="flex items-center gap-1.5">
                        <span
                            className={cn(
                                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-medium leading-none',
                                delta.isPositive
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                    : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
                            )}
                        >
                            {delta.isPositive ? (
                                <TrendingUp className="h-3 w-3 shrink-0" />
                            ) : (
                                <TrendingDown className="h-3 w-3 shrink-0" />
                            )}
                            {delta.value}
                        </span>
                        {delta.label && <span className="text-muted-foreground">{delta.label}</span>}
                    </div>
                ) : (
                    <span className="text-muted-foreground">{subtitle}</span>
                )}

                {metaRight && <div className="text-muted-foreground">{metaRight}</div>}
            </div>
        </KravioCard>
    );
}

