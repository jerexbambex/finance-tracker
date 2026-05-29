import { Head } from '@inertiajs/react';
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';

import { formatCurrency } from '@/lib/formatCurrency';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

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

const chartConfig = {
  balance: { label: 'Projected Balance', color: 'hsl(217, 91%, 60%)' },
} satisfies ChartConfig;

export default function Index({ timelines, milestones }: Props) {
  const available = Object.keys(timelines);
  const [currency, setCurrency] = useState(available[0] ?? 'USD');

  const points = timelines[currency] ?? [];
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
        <div className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6">Cash Flow Projection</h1>
            <Card>
              <CardContent className="text-center py-12">
                <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No projection available yet</p>
                <p className="text-sm text-muted-foreground">
                  Add accounts and recurring transactions to forecast your balance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  const milestoneCard = (label: string, value: number) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-muted-foreground">{label}</div>
            <div className={`text-2xl font-bold mt-2 ${value < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(value, currency)}
            </div>
          </div>
          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${value < 0 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
            {value < 0 ? <TrendingDown className="h-6 w-6 text-red-600" /> : <TrendingUp className="h-6 w-6 text-green-600" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <Head title="Cash Flow Projection" />

      <div className="py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Cash Flow Projection</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Forecast based on current balances and recurring transactions
              </p>
            </div>
            {available.length > 1 && (
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {available.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {goesNegative && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300">
                Projected balance drops below zero (low point: {formatCurrency(lowestPoint, currency)}). Review upcoming expenses.
              </p>
            </div>
          )}

          {milestone && (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
              {milestoneCard('Today', milestone.start)}
              {milestoneCard('In 30 days', milestone.day30)}
              {milestoneCard('In 60 days', milestone.day60)}
              {milestoneCard('In 90 days', milestone.day90)}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Projected Balance — Next 90 Days</CardTitle>
            </CardHeader>
            <CardContent>
              {points.length > 1 ? (
                <ChartContainer config={chartConfig} className="h-[360px] w-full">
                  <LineChart accessibilityLayer data={points}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={24} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, currency)} width={80} />
                    <ReferenceLine y={0} stroke="hsl(0, 84%, 60%)" strokeDasharray="4 4" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="stepAfter"
                      dataKey="balance"
                      stroke="var(--color-balance)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[360px] text-muted-foreground text-center">
                  Not enough recurring transactions to project a trend.
                  <br />
                  Add recurring income or expenses to see your forecast.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
