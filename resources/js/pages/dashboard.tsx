import { Head, Link, usePage } from '@inertiajs/react';
import {
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Sparkles,
    Printer,
    RotateCw,
    Download,
    Layers,
    Plus,
    CheckCircle2,
    Calendar,
    ChevronRight,
    ExternalLink,
    PieChart,
    Target,
} from 'lucide-react';
import { useState, useMemo } from 'react';

import QuickAddTransaction from '@/components/QuickAddTransaction';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency as baseFmt, currencySymbol } from '@/lib/formatCurrency';
import { dashboard } from '@/routes';
import { type BreadcrumbItem, type SharedData } from '@/types';

// Kravio Modular Dashboard Components
import { KravioKPICard } from '@/components/dashboard/KravioKPICard';
import { KravioHeroChart } from '@/components/dashboard/KravioHeroChart';
import { KravioSideRadar } from '@/components/dashboard/KravioSideRadar';
import { KravioAccountsSection } from '@/components/dashboard/KravioAccountsSection';
import { KravioTransactionsTable } from '@/components/dashboard/KravioTransactionsTable';
import { KravioBudgetsGoals } from '@/components/dashboard/KravioBudgetsGoals';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
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

interface Budget {
    id: string;
    category: string;
    percentage: number;
    amount: number;
    spent: number;
    status: 'ok' | 'warning' | 'exceeded';
    currency: string;
}

interface Goal {
    name: string;
    percentage: number;
    current_amount: number;
    target_amount: number;
    currency: string;
}

interface Category {
    id: string;
    name: string;
    type: string;
    color?: string;
    is_active: boolean;
}

interface CategorySpending {
    name: string;
    amount: number;
    currency: string;
    color: string;
}

interface MonthlyTrend {
    month: string;
    income: Record<string, number>;
    expense: Record<string, number>;
}

interface Reminder {
    id: string;
    title: string;
    amount?: number;
    due_date: string;
    category?: { name: string; color?: string };
}

interface NetWorth {
    total: number;
    baseCurrency: string;
    excludedCurrencies: string[];
    showConverted: boolean;
}

interface Props {
    accounts: Account[];
    balancesByCurrency: Record<string, number>;
    netWorth: NetWorth;
    recentTransactions: Transaction[];
    incomeByCurrency: Record<string, number>;
    expensesByCurrency: Record<string, number>;
    categorySpending: CategorySpending[];
    monthlyTrend: MonthlyTrend[];
    budgets: Budget[];
    budgetAlerts: Budget[];
    goals: Goal[];
    categories: Category[];
    upcomingReminders: Reminder[];
    currencies: Record<string, { symbol: string; label: string }>;
}

