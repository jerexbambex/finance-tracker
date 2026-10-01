import React, { useState } from 'react';
import {
    BarChart,
    Bar,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Layers, TrendingUp, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { currencySymbol, formatCurrency as baseFmt } from '@/lib/formatCurrency';
import { KravioCard } from './KravioCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MonthlyTrend {
    month: string;
    income: Record<string, number>;
    expense: Record<string, number>;
}

interface KravioHeroChartProps {
    monthlyTrend: MonthlyTrend[];
    primaryCurrency: string;
    currencies?: Record<string, { symbol: string; label: string }>;
    className?: string;
}

export function KravioHeroChart({
    monthlyTrend,
    primaryCurrency,
    currencies,
    className,
}: KravioHeroChartProps) {
    const trendCurrencies = [
        ...new Set(
            monthlyTrend.flatMap((d) => [...Object.keys(d.income), ...Object.keys(d.expense)]),
        ),
    ];
    const [selectedCurrency, setSelectedCurrency] = useState(
        trendCurrencies[0] ?? primaryCurrency ?? 'USD',
    );
    const [chartView, setChartView] = useState<'bars' | 'area'>('bars');
    const [activeHoverIndex, setActiveHoverIndex] = useState<number | null>(null);

    const chartData = monthlyTrend.map((d, index) => {
        const inc = d.income[selectedCurrency] ?? 0;
        const exp = d.expense[selectedCurrency] ?? 0;
        const net = inc - exp;
        return {
            index,
            month: d.month,
            income: inc,
            expense: exp,
            net,
        };
    });

    const activeItem = activeHoverIndex !== null ? chartData[activeHoverIndex] : chartData[chartData.length - 1];

    const totalIncome = chartData.reduce((s, i) => s + i.income, 0);
    const totalExpense = chartData.reduce((s, i) => s + i.expense, 0);
    const avgExpense = chartData.length > 0 ? totalExpense / chartData.length : 0;
    const peakExpenseMonth = [...chartData].sort((a, b) => b.expense - a.expense)[0]?.month ?? '-';

    const formatCurrency = (val: number) => baseFmt(val, selectedCurrency);
    const formatCompactCurrency = (val: number) => {
        const compact = new Intl.NumberFormat('en', {
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(val);
        return (currencySymbol(selectedCurrency) || '$') + compact;
    };

    return (
        <KravioCard
            pattern
            className={cn('w-full animate-rise [animation-delay:200ms]', className)}
            innerClassName="p-4 sm:p-6"
        >
            {/* Header Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                            Financial Volume & Cash Flow
                        </h3>
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                            Last 6 Months
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Interactive breakdown of monthly income vs. outgoing expenditures
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* View Switcher: Bar volume vs Smooth Area */}
                    <div className="flex items-center rounded-lg border border-border/70 bg-muted/50 p-0.5 text-xs">
                        <button
                            type="button"
                            onClick={() => setChartView('bars')}
                            className={cn(
                                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                                chartView === 'bars'
                                    ? 'bg-card text-foreground shadow-xs font-semibold'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <BarChart3 className="h-3.5 w-3.5" />
                            <span>Volume</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setChartView('area')}
                            className={cn(
                                'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                                chartView === 'area'
                                    ? 'bg-card text-foreground shadow-xs font-semibold'
                                    : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <LineChartIcon className="h-3.5 w-3.5" />
                            <span>Trend</span>
                        </button>
                    </div>

                    {/* Currency Selector */}
                    {trendCurrencies.length > 1 && (
                        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                            <SelectTrigger className="h-8 w-24 text-xs font-medium">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="end">
                                {trendCurrencies.map((curr) => (
                                    <SelectItem key={curr} value={curr} className="text-xs font-medium">
                                        {curr}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            {/* Active Highlight Banner */}
            {activeItem && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-muted/40 border border-border/40 px-3.5 py-2">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {activeItem.month} Overview
                        </span>
                        <div className="h-3 w-px bg-border" />
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-muted-foreground">Income:</span>
                            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(activeItem.income)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className="h-2 w-2 rounded-full bg-rose-500" />
                            <span className="text-muted-foreground">Expense:</span>
                            <span className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                                {formatCurrency(activeItem.expense)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                        <span className="text-muted-foreground">Net:</span>
                        <span
                            className={cn(
                                'font-mono font-bold',
                                activeItem.net >= 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400',
                            )}
                        >
                            {activeItem.net >= 0 ? '+' : ''}
                            {formatCurrency(activeItem.net)}
                        </span>
                    </div>
                </div>
            )}

            {/* Main Chart Canvas */}
            <div className="mt-4 h-[260px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {chartView === 'bars' ? (
                        <BarChart
                            data={chartData}
                            margin={{ top: 12, right: 10, left: -10, bottom: 0 }}
                            onMouseMove={(state) => {
                                if (state.activeTooltipIndex !== undefined) {
                                    setActiveHoverIndex(Number(state.activeTooltipIndex));
                                }
                            }}
                            onMouseLeave={() => setActiveHoverIndex(null)}
                        >
                            <defs>
                                <linearGradient id="kravioIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#059669" stopOpacity={0.65} />
                                </linearGradient>
                                <linearGradient id="kravioExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#37475d" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#1f2937" stopOpacity={0.7} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                                className="stroke-border/40"
                            />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                className="text-xs font-medium text-muted-foreground fill-muted-foreground"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={65}
                                tickFormatter={formatCompactCurrency}
                                className="text-xs font-mono text-muted-foreground fill-muted-foreground"
                            />
                            <Tooltip
                                cursor={{ fill: 'currentColor', opacity: 0.04 }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const inc = Number(payload.find((p) => p.dataKey === 'income')?.value ?? 0);
                                        const exp = Number(payload.find((p) => p.dataKey === 'expense')?.value ?? 0);
                                        const m = payload[0]?.payload?.month;
                                        return (
                                            <div className="rounded-lg border border-border/70 bg-card p-2.5 shadow-md text-xs">
                                                <p className="font-semibold text-foreground mb-1.5">{m}</p>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="flex items-center gap-1 text-emerald-600">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            Income
                                                        </span>
                                                        <span className="font-mono font-medium">{formatCurrency(inc)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="flex items-center gap-1 text-muted-foreground">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                                                            Expense
                                                        </span>
                                                        <span className="font-mono font-medium">{formatCurrency(exp)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="income"
                                name="Income"
                                fill="url(#kravioIncomeGrad)"
                                radius={[6, 6, 2, 2]}
                                maxBarSize={32}
                            />
                            <Bar
                                dataKey="expense"
                                name="Expense"
                                fill="url(#kravioExpenseGrad)"
                                radius={[6, 6, 2, 2]}
                                maxBarSize={32}
                            />
                        </BarChart>
                    ) : (
                        <AreaChart
                            data={chartData}
                            margin={{ top: 12, right: 10, left: -10, bottom: 0 }}
                            onMouseMove={(state) => {
                                if (state.activeTooltipIndex !== undefined) {
                                    setActiveHoverIndex(Number(state.activeTooltipIndex));
                                }
                            }}
                            onMouseLeave={() => setActiveHoverIndex(null)}
                        >
                            <defs>
                                <linearGradient id="kravioAreaIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="kravioAreaExpense" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                vertical={false}
                                strokeDasharray="3 3"
                                className="stroke-border/40"
                            />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                className="text-xs font-medium text-muted-foreground fill-muted-foreground"
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                width={65}
                                tickFormatter={formatCompactCurrency}
                                className="text-xs font-mono text-muted-foreground fill-muted-foreground"
                            />
                            <Tooltip
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const inc = Number(payload.find((p) => p.dataKey === 'income')?.value ?? 0);
                                        const exp = Number(payload.find((p) => p.dataKey === 'expense')?.value ?? 0);
                                        const m = payload[0]?.payload?.month;
                                        return (
                                            <div className="rounded-lg border border-border/70 bg-card p-2.5 shadow-md text-xs">
                                                <p className="font-semibold text-foreground mb-1.5">{m}</p>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="flex items-center gap-1 text-emerald-600">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            Income
                                                        </span>
                                                        <span className="font-mono font-medium">{formatCurrency(inc)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="flex items-center gap-1 text-rose-600">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                            Expense
                                                        </span>
                                                        <span className="font-mono font-medium">{formatCurrency(exp)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                fill="url(#kravioAreaIncome)"
                                dot={false}
                                activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                stroke="#ef4444"
                                strokeWidth={2.5}
                                fill="url(#kravioAreaExpense)"
                                dot={false}
                                activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                            />
                        </AreaChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Bottom Summary Strip */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-border/40 pt-3 text-xs">
                <div>
                    <span className="text-muted-foreground block text-[11px]">6-Month Total Volume</span>
                    <span className="font-mono font-semibold text-foreground text-sm">
                        {formatCurrency(totalIncome + totalExpense)}
                    </span>
                </div>
                <div>
                    <span className="text-muted-foreground block text-[11px]">Avg. Monthly Spend</span>
                    <span className="font-mono font-semibold text-foreground text-sm">
                        {formatCurrency(avgExpense)}
                    </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <span className="text-muted-foreground block text-[11px]">Peak Spend Month</span>
                    <span className="font-semibold text-foreground text-sm">
                        {peakExpenseMonth}
                    </span>
                </div>
            </div>
        </KravioCard>
    );
}
