import { Head, router } from '@inertiajs/react';
import { Download, Printer, TrendingUp, TrendingDown, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Sector } from 'recharts';
import { type PieSectorDataItem } from 'recharts/types/polar/Pie';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency as baseFmt } from '@/lib/formatCurrency';
import { KravioCard } from '@/components/dashboard/KravioCard';
import { KravioKPICard } from '@/components/dashboard/KravioKPICard';

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  currency: string;
}

interface AccountSpending {
  account: string;
  amount: number;
  currency: string;
}

interface MonthlyTrend {
  month: string;
  income: Record<string, number>;
  expense: Record<string, number>;
  net: Record<string, number>;
}

interface YoYComparison {
  month: string;
  currentYear: Record<string, number>;
  previousYear: Record<string, number>;
  change: Record<string, number>;
}

interface Props {
  categorySpending: CategorySpending[];
  monthlyTrends: MonthlyTrend[];
  totalIncomeByCurrency: Record<string, number>;
  totalExpenseByCurrency: Record<string, number>;
  avgDailySpendingByCurrency: Record<string, number>;
  accountSpending: AccountSpending[];
  yoyComparison: YoYComparison[];
  startDate: string;
  endDate: string;
  currencies: Record<string, { symbol: string; label: string }>;
}

const COLORS = [
  '#00d4be',
  '#3f9fe8',
  '#e4a339',
  '#ed3151',
  '#8b5cf6',
  '#10b981',
];

