import { Head } from '@inertiajs/react';
import { formatCurrency as baseFmt } from '@/lib/formatCurrency';
import { Download, TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';
import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Legend, Label } from 'recharts';
import { Sector } from 'recharts';
import { type PieSectorDataItem } from 'recharts/types/polar/Pie';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

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
  'hsl(217, 91%, 60%)',
  'hsl(142, 76%, 36%)',
  'hsl(0, 84%, 60%)',
  'hsl(45, 93%, 47%)',
  'hsl(262, 83%, 58%)',
  'hsl(173, 58%, 39%)',
];

export default function Index({
  categorySpending,
  monthlyTrends,
  totalIncomeByCurrency,
  totalExpenseByCurrency,
  avgDailySpendingByCurrency,
}: Props) {
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

  // Fall back to first item when currency changes and active selection no longer exists
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

  const trendsConfig = {
    income: {
      label: 'Income',
      color: 'hsl(142, 76%, 36%)',
    },
    expense: {
      label: 'Expenses',
      color: 'hsl(0, 84%, 60%)',
    },
  } satisfies ChartConfig;

  return (
    <AppLayout>
      <Head title="Reports" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Financial Reports</h1>
              <p className="text-muted-foreground">Insights into your spending and saving habits</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a href="/export/transactions">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </a>
              <a href="/export/all-data">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Download className="h-4 w-4 mr-2" />
                  Backup Data
                </Button>
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Income</div>
                    {Object.entries(totalIncomeByCurrency).length === 0 ? (
                      <div className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(0)}</div>
                    ) : (
                      Object.entries(totalIncomeByCurrency).map(([cur, amt]) => (
                        <div key={cur} className="text-2xl font-bold text-green-600 mt-1">
                          {formatCurrency(amt, cur)}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Expenses</div>
                    {Object.entries(totalExpenseByCurrency).length === 0 ? (
                      <div className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(0)}</div>
                    ) : (
                      Object.entries(totalExpenseByCurrency).map(([cur, amt]) => (
                        <div key={cur} className="text-2xl font-bold text-red-600 mt-1">
                          {formatCurrency(amt, cur)}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Savings Rate</div>
                    <div className={`text-2xl font-bold mt-2 ${savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {savingsRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{primaryCurrency}</div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <PieChartIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Avg Daily Spending</div>
                    {Object.entries(avgDailySpendingByCurrency).length === 0 ? (
                      <div className="text-2xl font-bold mt-2">{formatCurrency(0)}</div>
                    ) : (
                      Object.entries(avgDailySpendingByCurrency).map(([cur, amt]) => (
                        <div key={cur} className="text-2xl font-bold mt-1">
                          {formatCurrency(amt, cur)}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <Card>
              <CardHeader className="flex-row items-start space-y-0 pb-0">
                <div className="grid gap-1">
                  <CardTitle>Spending by Category</CardTitle>
                </div>
                <div className="ml-auto flex gap-2">
                  {categoryCurrencies.length > 1 && (
                    <Select value={categoryCurrency} onValueChange={setCategoryCurrency}>
                      <SelectTrigger className="h-7 w-[90px] rounded-lg pl-2.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent align="end" className="rounded-xl">
                        {categoryCurrencies.map((cur) => (
                          <SelectItem key={cur} value={cur} className="rounded-lg">
                            {cur}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {filteredCategorySpending.length > 0 && (
                    <Select value={effectiveCategory} onValueChange={setActiveCategory}>
                      <SelectTrigger className="h-7 w-[160px] rounded-lg pl-2.5">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent align="end" className="rounded-xl">
                        {filteredCategorySpending
                          .filter((item) => item.category)
                          .map((item, index) => (
                            <SelectItem key={item.category} value={item.category} className="rounded-lg">
                              <div className="flex items-center gap-2 text-xs">
                                <span
                                  className="flex h-3 w-3 shrink-0 rounded-sm"
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                />
                                {item.category}
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 justify-center pb-0">
                {filteredCategorySpending.length > 0 ? (
                  <ChartContainer config={{}} className="mx-auto aspect-square w-full max-w-[300px]">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={filteredCategorySpending.map((item, index) => ({
                          ...item,
                          fill: COLORS[index % COLORS.length],
                        }))}
                        dataKey="amount"
                        nameKey="category"
                        innerRadius={60}
                        strokeWidth={5}
                        activeIndex={activeIndex}
                        activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                          <g>
                            <Sector {...props} outerRadius={outerRadius + 10} />
                            <Sector {...props} outerRadius={outerRadius + 25} innerRadius={outerRadius + 12} />
                          </g>
                        )}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                              const activeItem = filteredCategorySpending[activeIndex] ?? filteredCategorySpending[0];
                              if (!activeItem) return null;
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                                    {formatCurrency(activeItem.amount, activeItem.currency)}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-sm"
                                  >
                                    {activeItem.percentage.toFixed(0)}%
                                  </tspan>
                                </text>
                              );
                            }
                            return null;
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <p className="text-muted-foreground text-center py-12">No spending data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCategories.map((cat, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{cat.category}</span>
                        <span className="text-muted-foreground">{formatCurrency(cat.amount, cat.currency)}</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {topCategories.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">No spending data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center space-y-0">
              <CardTitle>Income vs Expenses Trend (Last 12 Months)</CardTitle>
              {trendCurrencies.length > 1 && (
                <Select value={trendCurrency} onValueChange={setTrendCurrency}>
                  <SelectTrigger className="ml-auto h-7 w-[90px] rounded-lg pl-2.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end" className="rounded-xl">
                    {trendCurrencies.map((cur) => (
                      <SelectItem key={cur} value={cur} className="rounded-lg">
                        {cur}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardHeader>
            <CardContent>
              {monthlyTrends.length > 0 ? (
                <ChartContainer config={trendsConfig} className="h-[400px] w-full">
                  <LineChart accessibilityLayer data={trendChartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCurrency(value, trendCurrency)}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="var(--color-income)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Income"
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="var(--color-expense)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Expenses"
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <p className="text-muted-foreground text-center py-12">No trend data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
