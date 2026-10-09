import { Link, usePage } from '@inertiajs/react';
import { Check, RotateCcw } from 'lucide-react';
import { type FormEvent, useEffect, useId, useState } from 'react';

import { formatCurrency } from '@/lib/formatCurrency';
import { type SharedData } from '@/types';

import { useAnimatedNumber } from './motion';

type CategoryKey = 'food' | 'transport' | 'fun';

interface Entry {
    id: number;
    when: string;
    label: string;
    category: string;
    amount: number;
}

const CATEGORIES: Record<CategoryKey, { name: string; limit: number; spent: number; color: string }> = {
    food: { name: 'Food & dining', limit: 400, spent: 212.4, color: 'bg-chart-1' },
    transport: { name: 'Transport', limit: 150, spent: 96, color: 'bg-chart-2' },
    fun: { name: 'Entertainment', limit: 120, spent: 104, color: 'bg-chart-3' },
};

const STARTING_BALANCE = 2480.6;

const STARTING_ENTRIES: Entry[] = [
    { id: 3, when: 'Yesterday', label: 'Groceries', category: 'Food & dining', amount: -86.4 },
    { id: 2, when: 'Oct 3', label: 'Rent', category: 'Housing', amount: -1150 },
    { id: 1, when: 'Oct 1', label: 'Salary', category: 'Income', amount: 3200 },
];

const CURRENCIES = [
    ['$', 'USD'],
    ['€', 'EUR'],
    ['£', 'GBP'],
    ['₦', 'NGN'],
    ['C$', 'CAD'],
    ['A$', 'AUD'],
    ['₹', 'INR'],
    ['¥', 'JPY'],
    ['¥', 'CNY'],
    ['Fr', 'CHF'],
];

const QUICK_ADDS: { label: string; category: CategoryKey; amount: number }[] = [
    { label: 'Coffee', category: 'food', amount: 4.5 },
    { label: 'Taxi home', category: 'transport', amount: 18 },
    { label: 'Cinema', category: 'fun', amount: 24 },
];