export default function Index({
  categorySpending,
  monthlyTrends,
  totalIncomeByCurrency,
  totalExpenseByCurrency,
  avgDailySpendingByCurrency,
  startDate,
  endDate,
}: Props) {
  const [rangeStart, setRangeStart] = useState(startDate);
  const [rangeEnd, setRangeEnd] = useState(endDate);

  const applyRange = (start: string, end: string) => {
    setRangeStart(start);
    setRangeEnd(end);
    router.get('/reports', { start_date: start, end_date: end }, { preserveScroll: true, preserveState: true });
  };

  const applyPreset = (preset: 'this-month' | 'last-month' | 'this-year') => {
    const now = new Date();
    let start: Date;
    let end: Date;
    if (preset === 'this-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (preset === 'last-month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    }
    const toIso = (d: Date) => d.toLocaleDateString('en-CA');
    applyRange(toIso(start), toIso(end));
  };

  const primaryCurrency =
    Object.keys(totalIncomeByCurrency)[0] ??
    Object.keys(totalExpenseByCurrency)[0] ??
    'USD';

  const formatCurrency = (amount: number, currency = primaryCurrency) => baseFmt(amount, currency);

  const categoryCurrencies = useMemo(
    () => [...new Set(categorySpending.map((c) => c.currency))],
    [categorySpending],
  );

  const trendCurrencies = useMemo(() => {
    const s = new Set<string>();
    monthlyTrends.forEach((t) => {
      Object.keys(t.income).forEach((c) => s.add(c));
      Object.keys(t.expense).forEach((c) => s.add(c));
    });
    return [...s];
  }, [monthlyTrends]);

  const [activeCategory, setActiveCategory] = useState('');
  const [categoryCurrency, setCategoryCurrency] = useState(() => categoryCurrencies[0] ?? '');
  const [trendCurrency, setTrendCurrency] = useState(() => trendCurrencies[0] ?? '');

  const filteredCategorySpending = useMemo(
    () => categorySpending.filter((c) => c.currency === categoryCurrency),
    [categorySpending, categoryCurrency],
  );

  const effectiveCategory = filteredCategorySpending.some((c) => c.category === activeCategory)
    ? activeCategory
    : (filteredCategorySpending[0]?.category ?? '');

  const topCategories = filteredCategorySpending.slice(0, 5);

  const activeIndex = useMemo(() => {
    const i = filteredCategorySpending.findIndex((c) => c.category === effectiveCategory);
    return i >= 0 ? i : 0;
  }, [filteredCategorySpending, effectiveCategory]);

  const trendChartData = useMemo(
    () =>
      monthlyTrends.map((t) => ({
        month: t.month,
        income: t.income[trendCurrency] ?? 0,
        expense: t.expense[trendCurrency] ?? 0,
      })),
    [monthlyTrends, trendCurrency],
  );

  const primaryIncome = totalIncomeByCurrency[primaryCurrency] ?? 0;
  const primaryExpense = totalExpenseByCurrency[primaryCurrency] ?? 0;
  const netIncome = primaryIncome - primaryExpense;
  const savingsRate = primaryIncome > 0 ? (netIncome / primaryIncome) * 100 : 0;

  return (
    <AppLayout>
      <Head title="Reports" />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* ── Kravio Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-rise">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Financial Analytics & Reports</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Deep dive into category allocations, historical cash dynamics, and savings performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a href={`/reports/pdf?start_date=${rangeStart}&end_date=${rangeEnd}`} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="h-8 text-xs font-semibold">
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                Statement PDF
              </Button>
            </a>
            <a href="/export/transactions">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export CSV
              </Button>
            </a>
          </div>
        </div>

        {/* ── Date Range Controls ──────────────────────────────────────── */}
        <KravioCard pattern className="animate-rise [animation-delay:60ms]" innerClassName="p-3.5 sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground mr-1 text-[11px] font-semibold uppercase">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('this-month')}
                className="rounded-md border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors shadow-2xs"
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => applyPreset('last-month')}
                className="rounded-md border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors shadow-2xs"
              >
                Last Month
              </button>
              <button
                type="button"
                onClick={() => applyPreset('this-year')}
                className="rounded-md border border-border/70 bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors shadow-2xs"
              >
                This Year
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-[11px]">From:</span>
                <Input
                  id="start_date"
                  type="date"
                  value={rangeStart}
                  max={rangeEnd}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="h-8 text-xs w-36"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground text-[11px]">To:</span>
                <Input
                  id="end_date"
                  type="date"
                  value={rangeEnd}
                  min={rangeStart}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="h-8 text-xs w-36"
                />
              </div>
              <Button size="sm" className="h-8 text-xs px-3" onClick={() => applyRange(rangeStart, rangeEnd)} disabled={!rangeStart || !rangeEnd}>
                Apply Range
              </Button>
            </div>
          </div>
        </KravioCard>

        {/* ── Kravio KPI Metric Strip ──────────────────────────────────── */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <KravioKPICard
            index={0}
            title="Total Income"
            value={Object.entries(totalIncomeByCurrency).map(([c, a]) => formatCurrency(a, c)).join(', ') || '$0.00'}
            icon={ArrowUpRight}
            iconColorClass="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
            subtitle="Filtered period revenue"
          />
          <KravioKPICard
            index={1}
            title="Total Expenses"
            value={Object.entries(totalExpenseByCurrency).map(([c, a]) => formatCurrency(a, c)).join(', ') || '$0.00'}
            icon={ArrowDownRight}
            iconColorClass="bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
            subtitle="Filtered period expenditures"
          />
          <KravioKPICard
            index={2}
            title="Savings Rate"
            value={`${savingsRate.toFixed(1)}%`}
            icon={PieChartIcon}
            iconColorClass="bg-primary/10 text-primary"
            subtitle={`${primaryCurrency} net: ${formatCurrency(netIncome, primaryCurrency)}`}
          />
          <KravioKPICard
            index={3}
            title="Avg Daily Spend"
            value={Object.entries(avgDailySpendingByCurrency).map(([c, a]) => formatCurrency(a, c)).join(', ') || '$0.00'}
            icon={TrendingDown}
            iconColorClass="bg-purple-500/10 text-purple-600"
            subtitle="Daily outgoing burn"
          />
        </div>

        {/* ── Category Breakdown & Top Spend Split ──────────────────────── */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Donut Category Chart */}
          <KravioCard pattern className="animate-rise [animation-delay:180ms]" innerClassName="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <h3 className="text-sm font-semibold text-foreground">Category Distribution</h3>
              <div className="flex items-center gap-2">
                {categoryCurrencies.length > 1 && (
                  <Select value={categoryCurrency} onValueChange={setCategoryCurrency}>
                    <SelectTrigger className="h-7 w-20 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {categoryCurrencies.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-col items-center justify-center">
              {filteredCategorySpending.length > 0 ? (
                <div className="relative h-56 w-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload as CategorySpending;
                            return (
                              <div className="rounded-lg border border-border/70 bg-card p-2 shadow-md text-xs">
                                <p className="font-semibold text-foreground">{data.category}</p>
                                <p className="font-mono text-muted-foreground">{formatCurrency(data.amount, data.currency)} ({data.percentage}%)</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Pie
                        data={filteredCategorySpending}
                        dataKey="amount"
                        nameKey="category"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {filteredCategorySpending.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground py-12">No category spend recorded in this range</p>
              )}
            </div>
          </KravioCard>

          {/* Top Spending Categories Progress Meters */}
          <KravioCard pattern className="animate-rise [animation-delay:220ms]" innerClassName="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div className="pb-3 border-b border-border/40">
              <h3 className="text-sm font-semibold text-foreground">Top Spending Categories</h3>
              <p className="text-xs text-muted-foreground">Highest outgoing expenditure shares</p>
            </div>

            <div className="mt-4 space-y-3.5 flex-1">
              {topCategories.map((cat, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-semibold text-foreground">{cat.category}</span>
                    </div>
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(cat.amount, cat.currency)} <span className="text-muted-foreground font-normal text-[11px]">({cat.percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${cat.percentage}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}

              {topCategories.length === 0 && (
                <p className="text-xs text-muted-foreground py-8 text-center">No category spending in this period</p>
              )}
            </div>
          </KravioCard>
        </div>

        {/* ── 12-Month Historical Trend Chart ──────────────────────────── */}
        <KravioCard pattern className="animate-rise [animation-delay:260ms]" innerClassName="p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h3 className="text-sm font-semibold text-foreground">12-Month Income vs. Expense Trajectory</h3>
              <p className="text-xs text-muted-foreground">Historical volume comparison over the past 12 months</p>
            </div>
            {trendCurrencies.length > 1 && (
              <Select value={trendCurrency} onValueChange={setTrendCurrency}>
                <SelectTrigger className="h-7 w-24 text-xs font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  {trendCurrencies.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="mt-4 h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChartData} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="repIncomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="repExpenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs font-medium fill-muted-foreground" />
                <YAxis tickLine={false} axisLine={false} width={65} tickFormatter={(v) => formatCurrency(v, trendCurrency)} className="text-xs font-mono fill-muted-foreground" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const inc = Number(payload.find((p) => p.dataKey === 'income')?.value ?? 0);
                      const exp = Number(payload.find((p) => p.dataKey === 'expense')?.value ?? 0);
                      const m = payload[0]?.payload?.month;
                      return (
                        <div className="rounded-lg border border-border/70 bg-card p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-foreground mb-1">{m}</p>
                          <p className="text-emerald-600 font-mono">Income: {formatCurrency(inc, trendCurrency)}</p>
                          <p className="text-rose-600 font-mono">Expense: {formatCurrency(exp, trendCurrency)}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} fill="url(#repIncomeGrad)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} fill="url(#repExpenseGrad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </KravioCard>
      </div>
    </AppLayout>
  );
}
