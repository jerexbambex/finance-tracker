import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertTriangle,
    ArrowUpRight,
    Calendar,
    DollarSign,
    Lightbulb,
    Minus,
    ReceiptText,
    Repeat,
    Sparkles,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
import type { ElementType, ReactNode } from 'react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency as baseFmt } from '@/lib/formatCurrency';

interface Insight {
    category?: string;
    current?: number;
    average?: number;
    increase_percent?: number;
    type?: string;
    message?: string;
    trend?: string;
    months?: number[];
    total?: number;
    description?: string;
    amount?: number;
    frequency?: number;
    weekend?: number;
    weekday?: number;
    budgeted?: number;
    spent?: number;
    overspend?: number;
    count?: number;
    currency?: string;
}

interface Insights {
    unusual_spending: Insight[];
    category_trends: Insight[];
    recurring_expenses: Insight[];
    spending_patterns: Insight[];
    savings_opportunities: Insight[];
}

interface Props {
    insights: Insights;
    primaryCurrency: string;
}

type InsightSectionProps = {
    title: string;
    description: string;
    icon: ElementType;
    iconClassName: string;
    children: ReactNode;
    className?: string;
    count?: number;
};

function InsightSection({
    title,
    description,
    icon: Icon,
    iconClassName,
    children,
    className = '',
    count,
}: InsightSectionProps) {
    return (
        <Card className={`border-border/50 shadow-sm ${className}`}>
            <CardHeader className="gap-3 pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
                        >
                            <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <CardTitle className="text-base">{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                    {typeof count === 'number' && (
                        <Badge variant="secondary" className="shrink-0">
                            {count}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

function MetricCard({
    label,
    value,
    detail,
    icon: Icon,
    iconClassName,
}: {
    label: string;
    value: string;
    detail: string;
    icon: ElementType;
    iconClassName: string;
}) {
    return (
        <Card className="border-border/50 py-4 shadow-sm">
            <CardContent className="flex items-center justify-between gap-4 px-4">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-1 truncate text-2xl font-semibold tracking-tight">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {detail}
                    </p>
                </div>
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
                >
                    <Icon className="h-5 w-5" />
                </div>
            </CardContent>
        </Card>
    );
}

function TrendIcon({ trend }: { trend?: string }) {
    if (trend === 'increasing') {
        return (
            <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
        );
    }

    if (trend === 'decreasing') {
        return (
            <TrendingDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        );
    }

    return <Minus className="h-4 w-4 text-slate-600 dark:text-slate-300" />;
}

export default function Index({ insights, primaryCurrency }: Props) {
    const [aiInsights, setAiInsights] = useState<string | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    const generateAiInsights = async () => {
        setLoadingAi(true);
        setAiInsights(null);
        try {
            const start = await axios.post('/insights/ai');
            if (start.data.status === 'rate_limited') {
                setAiInsights(start.data.message);
                setLoadingAi(false);
                return;
            }

            const poll = setInterval(async () => {
                try {
                    const res = await axios.get('/insights/ai/status');
                    if (
                        res.data.status === 'completed' ||
                        res.data.status === 'failed'
                    ) {
                        clearInterval(poll);
                        setAiInsights(res.data.insights);
                        setLoadingAi(false);
                    }
                } catch {
                    clearInterval(poll);
                    setLoadingAi(false);
                }
            }, 2000);

            setTimeout(() => {
                clearInterval(poll);
                setLoadingAi(false);
            }, 90000);
        } catch (error) {
            console.error('Failed to generate AI insights:', error);
            setLoadingAi(false);
        }
    };

    const formatCurrency = (amount: number, currency = primaryCurrency) =>
        baseFmt(amount, currency);

    const totalInsightCount = Object.values(insights).reduce(
        (total, group) => total + group.length,
        0,
    );
    const hasAnyInsights = totalInsightCount > 0;
    const topOverspend = insights.savings_opportunities
        .filter((item) => item.overspend && item.overspend > 0)
        .sort((a, b) => (b.overspend ?? 0) - (a.overspend ?? 0))[0];
    const largestUnusualSpend = insights.unusual_spending
        .filter((item) => item.current && item.current > 0)
        .sort((a, b) => (b.current ?? 0) - (a.current ?? 0))[0];
    const recurringTotal = insights.recurring_expenses.reduce(
        (total, item) => total + (item.amount ?? 0),
        0,
    );

    return (
        <AppLayout>
            <Head title="Spending Insights" />

            <div className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col gap-4 rounded-lg border border-border/60 bg-card/60 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                        <div className="max-w-2xl">
                            <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                                <Sparkles className="h-4 w-4" />
                                Spending intelligence
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                Spending Insights
                            </h1>
                            <p className="mt-2 max-w-2xl text-muted-foreground">
                                Spot spending changes, recurring charges, and
                                budget pressure before they turn into surprises.
                            </p>
                        </div>
                        <Button
                            onClick={generateAiInsights}
                            disabled={loadingAi}
                            size="lg"
                            className="w-full sm:w-auto"
                        >
                            <Sparkles className="mr-2 h-5 w-5" />
                            {loadingAi ? 'Analyzing...' : 'Get AI Insights'}
                        </Button>
                    </div>

                    {hasAnyInsights && (
                        <div className="grid gap-4 md:grid-cols-3">
                            <MetricCard
                                label="Active insights"
                                value={totalInsightCount.toString()}
                                detail="Across spending, budgets, and trends"
                                icon={ReceiptText}
                                iconClassName="bg-primary/10 text-primary"
                            />
                            <MetricCard
                                label="Largest spike"
                                value={
                                    largestUnusualSpend
                                        ? formatCurrency(
                                              largestUnusualSpend.current!,
                                              largestUnusualSpend.currency,
                                          )
                                        : formatCurrency(0)
                                }
                                detail={
                                    largestUnusualSpend?.category ??
                                    'No unusual spending detected'
                                }
                                icon={AlertTriangle}
                                iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
                            />
                            <MetricCard
                                label="Recurring total"
                                value={formatCurrency(recurringTotal)}
                                detail={`${insights.recurring_expenses.length} repeated transaction${insights.recurring_expenses.length === 1 ? '' : 's'} detected`}
                                icon={Repeat}
                                iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                            />
                        </div>
                    )}

                    {aiInsights && (
                        <Card className="border-primary/20 bg-primary/5 shadow-sm">
                            <CardHeader>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle>AI Analysis</CardTitle>
                                        <CardDescription>
                                            Personalized readout from your
                                            spending data
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm leading-6 whitespace-pre-line">
                                    {aiInsights}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!hasAnyInsights && (
                        <Card className="border-dashed border-border/70 shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <TrendingUp className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-semibold">
                                    No insights yet
                                </h3>
                                <p className="mt-2 max-w-md text-muted-foreground">
                                    Add a few transactions and budgets to unlock
                                    spending patterns, budget alerts, and
                                    savings opportunities.
                                </p>
                                <Button asChild className="mt-6">
                                    <Link href="/transactions/create">
                                        Add Transaction
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {hasAnyInsights && (
                        <div className="grid gap-6 lg:grid-cols-12">
                            <div className="space-y-6 lg:col-span-7">
                                {insights.unusual_spending.length > 0 && (
                                    <InsightSection
                                        title="Unusual Spending"
                                        description="Categories running higher than your three-month average"
                                        icon={AlertTriangle}
                                        iconClassName="bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                        count={insights.unusual_spending.length}
                                    >
                                        <div className="divide-y divide-border/60">
                                            {insights.unusual_spending.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="font-medium">
                                                                {item.category}
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="gap-1"
                                                                >
                                                                    <ArrowUpRight className="h-3 w-3" />
                                                                    {
                                                                        item.increase_percent
                                                                    }
                                                                    %
                                                                </Badge>
                                                                <span className="text-sm text-muted-foreground">
                                                                    Average{' '}
                                                                    {formatCurrency(
                                                                        item.average!,
                                                                        item.currency,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="text-2xl font-semibold tracking-tight">
                                                            {formatCurrency(
                                                                item.current!,
                                                                item.currency,
                                                            )}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </InsightSection>
                                )}

                                {insights.category_trends.length > 0 && (
                                    <InsightSection
                                        title="Category Trends"
                                        description="Three-month movement by category"
                                        icon={TrendingUp}
                                        iconClassName="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                        count={insights.category_trends.length}
                                    >
                                        <div className="space-y-3">
                                            {insights.category_trends.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="rounded-lg border border-border/60 p-4"
                                                    >
                                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                                                                    <TrendIcon
                                                                        trend={
                                                                            item.trend
                                                                        }
                                                                    />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="truncate font-medium">
                                                                        {
                                                                            item.category
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground capitalize">
                                                                        {
                                                                            item.trend
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="sm:text-right">
                                                                <p className="text-lg font-semibold">
                                                                    {formatCurrency(
                                                                        item.total!,
                                                                        item.currency,
                                                                    )}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.months
                                                                        ?.map(
                                                                            (
                                                                                month,
                                                                            ) =>
                                                                                formatCurrency(
                                                                                    month,
                                                                                    item.currency,
                                                                                ),
                                                                        )
                                                                        .join(
                                                                            ' / ',
                                                                        )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </InsightSection>
                                )}
                            </div>

                            <div className="space-y-6 lg:col-span-5">
                                {insights.savings_opportunities.length > 0 && (
                                    <InsightSection
                                        title="Savings Opportunities"
                                        description="Places where small adjustments can help"
                                        icon={Lightbulb}
                                        iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                        count={
                                            insights.savings_opportunities
                                                .length
                                        }
                                    >
                                        <div className="space-y-4">
                                            {topOverspend && (
                                                <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                                                Highest budget
                                                                pressure
                                                            </p>
                                                            <p className="mt-1 font-semibold">
                                                                {
                                                                    topOverspend.category
                                                                }
                                                            </p>
                                                        </div>
                                                        <p className="text-xl font-semibold text-amber-700 dark:text-amber-300">
                                                            {formatCurrency(
                                                                topOverspend.overspend!,
                                                                topOverspend.currency,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {insights.savings_opportunities.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="rounded-lg border border-border/60 p-4"
                                                    >
                                                        {item.category && (
                                                            <>
                                                                <div className="mb-3 flex items-start justify-between gap-3">
                                                                    <p className="font-medium">
                                                                        {
                                                                            item.category
                                                                        }
                                                                    </p>
                                                                    <Badge variant="outline">
                                                                        Over
                                                                        budget
                                                                    </Badge>
                                                                </div>
                                                                <Progress
                                                                    value={Math.min(
                                                                        ((item.spent ??
                                                                            0) /
                                                                            Math.max(
                                                                                item.budgeted ??
                                                                                    1,
                                                                                1,
                                                                            )) *
                                                                            100,
                                                                        100,
                                                                    )}
                                                                    className="h-2"
                                                                />
                                                                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                                                                    <div>
                                                                        <p className="text-muted-foreground">
                                                                            Budget
                                                                        </p>
                                                                        <p className="font-medium">
                                                                            {formatCurrency(
                                                                                item.budgeted!,
                                                                                item.currency,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-muted-foreground">
                                                                            Spent
                                                                        </p>
                                                                        <p className="font-medium text-orange-600 dark:text-orange-400">
                                                                            {formatCurrency(
                                                                                item.spent!,
                                                                                item.currency,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-muted-foreground">
                                                                            Reduce
                                                                        </p>
                                                                        <p className="font-medium text-amber-700 dark:text-amber-300">
                                                                            {formatCurrency(
                                                                                item.overspend!,
                                                                                item.currency,
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                        {item.type ===
                                                            'small_purchases' && (
                                                            <div className="flex items-center justify-between gap-4">
                                                                <div>
                                                                    <p className="font-medium">
                                                                        Small
                                                                        Purchases
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            item.count
                                                                        }{' '}
                                                                        low-value
                                                                        purchases
                                                                    </p>
                                                                </div>
                                                                <p className="text-xl font-semibold">
                                                                    {formatCurrency(
                                                                        item.total!,
                                                                        item.currency,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </InsightSection>
                                )}

                                {insights.recurring_expenses.length > 0 && (
                                    <InsightSection
                                        title="Recurring Expenses"
                                        description="Repeated transactions detected over time"
                                        icon={Repeat}
                                        iconClassName="bg-sky-500/10 text-sky-600 dark:text-sky-400"
                                        count={
                                            insights.recurring_expenses.length
                                        }
                                    >
                                        <div className="divide-y divide-border/60">
                                            {insights.recurring_expenses.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                                    >
                                                        <div className="min-w-0">
                                                            <p className="truncate font-medium">
                                                                {
                                                                    item.description
                                                                }
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                <Badge variant="secondary">
                                                                    {
                                                                        item.category
                                                                    }
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {
                                                                        item.frequency
                                                                    }
                                                                    x in 3
                                                                    months
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <p className="shrink-0 text-lg font-semibold">
                                                            {formatCurrency(
                                                                item.amount!,
                                                                item.currency,
                                                            )}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </InsightSection>
                                )}
                            </div>

                            {insights.spending_patterns.length > 0 && (
                                <InsightSection
                                    title="Spending Patterns"
                                    description="Behavioral signals from your transaction history"
                                    icon={Calendar}
                                    iconClassName="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    className="lg:col-span-12"
                                    count={insights.spending_patterns.length}
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {insights.spending_patterns.map(
                                            (item, index) => (
                                                <div key={index}>
                                                    {item.type ===
                                                        'weekend_vs_weekday' && (
                                                        <div className="rounded-lg border border-border/60 p-5">
                                                            <div className="mb-4 flex items-center justify-between gap-3">
                                                                <p className="flex items-center gap-2 font-medium">
                                                                    <Calendar className="h-4 w-4" />
                                                                    Weekend vs
                                                                    Weekday
                                                                </p>
                                                                {item.currency && (
                                                                    <Badge variant="outline">
                                                                        {
                                                                            item.currency
                                                                        }
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Weekend
                                                                    </p>
                                                                    <p className="mt-1 text-2xl font-semibold">
                                                                        {formatCurrency(
                                                                            item.weekend!,
                                                                            item.currency,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Weekday
                                                                    </p>
                                                                    <p className="mt-1 text-2xl font-semibold">
                                                                        {formatCurrency(
                                                                            item.weekday!,
                                                                            item.currency,
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {item.type ===
                                                        'average_transaction' && (
                                                        <div className="rounded-lg border border-border/60 p-5">
                                                            <div className="mb-4 flex items-center justify-between gap-3">
                                                                <p className="flex items-center gap-2 font-medium">
                                                                    <DollarSign className="h-4 w-4" />
                                                                    Average
                                                                    Transaction
                                                                </p>
                                                                {item.currency && (
                                                                    <Badge variant="outline">
                                                                        {
                                                                            item.currency
                                                                        }
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-3xl font-semibold tracking-tight">
                                                                {formatCurrency(
                                                                    item.amount!,
                                                                    item.currency,
                                                                )}
                                                            </p>
                                                            <p className="mt-1 text-sm text-muted-foreground">
                                                                per transaction
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </InsightSection>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
