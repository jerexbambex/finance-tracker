import { Link } from '@inertiajs/react';
import { ChevronDown, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

import { KravioCard } from '@/components/dashboard/KravioCard';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

export interface SafeToSpend {
    currency: string;
    balance: number;
    bills_total: number;
    available: number;
    per_day: number;
    days_left: number;
    period_end: string;
    bills: { name: string; amount: number; due_date: string; overdue: boolean }[];
}

const shortDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

export function SafeToSpendCard({ data }: { data: SafeToSpend }) {
    const [open, setOpen] = useState(false);
    const fmt = (n: number) => formatCurrency(n, data.currency);
    const short = data.available < 0;
    const days = `${data.days_left} day${data.days_left === 1 ? '' : 's'}`;

    return (
        <KravioCard innerClassName="p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div
                        className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                            short ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-primary/10 text-primary',
                        )}
                    >
                        {short ? <TriangleAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Safe to spend until {shortDate(data.period_end)}
                        </p>
                        <p
                            className={cn(
                                'mt-0.5 font-mono text-2xl font-semibold tabular-nums sm:text-3xl',
                                short && 'text-rose-600 dark:text-rose-400',
                            )}
                        >
                            {fmt(data.available)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {short
                                ? `Bills due by ${shortDate(data.period_end)} are ${fmt(-data.available)} more than you have in checking and cash.`
                                : `About ${fmt(data.per_day)} a day for the next ${days}, after ${fmt(data.bills_total)} of upcoming bills.`}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    aria-expanded={open}
                    className="inline-flex items-center gap-1 self-start text-xs font-medium text-primary hover:underline sm:self-center"
                >
                    How is this worked out?
                    <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} />
                </button>
            </div>

            {open && (
                <div className="mt-4 border-t border-border/50 pt-4 text-xs">
                    <dl className="space-y-1.5">
                        <div className="flex justify-between gap-4">
                            <dt className="text-muted-foreground">Checking and cash accounts ({data.currency})</dt>
                            <dd className="font-mono tabular-nums">{fmt(data.balance)}</dd>
                        </div>
                        {data.bills.map((bill, i) => (
                            <div key={`${bill.name}-${bill.due_date}-${i}`} className="flex justify-between gap-4">
                                <dt className="min-w-0 truncate text-muted-foreground">
                                    − {bill.name} · {shortDate(bill.due_date)}
                                    {bill.overdue && (
                                        <span className="ml-1.5 rounded bg-rose-500/10 px-1 py-0.5 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                                            Overdue
                                        </span>
                                    )}
                                </dt>
                                <dd className="font-mono tabular-nums">−{fmt(bill.amount)}</dd>
                            </div>
                        ))}
                        <div className="flex justify-between gap-4 border-t border-border/50 pt-1.5 font-semibold">
                            <dt>Safe to spend</dt>
                            <dd className="font-mono tabular-nums">{fmt(data.available)}</dd>
                        </div>
                    </dl>
                    <p className="mt-3 text-[11px] text-muted-foreground">
                        {data.bills.length === 0 ? (
                            <>
                                No bills due before month end.{' '}
                                <Link href="/reminders/create" className="text-primary hover:underline">
                                    Add a bill reminder
                                </Link>{' '}
                                or a{' '}
                                <Link href="/recurring-transactions/create" className="text-primary hover:underline">
                                    recurring payment
                                </Link>{' '}
                                so it&rsquo;s set aside here.{' '}
                            </>
                        ) : (
                            'Bills come from your unpaid reminders and recurring payments. '
                        )}
                        Savings, credit cards and income you haven&rsquo;t received yet aren&rsquo;t counted.
                    </p>
                </div>
            )}
        </KravioCard>
    );
}