export default function Dashboard({
    accounts,
    balancesByCurrency,
    netWorth,
    recentTransactions,
    incomeByCurrency,
    expensesByCurrency,
    categorySpending,
    monthlyTrend,
    budgets,
    budgetAlerts,
    goals,
    categories,
    upcomingReminders,
    currencies,
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;
    const userName = user?.name ? user.name.split(' ')[0] : 'there';

    const baseCurrency = netWorth?.baseCurrency ?? user?.base_currency ?? 'USD';
    const primaryCurrency = baseCurrency;
    const currencyList = useMemo(() => {
        const set = new Set<string>();
        Object.keys(balancesByCurrency).forEach((c) => set.add(c));
        Object.keys(incomeByCurrency).forEach((c) => set.add(c));
        Object.keys(expensesByCurrency).forEach((c) => set.add(c));
        if (baseCurrency) set.add(baseCurrency);
        return Array.from(set);
    }, [balancesByCurrency, incomeByCurrency, expensesByCurrency, baseCurrency]);

    const hasMultipleCurrencies = Object.keys(balancesByCurrency).length > 1;
    const [activeKpiCurrency, setActiveKpiCurrency] = useState<string>('all');
    const [timeRange, setTimeRange] = useState<'this-month' | 'last-30' | '6-months' | 'this-year'>('this-month');

    const formatCurrency = (amount: number, currency: string = baseCurrency) =>
        baseFmt(amount, currency);

    // Active KPI calculations based on selected currency
    const activeCurrency = activeKpiCurrency === 'all' ? baseCurrency : activeKpiCurrency;
    
    // Total Balance
    const displayBalance = activeKpiCurrency === 'all'
        ? (hasMultipleCurrencies ? (netWorth?.total ?? 0) : (balancesByCurrency[currencyList[0]] ?? 0))
        : (balancesByCurrency[activeKpiCurrency] ?? 0);
    const displayBalanceFormatted = formatCurrency(displayBalance, activeCurrency);

    // Monthly Income
    const displayIncome = incomeByCurrency[activeCurrency] ?? 0;
    const displayIncomeFormatted = formatCurrency(displayIncome, activeCurrency);

    // Monthly Expenses
    const displayExpense = expensesByCurrency[activeCurrency] ?? 0;
    const displayExpenseFormatted = formatCurrency(displayExpense, activeCurrency);

    // Net Cash Flow
    const displayNet = displayIncome - displayExpense;
    const displayNetFormatted = formatCurrency(displayNet, activeCurrency);
    const isNetPositive = displayNet >= 0;

    // Calculate budget health summary
    const activeBudgetsCount = budgets.length;
    const exceededBudgetsCount = budgets.filter((b) => b.percentage >= 100).length;
    const warningBudgetsCount = budgets.filter((b) => b.percentage >= 80 && b.percentage < 100).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                {/* ── Kravio Greeting & Dashboard Actions Header ─────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="animate-rise space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                                Hello, {userName} <span className="animate-wave inline-block text-2xl">👋</span>
                            </h1>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Here are the latest insights from your financial accounts & spending activities.
                        </p>
                    </div>

                    <div className="animate-rise [animation-delay:60ms] flex flex-wrap items-center gap-2">
                        {/* Time Range Selector */}
                        <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5 text-xs">
                            {(
                                [
                                    { id: 'this-month', label: 'This Month' },
                                    { id: 'last-30', label: 'Last 30D' },
                                    { id: '6-months', label: '6 Months' },
                                ] as const
                            ).map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setTimeRange(tab.id)}
                                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                        timeRange === tab.id
                                            ? 'bg-card text-foreground shadow-xs font-semibold'
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Direct Quick Add */}
                        <QuickAddTransaction accounts={accounts} categories={categories} />

                        {/* More Options Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 rounded-lg border-border/70 shadow-xs"
                                    aria-label="Dashboard options"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs">
                                <DropdownMenuItem onClick={() => window.location.reload()}>
                                    <RotateCw className="mr-2 h-3.5 w-3.5" />
                                    <span>Refresh Data</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => window.print()}>
                                    <Printer className="mr-2 h-3.5 w-3.5" />
                                    <span>Print Dashboard</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/net-worth">
                                        <Layers className="mr-2 h-3.5 w-3.5" />
                                        <span>Net Worth Report</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/reports">
                                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                                        <span>Analytics Hub</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* ── Kravio KPI Metric Cards Grid ─────────────────────────────── */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Balance / Net Worth Card */}
                    <KravioKPICard
                        index={0}
                        title={activeKpiCurrency === 'all' && hasMultipleCurrencies ? "Total Net Worth" : `${activeCurrency} Balance`}
                        value={displayBalanceFormatted}
                        icon={Wallet}
                        iconColorClass="bg-primary/10 text-primary"
                        headerRight={
                            hasMultipleCurrencies ? (
                                <Select value={activeKpiCurrency} onValueChange={setActiveKpiCurrency}>
                                    <SelectTrigger className="h-6 w-auto min-w-[68px] px-2 text-[11px] rounded-md font-mono whitespace-nowrap bg-background/80 border-border/70 gap-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent align="end" className="text-xs">
                                        <SelectItem value="all" className="text-xs font-mono">
                                            All ({baseCurrency})
                                        </SelectItem>
                                        {Object.keys(balancesByCurrency).map((c) => (
                                            <SelectItem key={c} value={c} className="text-xs font-mono">
                                                {c} ({formatCurrency(balancesByCurrency[c] ?? 0, c)})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : undefined
                        }
                        subtitle={
                            activeKpiCurrency === 'all'
                                ? `${accounts.length} account${accounts.length !== 1 ? 's' : ''}${hasMultipleCurrencies ? ` across ${Object.keys(balancesByCurrency).length} currencies` : ''}`
                                : `${accounts.filter(a => a.currency === activeCurrency).length} ${activeCurrency} account${accounts.filter(a => a.currency === activeCurrency).length !== 1 ? 's' : ''}`
                        }
                        metaRight={
                            activeKpiCurrency === 'all' ? (
                                <Link href="/net-worth" className="text-primary hover:underline font-medium">
                                    Net Worth →
                                </Link>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setActiveKpiCurrency('all')}
                                    className="text-primary hover:underline font-medium"
                                >
                                    Show All ↺
                                </button>
                            )
                        }
                    >
                        {/* Currency Breakdown Chips when All Currencies is Active */}
                        {activeKpiCurrency === 'all' && hasMultipleCurrencies && (
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 pt-0.5">
                                {Object.entries(balancesByCurrency).map(([curr, bal]) => (
                                    <button
                                        key={curr}
                                        type="button"
                                        onClick={() => setActiveKpiCurrency(curr)}
                                        className="group/chip inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted/60 hover:bg-primary/10 hover:border-primary/40 border border-border/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                        title={`Switch dashboard to ${curr} context`}
                                    >
                                        <span className="font-medium text-foreground/80 group-hover/chip:text-primary">{curr}</span>
                                        <span className="tabular-nums">{formatCurrency(bal, curr)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </KravioKPICard>

                    {/* Monthly Income Card */}
                    <KravioKPICard
                        index={1}
                        title={`Income (${activeCurrency})`}
                        value={displayIncomeFormatted}
                        icon={ArrowUpRight}
                        iconColorClass="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                        delta={{
                            value: '+8.4%',
                            isPositive: true,
                            label: 'vs. prev month',
                        }}
                    />

                    {/* Monthly Expenses Card */}
                    <KravioKPICard
                        index={2}
                        title={`Expenses (${activeCurrency})`}
                        value={displayExpenseFormatted}
                        icon={ArrowDownRight}
                        iconColorClass="bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
                        delta={{
                            value: '-3.2%',
                            isPositive: false,
                            label: 'vs. prev month',
                        }}
                    />

                    {/* Net Savings / Flow Card */}
                    <KravioKPICard
                        index={3}
                        title={`Net Cash Flow (${activeCurrency})`}
                        value={displayNetFormatted}
                        icon={TrendingUp}
                        iconColorClass={
                            isNetPositive
                                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                        }
                        subtitle={isNetPositive ? 'Positive surplus 🎉' : 'Spend exceeded income'}
                        metaRight={
                            activeBudgetsCount > 0 ? (
                                <span className="text-[11px] font-medium text-muted-foreground">
                                    {exceededBudgetsCount > 0
                                        ? `${exceededBudgetsCount} over budget`
                                        : 'Budgets on track'}
                                </span>
                            ) : undefined
                        }
                    />
                </div>

                {/* ── Hero Split: Interactive Volume Chart + Side Radar Widget ── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    {/* Hero Chart (8 cols on lg, 7 on xl) */}
                    <div className="lg:col-span-8">
                        <KravioHeroChart
                            monthlyTrend={monthlyTrend}
                            primaryCurrency={primaryCurrency}
                            currencies={currencies}
                        />
                    </div>

                    {/* Side Radar Activity & Alerts (4 cols on lg, 5 on xl) */}
                    <div className="lg:col-span-4">
                        <KravioSideRadar
                            budgets={budgets}
                            budgetAlerts={budgetAlerts}
                            upcomingReminders={upcomingReminders}
                            recentTransactions={recentTransactions}
                            primaryCurrency={primaryCurrency}
                        />
                    </div>
                </div>

                {/* ── Wallets & Bank Accounts Showcase ─────────────────────────── */}
                <KravioAccountsSection
                    accounts={accounts}
                    primaryCurrency={primaryCurrency}
                />

                {/* ── Category Spending Breakdown & Goals Progress ─────────────── */}
                <KravioBudgetsGoals
                    categorySpending={categorySpending}
                    goals={goals}
                    primaryCurrency={primaryCurrency}
                />

                {/* ── Kravio Transactions Explorer Table ──────────────────────── */}
                <KravioTransactionsTable
                    transactions={recentTransactions}
                    accounts={accounts}
                    categories={categories}
                    primaryCurrency={primaryCurrency}
                />
            </div>
        </AppLayout>
    );
}
