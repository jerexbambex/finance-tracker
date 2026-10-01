import { Head, router, Link } from '@inertiajs/react';
import { Landmark, TrendingDown, TrendingUp, Wallet, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, currencySymbol } from '@/lib/formatCurrency';
import { KravioCard } from '@/components/dashboard/KravioCard';
import { KravioKPICard } from '@/components/dashboard/KravioKPICard';

interface TrendPoint {
  date: string;
  netWorth: number;
}

interface Props {
  trend: TrendPoint[];
  currentTotal: number;
  currentByCurrency: Record<string, number>;
  baseCurrency: string;
  excludedCurrencies: string[];
  range: 30 | 90 | 365;
}

const RANGE_LABELS: Record<number, string> = { 30: '30 days', 90: '90 days', 365: '1 year' };

export default function Index({ trend, currentTotal, currentByCurrency, baseCurrency, excludedCurrencies, range }: Props) {
  const chartData = trend.map((point) => ({
    ...point,
    label: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  const first = trend[0];
  const changeAmount = first ? currentTotal - first.netWorth : 0;
  const changePercent = first && first.netWorth !== 0 ? (changeAmount / Math.abs(first.netWorth)) * 100 : null;
  const isUp = changeAmount >= 0;

  const formatAxis = (value: number) => {
    const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
    return currencySymbol(baseCurrency) + compact;
  };

  const setRange = (value: string) => {
    router.get('/net-worth', { range: value }, { preserveScroll: true, preserveState: true });
  };

  const currencyEntries = Object.entries(currentByCurrency);

  return (
    <AppLayout>
      <Head title="Net Worth" />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* ── Kravio Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-rise">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Net Worth Valuation</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Historical valuation and aggregate net worth across all your holdings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select value={String(range)} onValueChange={setRange}>
              <SelectTrigger className="h-8 w-32 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {Object.entries(RANGE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-xs">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Kravio Top Cards ─────────────────────────────────────────── */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <KravioKPICard
            index={0}
            title="Total Net Worth"
            value={formatCurrency(currentTotal, baseCurrency)}
            icon={Landmark}
            iconColorClass="bg-primary/10 text-primary"
            delta={first ? {
              value: `${isUp ? '+' : ''}${formatCurrency(changeAmount, baseCurrency)} (${isUp ? '+' : ''}${changePercent?.toFixed(1) ?? '0'}%)`,
              isPositive: isUp,
              label: `over ${RANGE_LABELS[range]}`,
            } : undefined}
            className="md:col-span-2"
          />

          <KravioCard pattern className="animate-rise [animation-delay:120ms]" innerClassName="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Currency Breakdown</span>
                <Badge variant="outline" className="text-[10px]">{baseCurrency} Base</Badge>
              </div>

              <div className="mt-3 space-y-2">
                {currencyEntries.map(([curr, total]) => (
                  <div key={curr} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{curr}</span>
                    <span className="font-mono font-semibold tabular-nums text-foreground">{formatCurrency(total, curr)}</span>
                  </div>
                ))}
              </div>
            </div>

            {excludedCurrencies.length > 0 && (
              <p className="mt-3 pt-2 border-t border-border/40 text-[10px] text-muted-foreground">
                * Excludes {excludedCurrencies.join(', ')} (no active exchange rate).
              </p>
            )}
          </KravioCard>
        </div>

        {/* ── Kravio Valuation Trend Area Chart ────────────────────────── */}
        <KravioCard pattern className="animate-rise [animation-delay:180ms]" innerClassName="p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Net Worth Trajectory</h3>
              <p className="text-xs text-muted-foreground">Historical portfolio valuation in {baseCurrency}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              <span className="text-xs font-medium text-foreground">Valuation</span>
            </div>
          </div>

          <div className="mt-4 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="kravioNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4be" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00d4be" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} className="text-xs font-medium fill-muted-foreground" />
                <YAxis tickLine={false} axisLine={false} width={65} tickFormatter={formatAxis} className="text-xs font-mono fill-muted-foreground" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const point = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border/70 bg-card p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-foreground">{point.label}</p>
                          <p className="font-mono font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                            {formatCurrency(point.netWorth, baseCurrency)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="netWorth"
                  stroke="#00d4be"
                  strokeWidth={2.5}
                  fill="url(#kravioNetWorth)"
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#ffffff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </KravioCard>
      </div>
    </AppLayout>
  );
}
