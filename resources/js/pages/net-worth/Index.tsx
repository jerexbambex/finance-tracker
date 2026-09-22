import { Head, router } from '@inertiajs/react';
import { Landmark, TrendingDown, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency, currencySymbol } from '@/lib/formatCurrency';

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

const chartConfig = {
  netWorth: { label: 'Net Worth', color: 'var(--chart-2)' },
} satisfies ChartConfig;

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

      <div className="py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold">Net Worth</h1>
            <Select value={String(range)} onValueChange={setRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(RANGE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/40 md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Net Worth</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Landmark className="h-[18px] w-[18px] text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono tabular-nums">
                  {formatCurrency(currentTotal, baseCurrency)}
                </div>
                {first && (
                  <div className={`flex items-center gap-1 text-sm mt-2 ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                    {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-mono tabular-nums">
                      {isUp ? '+' : ''}{formatCurrency(changeAmount, baseCurrency)}
                    </span>
                    {changePercent !== null && (
                      <span className="font-mono tabular-nums">({isUp ? '+' : ''}{changePercent.toFixed(1)}%)</span>
                    )}
                    <span className="text-muted-foreground">over {RANGE_LABELS[range]}</span>
                  </div>
                )}
                {excludedCurrencies.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Excludes {excludedCurrencies.join(', ')} — no exchange rate on file for {excludedCurrencies.length === 1 ? 'it' : 'them'} yet.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/40">
              <CardHeader>
                <CardTitle className="text-sm font-medium">By Currency</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currencyEntries.length === 0 && (
                  <p className="text-sm text-muted-foreground">No balances yet.</p>
                )}
                {currencyEntries.map(([currency, amount]) => (
                  <div key={currency} className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className="font-mono">{currency}</Badge>
                    <span className="font-mono tabular-nums">{formatCurrency(amount, currency)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/40">
            <CardHeader>
              <CardTitle>Trend</CardTitle>
              <p className="text-xs text-muted-foreground">
                Converted to {baseCurrency} at today&apos;s exchange rate — past points use the current rate, not the
                rate on that date.
              </p>
            </CardHeader>
            <CardContent>
              {chartData.length > 1 ? (
                <ChartContainer config={chartConfig} className="h-[320px] w-full">
                  <AreaChart data={chartData} margin={{ left: 4, right: 8, top: 8 }}>
                    <defs>
                      <linearGradient id="fillNetWorth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-netWorth)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-netWorth)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/60" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} className="text-xs" />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} width={70} className="text-xs" tickFormatter={formatAxis} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="netWorth"
                      stroke="var(--color-netWorth)"
                      strokeWidth={2}
                      fill="url(#fillNetWorth)"
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-12 text-center">
                  Not enough history yet — check back after a day or two of activity.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
