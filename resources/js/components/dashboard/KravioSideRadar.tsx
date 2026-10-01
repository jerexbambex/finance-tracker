import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Search,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency as baseFmt } from '@/lib/formatCurrency';
import { KravioCard } from './KravioCard';

interface Budget {
    id: string;
    category: string;
    percentage: number;
    amount: number;
    spent: number;
    status: 'ok' | 'warning' | 'exceeded';
    currency: string;
}

interface Reminder {
    id: string;
    title: string;
    amount?: number;
    due_date: string;
    category?: { name: string; color?: string };
}

interface Transaction {
    id: string;
    type: string;
    amount: number;
    description: string;
    transaction_date: string;
    account: { name: string; currency: string };
    category?: { name: string; color?: string };
}

interface KravioSideRadarProps {
    budgets: Budget[];
    budgetAlerts: Budget[];
    upcomingReminders: Reminder[];
    recentTransactions: Transaction[];
    primaryCurrency: string;
    className?: string;
}

type FilterTab = 'all' | 'alerts' | 'bills' | 'activity';

interface RadarItem {
    id: string;
    type: 'alert' | 'bill' | 'activity';
    title: string;
    subtitle: string;
    date?: string;
    amount?: string;
    badge?: { text: string; variant: 'danger' | 'warning' | 'info' | 'success' };
    link?: string;
    color?: string;
}

interface TabDef {
    id: FilterTab;
    label: string;
    count?: number;
}

