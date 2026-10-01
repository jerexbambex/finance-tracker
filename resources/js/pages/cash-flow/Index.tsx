import { Head } from '@inertiajs/react';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle, ArrowRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip } from 'recharts';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';
import { KravioCard } from '@/components/dashboard/KravioCard';
import { KravioKPICard } from '@/components/dashboard/KravioKPICard';

interface Point {
  date: string;
  label: string;
  balance: number;
}

interface Milestone {
  start: number;
  day30: number;
  day60: number;
  day90: number;
}

interface Props {
  timelines: Record<string, Point[]>;
  milestones: Record<string, Milestone>;
  horizon: number;
  currencies: Record<string, { symbol: string; label: string }>;
}

export default function Index({ timelines, milestones }: Props) {
  const available = Object.keys(timelines);
  const [currency, setCurrency] = useState(available[0] ?? 'USD');

  const points = useMemo(() => timelines[currency] ?? [], [timelines, currency]);
  const milestone = milestones[currency];

  const lowestPoint = useMemo(
    () => (points.length ? Math.min(...points.map((p) => p.balance)) : 0),
    [points],
  );
  const goesNegative = lowestPoint < 0;

  if (available.length === 0) {
    return (
      <AppLayout>
        <Head title="Cash Flow Projection" />
        <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <h1 className="text-2xl sm:text-3xl font-bold">Cash Flow Projection</h1>
          <KravioCard pattern className="text-center py-12">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No projection available yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Add active accounts and recurring income/expenses to forecast your 90-day balance.
            </p>
          </KravioCard>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Head title="Cash Flow Projection" />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* ── Kravio Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-rise">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Cash Flow Projection</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              90-day balance forecast driven by recurring bills, income schedules, and account balances.
            </p>
          </div>

          {available.length > 1 && (
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="h-8 w-28 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {available.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs font-medium">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* ── Kravio Milestone KPI Cards ───────────────────────────────── */}
        {milestone && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <KravioKPICard
              index={0}
              title="Current Balance"
              value={formatCurrency(milestone.start, currency)}
              icon={Wallet}
              iconColorClass="bg-primary/10 text-primary"
              subtitle="Starting runway"
            />
            <KravioKPICard
              index={1}
              title="30-Day Outlook"
              value={formatCurrency(milestone.day30, currency)}
              icon={milestone.day30 >= milestone.start ? TrendingUp : TrendingDown}
              iconColorClass={milestone.day30 >= milestone.start ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}
              delta={{
                value: `${milestone.day30 >= milestone.start ? '+' : ''}${formatCurrency(milestone.day30 - milestone.start, currency)}`,
                isPositive: milestone.day30 >= milestone.start,
                label: 'vs. today',
              }}
            />
            <KravioKPICard
              index={2}
              title="60-Day Outlook"
              value={formatCurrency(milestone.day60, currency)}
              icon={milestone.day60 >= milestone.start ? TrendingUp : TrendingDown}
              iconColorClass={milestone.day60 >= milestone.start ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}
              delta={{
                value: `${milestone.day60 >= milestone.start ? '+' : ''}${formatCurrency(milestone.day60 - milestone.start, currency)}`,
                isPositive: milestone.day60 >= milestone.start,
                label: 'vs. today',
              }}
            />
            <KravioKPICard
              index={3}
              title="90-Day Outlook"
              value={formatCurrency(milestone.day90, currency)}
              icon={milestone.day90 >= milestone.start ? TrendingUp : TrendingDown}
              iconColorClass={milestone.day90 >= milestone.start ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}
              delta={{
                value: `${milestone.day90 >= milestone.start ? '+' : ''}${formatCurrency(milestone.day90 - milestone.start, currency)}`,
                isPositive: milestone.day90 >= milestone.start,
                label: 'vs. today',
              }}
            />
          </div>
        )}

        {/* ── Warning Banner if cash flow goes negative ────────────────── */}
        {goesNegative && (
          <div className="animate-rise rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <p className="font-medium">
              Warning: Projected cash flow dips below zero to{' '}
              <span className="font-mono font-bold">{formatCurrency(lowestPoint, currency)}</span> during this period.
            </p>
          </div>
        )}

        {/* ── Kravio Chart Canvas ──────────────────────────────────────── */}
        <KravioCard pattern className="animate-rise [animation-delay:200ms]" innerClassName="p-4 sm:p-6">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h3 className="text-sm font-semibold text-foreground">90-Day Liquidity Forecast</h3>
              <p className="text-xs text-muted-foreground">Anticipated daily balance changes based on scheduled cash movements</p>
            </div>
          </div>

          <div className="mt-4 h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="kravioFlowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2f8fd8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2f8fd8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} className="text-xs font-medium fill-muted-foreground" />
                <YAxis tickLine={false} axisLine={false} width={65} tickFormatter={(v) => formatCurrency(v, currency)} className="text-xs font-mono fill-muted-foreground" />
                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const point = payload[0].payload as Point;
                      return (
                        <div className="rounded-lg border border-border/70 bg-card p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-foreground">{point.label} ({point.date})</p>
                          <p className="font-mono font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                            {formatCurrency(point.balance, currency)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#2f8fd8"
                  strokeWidth={2.5}
                  fill="url(#kravioFlowGrad)"
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
