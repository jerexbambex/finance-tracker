import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    ArrowDownRight,
    ArrowRight,
    ArrowUpDown,
    ArrowUpRight,
    BarChart3,
    Bell,
    Folder,
    LayoutGrid,
    LineChart,
    PieChart,
    Plus,
    Repeat,
    Sparkles,
    Target,
    TrendingUp,
    Wallet,
} from 'lucide-react';

import { SharedData } from '@/types';

const overviewNav = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutGrid, active: true },
    { label: 'Accounts', href: '/accounts', icon: Wallet },
    { label: 'Transactions', href: '/transactions', icon: ArrowUpDown },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Insights', href: '/insights', icon: TrendingUp },
    { label: 'Cash Flow', href: '/cash-flow', icon: LineChart },
    { label: 'Notifications', href: '/notifications', icon: Bell },
];

const planningNav = [
    { label: 'Budgets', href: '/budgets', icon: PieChart },
    { label: 'Goals', href: '/goals', icon: Target },
    { label: 'Recurring', href: '/recurring-transactions', icon: Repeat },
    { label: 'Reminders', href: '/reminders', icon: Bell },
    { label: 'Categories', href: '/categories', icon: Folder },
];

const stats = [
    {
        label: 'Total Balance',
        value: '$24,680.50',
        detail: 'Across 3 accounts',
        icon: Wallet,
        valueClass: 'text-foreground',
        iconClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300',
    },
    {
        label: 'Income',
        value: '$6,450.00',
        detail: 'This month',
        icon: ArrowUpRight,
        valueClass: 'text-green-600 dark:text-emerald-300',
        iconClass: 'bg-green-50 text-green-600 dark:bg-emerald-400/10 dark:text-emerald-300',
    },
    {
        label: 'Expenses',
        value: '$4,180.75',
        detail: 'This month',
        icon: ArrowDownRight,
        valueClass: 'text-red-600 dark:text-red-300',
        iconClass: 'bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-300',
    },
    {
        label: 'Net Income',
        value: '$2,269.25',
        detail: 'This month',
        icon: TrendingUp,
        valueClass: 'text-green-600 dark:text-emerald-300',
        iconClass: 'bg-green-50 text-green-600 dark:bg-emerald-400/10 dark:text-emerald-300',
    },
];

const budgetAlerts = [
    { category: 'Groceries', status: 'Near limit', percentage: '84%' },
    { category: 'Dining Out', status: 'Over budget', percentage: '108%' },
];

const categories = [
    { name: 'Entertainment', percentage: '22%', color: 'bg-emerald-500' },
    { name: 'Salary', percentage: '20%', color: 'bg-teal-500' },
    { name: 'Shopping', percentage: '20%', color: 'bg-orange-500' },
    { name: 'Healthcare', percentage: '19%', color: 'bg-red-700' },
    { name: 'Other Income', percentage: '19%', color: 'bg-emerald-950' },
];