export function KravioSideRadar({
    budgetAlerts,
    upcomingReminders,
    recentTransactions,
    primaryCurrency,
    className,
}: KravioSideRadarProps) {
    const [activeTab, setActiveTab] = useState<FilterTab>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const formatCurrency = (val: number, curr: string = primaryCurrency) => baseFmt(val, curr);

    const formatDate = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Combine & format items for the radar feed
    const allRadarItems = useMemo<RadarItem[]>(() => {
        const items: RadarItem[] = [];

        // Add Budget Alerts
        budgetAlerts.forEach((b) => {
            const isExceeded = b.status === 'exceeded';
            items.push({
                id: `budget-${b.id}`,
                type: 'alert',
                title: `${b.category} Budget`,
                subtitle: `${formatCurrency(b.spent, b.currency)} of ${formatCurrency(b.amount, b.currency)} spent`,
                badge: {
                    text: isExceeded ? 'Over Limit' : `${b.percentage.toFixed(0)}% Used`,
                    variant: isExceeded ? 'danger' : 'warning',
                },
                link: '/budgets',
            });
        });

        // Add Upcoming Reminders
        upcomingReminders.forEach((r) => {
            const dueDate = new Date(r.due_date);
            const isOverdue = dueDate < new Date() && dueDate.toDateString() !== new Date().toDateString();
            const isToday = dueDate.toDateString() === new Date().toDateString();

            items.push({
                id: `reminder-${r.id}`,
                type: 'bill',
                title: r.title,
                subtitle: r.category?.name ? `Category: ${r.category.name}` : 'Upcoming bill',
                date: formatDate(r.due_date),
                amount: r.amount ? formatCurrency(r.amount, primaryCurrency) : undefined,
                badge: {
                    text: isOverdue ? 'Overdue' : isToday ? 'Due Today' : formatDate(r.due_date),
                    variant: isOverdue ? 'danger' : isToday ? 'warning' : 'info',
                },
                link: '/reminders',
                color: r.category?.color,
            });
        });

        // Add Recent Transactions
        recentTransactions.slice(0, 6).forEach((t) => {
            items.push({
                id: `tx-${t.id}`,
                type: 'activity',
                title: t.description,
                subtitle: `${t.account.name}${t.category?.name ? ` • ${t.category.name}` : ''}`,
                date: formatDate(t.transaction_date),
                amount: `${t.type === 'expense' ? '-' : '+'}${formatCurrency(t.amount, t.account.currency)}`,
                badge: {
                    text: t.type,
                    variant: t.type === 'income' ? 'success' : 'info',
                },
                link: '/transactions',
            });
        });

        return items;
    }, [budgetAlerts, upcomingReminders, recentTransactions, primaryCurrency]);

    const filteredItems = useMemo(() => {
        return allRadarItems.filter((item) => {
            if (activeTab === 'alerts' && item.type !== 'alert') return false;
            if (activeTab === 'bills' && item.type !== 'bill') return false;
            if (activeTab === 'activity' && item.type !== 'activity') return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                return (
                    item.title.toLowerCase().includes(q) ||
                    item.subtitle.toLowerCase().includes(q) ||
                    (item.badge?.text && item.badge.text.toLowerCase().includes(q))
                );
            }
            return true;
        });
    }, [allRadarItems, activeTab, searchQuery]);

    const tabs: TabDef[] = [
        { id: 'all', label: 'All' },
        { id: 'alerts', label: 'Alerts', count: budgetAlerts.length },
        { id: 'bills', label: 'Bills', count: upcomingReminders.length },
        { id: 'activity', label: 'Activity' },
    ];

    return (
        <KravioCard
            pattern
            className={cn('w-full animate-rise [animation-delay:260ms]', className)}
            innerClassName="p-4 sm:p-5 flex flex-col h-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                        Activity & Radar
                    </h3>
                    <span className="flex h-5 items-center justify-center rounded-full bg-primary/10 px-2 text-[11px] font-bold text-primary">
                        {allRadarItems.length}
                    </span>
                </div>
                <Link
                    href="/reports"
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 transition-colors"
                >
                    View Hub <ChevronRight className="h-3 w-3" />
                </Link>
            </div>

            {/* Segmented Filter Pills */}
            <div className="mt-3 flex items-center gap-1 overflow-x-auto pb-1 text-xs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            'relative z-10 flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-all duration-150',
                            activeTab === tab.id
                                ? 'border-primary/40 bg-primary/10 text-primary font-semibold'
                                : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                        )}
                    >
                        <span>{tab.label}</span>
                        {tab.count !== undefined && tab.count > 0 && (
                            <span
                                className={cn(
                                    'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-bold leading-none',
                                    tab.id === 'alerts'
                                        ? 'bg-rose-500 text-white'
                                        : 'bg-muted text-foreground',
                                )}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Search Input Box */}
            <div className="mt-2.5 relative flex items-center">
                <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter radar items..."
                    className="h-8 w-full rounded-lg border border-border/70 bg-muted/20 pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Feed List */}
            <div className="mt-3 flex-1 divide-y divide-border/30 overflow-y-auto max-h-[380px] pr-1">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.link || '#'}
                            className="group flex items-start gap-3 py-2.5 transition-colors hover:bg-muted/30 rounded-lg px-2 -mx-2"
                        >
                            {/* Icon Indicator */}
                            <div className="mt-0.5 shrink-0">
                                {item.type === 'alert' && (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                    </div>
                                )}
                                {item.type === 'bill' && (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                                        <Calendar className="h-3.5 w-3.5" />
                                    </div>
                                )}
                                {item.type === 'activity' && (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300">
                                        {item.badge?.text === 'income' ? (
                                            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                                        ) : (
                                            <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1.5">
                                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                        {item.title}
                                    </p>
                                    {item.amount && (
                                        <span className="font-mono text-xs font-bold text-foreground shrink-0 tabular-nums">
                                            {item.amount}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-0.5 flex items-center justify-between gap-1">
                                    <p className="text-[11px] text-muted-foreground truncate">
                                        {item.subtitle}
                                    </p>
                                    {item.badge && (
                                        <span
                                            className={cn(
                                                'shrink-0 rounded px-1.5 py-0.2 text-[10px] font-medium leading-normal',
                                                item.badge.variant === 'danger' &&
                                                    'bg-rose-500/10 text-rose-600 border border-rose-500/20',
                                                item.badge.variant === 'warning' &&
                                                    'bg-amber-500/10 text-amber-600 border border-amber-500/20',
                                                item.badge.variant === 'info' &&
                                                    'bg-secondary text-secondary-foreground',
                                                item.badge.variant === 'success' &&
                                                    'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
                                            )}
                                        >
                                            {item.badge.text}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <CheckCircle2 className="h-7 w-7 text-muted-foreground/60 mb-1.5" />
                        <p className="text-xs font-medium text-foreground">No active items</p>
                        <p className="text-[11px] text-muted-foreground">Everything is on track</p>
                    </div>
                )}
            </div>
        </KravioCard>
    );
}