function LedgerDemo() {
    const formId = useId();
    const [entries, setEntries] = useState<Entry[]>(STARTING_ENTRIES);
    const [added, setAdded] = useState<Record<CategoryKey, number>>({ food: 0, transport: 0, fun: 0 });
    const [label, setLabel] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<CategoryKey>('food');
    const [lastDelta, setLastDelta] = useState<{ id: number; amount: number } | null>(null);
    const [justAdded, setJustAdded] = useState(false);

    const totalAdded = added.food + added.transport + added.fun;
    const balance = STARTING_BALANCE - totalAdded;
    const shownBalance = useAnimatedNumber(balance);
    const isDirty = entries.length > STARTING_ENTRIES.length;

    useEffect(() => {
        if (!justAdded) return;
        const timer = setTimeout(() => setJustAdded(false), 1100);
        return () => clearTimeout(timer);
    }, [justAdded]);

    const addExpense = (name: string, key: CategoryKey, value: number) => {
        if (!Number.isFinite(value) || value <= 0) return;

        setEntries((current) => [
            { id: current.length + 1, when: 'Today', label: name || CATEGORIES[key].name, category: CATEGORIES[key].name, amount: -value },
            ...current,
        ]);
        setAdded((current) => ({ ...current, [key]: current[key] + value }));
        setLastDelta((current) => ({ id: (current?.id ?? 0) + 1, amount: value }));
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        addExpense(label.trim(), category, Number.parseFloat(amount));
        setJustAdded(true);
        setLabel('');
        setAmount('');
    };

    const reset = () => {
        setEntries(STARTING_ENTRIES);
        setAdded({ food: 0, transport: 0, fun: 0 });
        setLastDelta(null);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both rounded-2xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(15,23,42,0.35)] delay-300 duration-700 motion-reduce:animate-none dark:shadow-none">
            <div className="flex items-end justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
                <div>
                    <p className="text-sm text-muted-foreground">Main account</p>
                    <p className="relative font-display text-3xl font-semibold tracking-tight text-foreground tabular-nums sm:text-4xl">
                        <span aria-hidden="true">{formatCurrency(shownBalance, 'USD')}</span>
                        <span className="sr-only" aria-live="polite">
                            Balance {formatCurrency(balance, 'USD')}
                        </span>
                        {lastDelta && (
                            <span
                                key={lastDelta.id}
                                aria-hidden="true"
                                className="animate-out fade-out slide-out-to-top-3 fill-mode-forwards pointer-events-none absolute top-1 left-full ml-3 font-sans text-sm font-medium whitespace-nowrap text-destructive delay-300 duration-700 motion-reduce:hidden"
                            >
                                −{formatCurrency(lastDelta.amount, 'USD')}
                            </span>
                        )}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={reset}
                    disabled={!isDirty}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:invisible"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                </button>
            </div>

            <form onSubmit={handleSubmit} className="border-b border-border px-5 py-4 sm:px-6">
                <p id={`${formId}-hint`} className="text-sm font-medium text-foreground">
                    Add an expense and watch the budget move
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-[1fr_9rem_6.5rem_auto]">
                    <label className="sr-only" htmlFor={`${formId}-label`}>
                        Description
                    </label>
                    <input
                        id={`${formId}-label`}
                        value={label}
                        onChange={(event) => setLabel(event.target.value)}
                        placeholder="Lunch"
                        maxLength={24}
                        className="col-span-2 h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-ring sm:col-span-1"
                    />
                    <label className="sr-only" htmlFor={`${formId}-category`}>
                        Category
                    </label>
                    <select
                        id={`${formId}-category`}
                        value={category}
                        onChange={(event) => setCategory(event.target.value as CategoryKey)}
                        className="h-10 rounded-lg border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                    >
                        {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => (
                            <option key={key} value={key}>
                                {CATEGORIES[key].name}
                            </option>
                        ))}
                    </select>
                    <label className="sr-only" htmlFor={`${formId}-amount`}>
                        Amount in dollars
                    </label>
                    <input
                        id={`${formId}-amount`}
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        inputMode="decimal"
                        type="number"
                        min="0.01"
                        step="0.01"
                        max="9999"
                        required
                        placeholder="0.00"
                        className="h-10 rounded-lg border border-input bg-background px-3 text-right text-sm text-foreground tabular-nums placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-ring"
                    />
                    <button
                        type="submit"
                        className="col-span-2 h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] sm:col-span-1"
                    >
                        {justAdded ? (
                            <span className="animate-in zoom-in-75 fade-in inline-flex items-center gap-1 duration-200 motion-reduce:animate-none">
                                <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                                Added
                            </span>
                        ) : (
                            'Add'
                        )}
                    </button>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">Or try</span>
                    {QUICK_ADDS.map((item) => (
                        <button
                            key={item.label}
                            type="button"
                            onClick={() => addExpense(item.label, item.category, item.amount)}
                            className="h-7 rounded-full border border-border px-2.5 text-xs text-foreground transition hover:-translate-y-px hover:border-foreground/30 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring active:translate-y-0 active:scale-95 motion-reduce:transform-none"
                        >
                            {item.label} {formatCurrency(item.amount, 'USD')}
                        </button>
                    ))}
                </div>
            </form>

            <div className="grid sm:grid-cols-5">
                <div className="border-b border-border px-5 py-4 sm:col-span-3 sm:border-r sm:border-b-0 sm:px-6">
                    <h3 className="text-sm font-medium text-foreground">Recent transactions</h3>
                    <ul className="mt-2 divide-y divide-border/70">
                        {entries.slice(0, 4).map((entry) => (
                            <li
                                key={entry.id}
                                className={`flex items-baseline justify-between gap-3 py-2.5 ${
                                    entry.id > STARTING_ENTRIES.length ? 'animate-in fade-in slide-in-from-top-1 duration-300 motion-reduce:animate-none' : ''
                                }`}
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm text-foreground">{entry.label}</p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {entry.when}, {entry.category}
                                    </p>
                                </div>
                                <p className={`shrink-0 text-sm tabular-nums ${entry.amount > 0 ? 'text-primary' : 'text-foreground'}`}>
                                    {entry.amount > 0 ? '+' : '−'}
                                    {formatCurrency(Math.abs(entry.amount), 'USD')}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="px-5 py-4 sm:col-span-2 sm:px-6">
                    <h3 className="text-sm font-medium text-foreground">October budgets</h3>
                    <ul className="mt-3 space-y-4">
                        {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
                            const budget = CATEGORIES[key];
                            const spent = budget.spent + added[key];
                            const over = spent > budget.limit;
                            const percent = Math.min(100, (spent / budget.limit) * 100);

                            return (
                                <li key={key}>
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span className="text-xs text-foreground">{budget.name}</span>
                                        <span className={`text-xs tabular-nums ${over ? 'font-medium text-destructive' : 'text-muted-foreground'}`}>
                                            {over
                                                ? `${formatCurrency(spent - budget.limit, 'USD')} over`
                                                : `${formatCurrency(budget.limit - spent, 'USD')} left`}
                                        </span>
                                    </div>
                                    <div
                                        className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
                                        role="progressbar"
                                        aria-label={`${budget.name} budget used`}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={Math.round(percent)}
                                    >
                                        <div
                                            className={`h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none ${over ? 'bg-destructive' : budget.color}`}
                                            style={{ width: `${percent}%` }}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function Hero() {
    const { auth, canRegister = true } = usePage<SharedData & { canRegister?: boolean }>().props;
    const user = auth?.user;

    return (
        <section className="relative border-b border-border">
            {/* Ledger ruling, fading out towards the fold */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_80%)] bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,var(--border)_31px,var(--border)_32px)] opacity-60"
            />

            <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-28 pb-16 sm:px-8 sm:pt-36 sm:pb-24 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-5">
                    <h1 className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both font-display duration-500 motion-reduce:animate-none text-[2.6rem] leading-[1.04] font-semibold tracking-[-0.03em] text-balance text-foreground sm:text-6xl">
                        See where your money went. Decide where it goes next.
                    </h1>
                    <p className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both mt-6 max-w-md text-lg leading-relaxed text-muted-foreground delay-100 duration-500 motion-reduce:animate-none">
                        Penniepal keeps your accounts, budgets, savings goals and bills in one ledger, in every currency you earn or spend in.
                    </p>

                    <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both mt-8 flex flex-wrap items-center gap-3 delay-200 duration-500 motion-reduce:animate-none">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-base font-medium text-primary-foreground transition active:scale-[0.98] hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            >
                                Open dashboard
                            </Link>
                        ) : (
                            <>
                                {canRegister && (
                                    <Link
                                        href="/register"
                                        className="inline-flex h-12 items-center rounded-xl bg-primary px-6 text-base font-medium text-primary-foreground transition active:scale-[0.98] hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                                    >
                                        Create free account
                                    </Link>
                                )}
                                <Link
                                    href="/login"
                                    className="inline-flex h-12 items-center rounded-xl border border-border px-6 text-base font-medium text-foreground transition active:scale-[0.98] hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                                >
                                    Log in
                                </Link>
                            </>
                        )}
                    </div>
                    {!user && canRegister && (
                        <p className="mt-4 text-sm text-muted-foreground">Free to use. No card, no bank login.</p>
                    )}
                </div>

                <div className="lg:col-span-7">
                    <LedgerDemo />
                </div>
            </div>

            <div className="relative border-t border-border bg-background/70">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm text-muted-foreground">Ten currencies, one total</p>
                    <ul className="flex flex-wrap gap-x-6 gap-y-2">
                        {CURRENCIES.map(([symbol, code]) => (
                            <li key={code} className="group flex cursor-default items-baseline gap-1.5 text-sm">
                                <span className="font-semibold text-foreground transition-colors group-hover:text-primary">{symbol}</span>
                                <span className="text-muted-foreground">{code}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}