function SidebarNavGroup({ label, items }: { label: string; items: typeof overviewNav }) {
    return (
        <div className="space-y-2">
            <p className="px-2 text-[11px] font-medium text-slate-500 dark:text-slate-500">{label}</p>
            <div className="space-y-1">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex h-8 cursor-pointer items-center gap-2 rounded-md px-2 text-[13px] transition duration-200 hover:translate-x-0.5 hover:bg-slate-100 hover:text-slate-950 focus:bg-slate-100 focus:outline-none dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus:bg-slate-800 ${
                                item.active ? 'bg-slate-100 font-medium text-slate-950 dark:bg-slate-800 dark:text-slate-100' : 'text-slate-700 dark:text-slate-400'
                            }`}
                        >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

function AreaPreview() {
    return (
        <svg viewBox="0 0 620 250" className="group h-[260px] w-full overflow-visible" role="img" aria-label="6-month income and expense trend preview">
            <defs>
                <linearGradient id="landing-expense-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="landing-income-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                </linearGradient>
            </defs>
            {[30, 85, 140, 195, 250].map((y) => (
                <line key={y} x1="44" x2="600" y1={y} y2={y} stroke="currentColor" strokeDasharray="4 4" className="text-slate-200/80 dark:text-slate-800" />
            ))}
            {['$8K', '$6K', '$4K', '$2K', '$0'].map((tick, index) => (
                <text key={tick} x="0" y={34 + index * 55} fill="currentColor" className="text-slate-500 dark:text-slate-500" fontSize="12">
                    {tick}
                </text>
            ))}
            <path className="transition-opacity duration-300 group-hover:opacity-90" d="M44 48 C110 62 142 78 196 70 C260 58 300 45 356 51 C425 59 468 55 520 50 C548 48 570 92 600 205 L600 250 L44 250 Z" fill="url(#landing-expense-fill)" />
            <motion.path
                d="M44 48 C110 62 142 78 196 70 C260 58 300 45 356 51 C425 59 468 55 520 50 C548 48 570 92 600 205"
                fill="none"
                stroke="#f43f5e"
                strokeLinecap="round"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.35, delay: 0.2, ease: 'easeOut' }}
                className="transition-[stroke-width] duration-300 group-hover:[stroke-width:4]"
            />
            <path className="transition-opacity duration-300 group-hover:opacity-90" d="M44 185 C120 194 184 194 248 187 C320 181 390 192 474 185 C524 178 560 206 600 230 L600 250 L44 250 Z" fill="url(#landing-income-fill)" />
            <motion.path
                d="M44 185 C120 194 184 194 248 187 C320 181 390 192 474 185 C524 178 560 206 600 230"
                fill="none"
                stroke="#14b8a6"
                strokeLinecap="round"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.35, delay: 0.35, ease: 'easeOut' }}
                className="transition-[stroke-width] duration-300 group-hover:[stroke-width:4]"
            />
            <motion.circle
                cx="520"
                cy="50"
                r="5"
                fill="#f43f5e"
                animate={{ opacity: [0.35, 1, 0.35], scale: [0.9, 1.2, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
                cx="474"
                cy="185"
                r="5"
                fill="#14b8a6"
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.2, 0.9] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
                <text key={month} x={44 + index * 111} y="273" fill="currentColor" className="text-slate-600 dark:text-slate-500" fontSize="12" textAnchor={index === 0 ? 'start' : 'middle'}>
                    {month}
                </text>
            ))}
        </svg>
    );
}

function DonutPreview() {
    return (
        <motion.div
            whileHover={{ rotate: 4, scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="relative mx-auto h-40 w-40 cursor-pointer rounded-full bg-[conic-gradient(#10b981_0_22%,#14b8a6_22%_42%,#f97316_42%_62%,#991b1b_62%_81%,#064e3b_81%_100%)] p-6 shadow-sm"
        >
            <span className="absolute inset-2 rounded-full border border-white/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="h-full w-full rounded-full bg-white dark:bg-[#0a0c10]" />
        </motion.div>
    );
}

export default function Hero() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    return (
        <section className="relative overflow-hidden border-b border-border/60 bg-background pt-20 pb-12 md:pt-24 md:pb-14">
            <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-primary/10 to-transparent" />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0000000d_1px,transparent_1px),linear-gradient(to_bottom,#0000000d_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />

            <div className="container relative mx-auto max-w-7xl px-6">
                <div className="mx-auto max-w-3xl space-y-5 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary"
                    >
                        <Sparkles className="h-4 w-4" />
                        Smart finance for modern life
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.08 }}
                        className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl"
                    >
                        A real dashboard for every dollar, budget, goal, and bill.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.16 }}
                        className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground"
                    >
                        Budget App replaces scattered spreadsheets with the same focused workspace users see after sign in: balances, income, expenses, budgets, goals, reminders, and recent activity in one view.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.24 }}
                        className="flex flex-col items-center justify-center gap-3 sm:flex-row"
                    >
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="flex h-12 items-center gap-2 rounded-lg bg-primary px-7 font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90"
                            >
                                Go to Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/register"
                                    className="flex h-12 items-center gap-2 rounded-lg bg-primary px-7 font-semibold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90"
                                >
                                    Start Managing Smarter
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="flex h-12 items-center rounded-lg border border-border bg-background px-6 font-semibold text-foreground transition hover:bg-muted"
                                >
                                    Sign in
                                </Link>
                            </>
                        )}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 36, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.28, ease: 'easeOut' }}
                    className="relative mx-auto mt-10 max-w-6xl"
                >
                    <div className="relative max-h-[680px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-black/10 sm:max-h-[760px] lg:max-h-[820px] dark:border-slate-800 dark:bg-[#0a0c10] dark:shadow-black/50">
                        <div className="grid min-h-[760px] bg-slate-50 text-slate-950 lg:grid-cols-[240px_1fr] dark:bg-[#030407] dark:text-slate-100">
                            <aside className="hidden border-r border-slate-200 bg-white px-4 py-5 lg:flex lg:flex-col dark:border-slate-800 dark:bg-[#0a0c10]">
                                <div className="mb-8 flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500 text-white">
                                        <Wallet className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-semibold dark:text-slate-100">Budget App</span>
                                </div>

                                <div className="space-y-7">
                                    <SidebarNavGroup label="Overview" items={overviewNav} />
                                    <SidebarNavGroup label="Planning" items={planningNav} />
                                </div>

                                <div className="mt-auto space-y-6 px-2 text-[13px] text-slate-700 dark:text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <span className="h-3.5 w-3.5 rounded-sm border border-slate-900 dark:border-slate-400" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-3.5 w-3.5 rounded-full border border-slate-900 dark:border-slate-400" />
                                        Settings
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs dark:bg-slate-800 dark:text-slate-200">L1</span>
                                        Load Test 1
                                    </div>
                                </div>
                            </aside>

                            <div className="min-w-0 p-4 sm:p-6 lg:p-8">
                                <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold tracking-tight dark:text-slate-100">Dashboard</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-500">Welcome back! Here's your financial overview.</p>
                                    </div>
                                    <button className="flex h-9 w-fit items-center gap-2 rounded-md bg-emerald-500 px-4 text-sm font-medium text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-md">
                                        <Plus className="h-4 w-4" />
                                        Quick Add
                                    </button>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    {stats.map((stat) => {
                                        const Icon = stat.icon;

                                        return (
                                            <motion.div
                                                key={stat.label}
                                                whileHover={{ y: -4 }}
                                                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                                                className="group rounded-lg border border-slate-200 bg-white p-5 transition duration-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5 dark:border-slate-800 dark:bg-[#0a0c10] dark:hover:border-emerald-400/30 dark:hover:bg-slate-900/70"
                                            >
                                                <div className="mb-7 flex items-center justify-between">
                                                    <p className="text-sm font-semibold dark:text-slate-100">{stat.label}</p>
                                                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg transition duration-200 group-hover:scale-110 ${stat.iconClass}`}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                </div>
                                                <p className={`font-mono text-[clamp(0.875rem,1.18vw,1.25rem)] font-bold leading-none tracking-normal whitespace-nowrap tabular-nums ${stat.valueClass}`}>
                                                    {stat.value}
                                                </p>
                                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">{stat.detail}</p>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                <div className="mt-5 grid gap-5 xl:grid-cols-[1.8fr_0.9fr]">
                                    <div className="rounded-lg border border-slate-200 bg-white p-5 transition duration-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5 dark:border-slate-800 dark:bg-[#0a0c10] dark:hover:border-emerald-400/30 dark:hover:bg-slate-900/70">
                                        <div className="mb-5 flex items-center justify-between gap-3">
                                            <div>
                                                <h3 className="font-semibold dark:text-slate-100">6-Month Trend</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-500">Income vs Expenses</p>
                                            </div>
                                            <span className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400">USD</span>
                                        </div>
                                        <AreaPreview />
                                    </div>

                                    <div className="group rounded-lg border border-slate-200 bg-white p-5 transition duration-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5 dark:border-slate-800 dark:bg-[#0a0c10] dark:hover:border-emerald-400/30 dark:hover:bg-slate-900/70">
                                        <h3 className="font-semibold dark:text-slate-100">Spending by Category</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-500">This month</p>
                                        <div className="py-8">
                                            <DonutPreview />
                                        </div>
                                        <div className="space-y-2">
                                            {categories.map((category) => (
                                                <div key={category.name} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm transition duration-200 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100">
                                                    <span className={`h-2.5 w-2.5 rounded-full transition duration-200 group-hover:scale-110 ${category.color}`} />
                                                    <span className="flex-1 truncate">{category.name}</span>
                                                    <span className="font-mono text-slate-500 dark:text-slate-500">{category.percentage}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 transition duration-200 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/5 dark:border-slate-800 dark:bg-[#0a0c10] dark:hover:border-emerald-400/30 dark:hover:bg-slate-900/70">
                                    <div className="mb-7 flex items-center justify-between">
                                        <h3 className="font-semibold dark:text-slate-100">Budget Alerts</h3>
                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">{budgetAlerts.length}</span>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        {budgetAlerts.map((alert) => (
                                            <div key={alert.category} className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 p-3 transition duration-200 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50/40 dark:border-slate-800 dark:hover:border-red-400/30 dark:hover:bg-red-400/10">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium dark:text-slate-100">{alert.category}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-500">{alert.status}</p>
                                                </div>
                                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-400/10 dark:text-red-300">{alert.percentage}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent dark:from-[#0a0c10]" />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
