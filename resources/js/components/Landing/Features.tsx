import { type KeyboardEvent, type PointerEvent, useState } from 'react';

import { formatCurrency } from '@/lib/formatCurrency';

import { useAnimatedNumber, useInViewOnce } from './motion';

// Illustrative rates for the demo only; the app refreshes real rates daily.
const SAMPLE_ACCOUNTS = [
    { name: 'Savings', currency: 'NGN', balance: 507_500, toUsd: 1 / 1600 },
    { name: 'Main checking', currency: 'USD', balance: 1_805.0, toUsd: 1 },
    { name: 'Travel fund', currency: 'CAD', balance: 6_410, toUsd: 0.73 },
];

function CurrencyVisual() {
    const [display, setDisplay] = useState('USD');
    const totalUsd = SAMPLE_ACCOUNTS.reduce((sum, account) => sum + account.balance * account.toUsd, 0);
    const target = SAMPLE_ACCOUNTS.find((account) => account.currency === display) ?? SAMPLE_ACCOUNTS[1];
    const shownTotal = useAnimatedNumber(totalUsd / target.toUsd, 500);

    return (
        <div>
            <ul className="divide-y divide-border/70 text-sm">
                {SAMPLE_ACCOUNTS.map((account) => (
                    <li key={account.currency} className="flex items-baseline justify-between py-2">
                        <span className="text-foreground">{account.name}</span>
                        <span className="text-muted-foreground tabular-nums">{formatCurrency(account.balance, account.currency)}</span>
                    </li>
                ))}
            </ul>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-foreground/80 pt-3">
                <div role="group" aria-label="Show total in" className="flex rounded-lg border border-border p-0.5">
                    {SAMPLE_ACCOUNTS.map((account) => (
                        <button
                            key={account.currency}
                            type="button"
                            aria-pressed={display === account.currency}
                            onClick={() => setDisplay(account.currency)}
                            className={`h-6 rounded-md px-2 text-xs font-medium transition active:scale-95 focus-visible:outline-2 focus-visible:outline-ring ${
                                display === account.currency ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {account.currency}
                        </button>
                    ))}
                </div>
                <span className="font-display text-lg font-semibold text-foreground tabular-nums">
                    <span aria-hidden="true">{formatCurrency(shownTotal, display)}</span>
                    <span className="sr-only" aria-live="polite">
                        Total {formatCurrency(totalUsd / target.toUsd, display)}
                    </span>
                </span>
            </div>
        </div>
    );
}

function RolloverVisual() {
    const months = [
        { name: 'September', limit: 400, spent: 362 },
        { name: 'October', limit: 438, spent: 212 },
    ];

    const [ref, seen] = useInViewOnce<HTMLDivElement>();

    return (
        <div ref={ref} className="space-y-5">
            {months.map((month, index) => (
                <div key={month.name}>
                    <div className="flex items-baseline justify-between text-sm">
                        <span className="text-foreground">{month.name}</span>
                        <span className="text-muted-foreground tabular-nums">
                            {formatCurrency(month.spent, 'USD')} of {formatCurrency(month.limit, 'USD')}
                        </span>
                    </div>
                    <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-chart-1 transition-[width] duration-700 ease-out motion-reduce:transition-none"
                            style={{ width: seen ? `${(month.spent / month.limit) * 100}%` : '0%', transitionDelay: `${index * 250}ms` }}
                        />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        {index === 0 ? '$38.00 unspent, carried forward' : 'Limit is $400.00 plus the $38.00 from September'}
                    </p>
                </div>
            ))}
        </div>
    );
}

const FORECAST_POINTS: [number, number][] = [
    [0, 52],
    [44, 58],
    [46, 92],
    [88, 98],
    [90, 40],
    [150, 50],
    [152, 84],
    [196, 90],
    [198, 32],
    [258, 42],
    [260, 76],
    [320, 84],
];
const FORECAST_PATH = FORECAST_POINTS.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
const LOW_BALANCE_Y = 78;

function forecastY(x: number): number {
    for (let i = 1; i < FORECAST_POINTS.length; i++) {
        const [x0, y0] = FORECAST_POINTS[i - 1];
        const [x1, y1] = FORECAST_POINTS[i];
        if (x <= x1) return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }

    return FORECAST_POINTS[FORECAST_POINTS.length - 1][1];
}

// The chart's y axis: the baseline is an empty account, every unit above it is $50.
const forecastBalance = (y: number) => (110 - y) * 50;

function ForecastVisual() {
    const [cursor, setCursor] = useState<number | null>(null);

    const handlePointer = (event: PointerEvent<SVGSVGElement>) => {
        const box = event.currentTarget.getBoundingClientRect();
        setCursor(Math.max(0, Math.min(320, ((event.clientX - box.left) / box.width) * 320)));
    };

    const handleKey = (event: KeyboardEvent<SVGSVGElement>) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const step = (320 / 90) * (event.key === 'ArrowLeft' ? -3 : 3);
        setCursor((current) => Math.max(0, Math.min(320, (current ?? 0) + step)));
    };

    const y = cursor === null ? null : forecastY(cursor);
    const day = cursor === null ? null : Math.round((cursor / 320) * 90);
    const isLow = y !== null && y > LOW_BALANCE_Y;

    return (
        <figure>
            <figcaption className="flex h-5 items-baseline justify-between text-xs" aria-live="polite">
                {y === null || day === null ? (
                    <span className="text-muted-foreground">Move across the chart to read any day</span>
                ) : (
                    <>
                        <span className="text-muted-foreground">{day === 0 ? 'Today' : `In ${day} ${day === 1 ? 'day' : 'days'}`}</span>
                        <span className={`font-medium tabular-nums ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                            {formatCurrency(forecastBalance(y), 'USD')}
                        </span>
                    </>
                )}
            </figcaption>
            <svg
                viewBox="0 0 320 132"
                className="mt-1 w-full cursor-crosshair touch-pan-y rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                role="img"
                tabIndex={0}
                aria-label="Projected balance over the next 90 days, dipping when rent is due and rising on payday. Use the left and right arrow keys to read a day."
                onPointerMove={handlePointer}
                onPointerDown={handlePointer}
                onPointerLeave={() => setCursor(null)}
                onBlur={() => setCursor(null)}
                onKeyDown={handleKey}
            >
                <line x1="0" y1="110" x2="320" y2="110" className="stroke-border" strokeWidth="1" />
                <line x1="0" y1={LOW_BALANCE_Y} x2="320" y2={LOW_BALANCE_Y} className="stroke-destructive/60" strokeWidth="1" strokeDasharray="3 4" />
                <path d={FORECAST_PATH} fill="none" className="stroke-primary" strokeWidth="2" strokeLinejoin="round" />
                <text x="52" y="106" className="fill-muted-foreground text-[10px]">
                    Rent
                </text>
                <text x="96" y="36" className="fill-muted-foreground text-[10px]">
                    Payday
                </text>
                <text x="0" y="74" className="fill-muted-foreground text-[10px]">
                    Low-balance line
                </text>
                <text x="0" y="126" className="fill-muted-foreground text-[10px]">
                    Today
                </text>
                <text x="320" y="126" textAnchor="end" className="fill-muted-foreground text-[10px]">
                    90 days
                </text>
                {cursor !== null && y !== null && (
                    <g pointerEvents="none">
                        <line x1={cursor} y1="14" x2={cursor} y2="110" className="stroke-foreground/25" strokeWidth="1" />
                        <circle cx={cursor} cy={y} r="4" className={`fill-background ${isLow ? 'stroke-destructive' : 'stroke-primary'}`} strokeWidth="2" />
                    </g>
                )}
            </svg>
        </figure>
    );
}

const pillars = [
    {
        title: 'Every account, in its own currency',
        body: 'Keep naira, dollars, pounds and seven more side by side. Each account stays in its own currency, and your total converts with rates refreshed daily.',
        visual: <CurrencyVisual />,
    },
    {
        title: 'Budgets that carry over',
        body: 'Set a monthly limit per category. Turn on rollover and whatever you leave unspent is added to next month, so a quiet month pays for a busy one.',
        visual: <RolloverVisual />,
    },
    {
        title: 'The next 90 days, before they happen',
        body: 'Recurring income and bills are projected forward day by day, so you can see a tight week coming while there is still time to move money.',
        visual: <ForecastVisual />,
    },
];

const more = [
    ['Savings goals', 'Name a target and a date, then add to it whenever you can and watch the gap close.'],
    ['Recurring transactions', 'Salary, rent and subscriptions are entered once and posted on schedule.'],
    ['Bill reminders', 'Get a heads-up before something is due, not after it is late.'],
    ['Net worth over time', 'A daily snapshot of everything you hold, charted across months.'],
    ['Reports you can hand over', 'Spending by category and income against expenses, exportable as PDF or CSV.'],
    ['CSV import', 'Bring in a statement from your bank and skip the typing.'],
    ['Spending insights', 'Plain-language notes on what changed this month and where a budget is under pressure.'],
    ['Works like an app', 'Install Penniepal on your phone’s home screen straight from the browser.'],
];

export default function Features() {
    return (
        <section id="features" className="scroll-mt-16 border-b border-border">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
                <div className="grid gap-6 lg:grid-cols-12">
                    <h2 className="font-display text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-[2.75rem] lg:col-span-7">
                        One ledger for what you have, what you owe and what you are saving for.
                    </h2>
                    <p className="max-w-md text-[0.95rem] leading-relaxed text-muted-foreground lg:col-span-5 lg:pt-3">
                        Most money tools do one job. Penniepal keeps the balance, the plan and the forecast on the same page, so each number
                        explains the others.
                    </p>
                </div>

                <div className="mt-14 grid border-y border-border lg:grid-cols-3 lg:divide-x lg:divide-border">
                    {pillars.map((pillar, index) => (
                        <article
                            key={pillar.title}
                            className={`flex flex-col py-8 lg:px-8 lg:py-10 ${index === 0 ? 'lg:pl-0' : 'border-t border-border lg:border-t-0'} ${
                                index === pillars.length - 1 ? 'lg:pr-0' : ''
                            }`}
                        >
                            <div className="flex min-h-44 flex-col justify-end">{pillar.visual}</div>
                            <h3 className="mt-8 font-display text-xl font-semibold tracking-tight text-foreground">{pillar.title}</h3>
                            <p className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{pillar.body}</p>
                        </article>
                    ))}
                </div>

                <dl className="mt-14 grid gap-x-12 sm:grid-cols-2">
                    {more.map(([term, detail]) => (
                        <div key={term} className="group grid gap-1 border-b border-border/70 py-4 transition-colors hover:border-foreground/40 md:grid-cols-[11rem_1fr] md:gap-6">
                            <dt className="text-sm font-medium text-foreground transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none">{term}</dt>
                            <dd className="text-sm leading-relaxed text-muted-foreground">{detail}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
