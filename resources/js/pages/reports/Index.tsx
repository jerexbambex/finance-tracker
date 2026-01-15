import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Legend, Label } from 'recharts';
import { Download, TrendingUp, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { Sector } from 'recharts';
import { type PieSectorDataItem } from 'recharts/types/polar/Pie';
import * as React from 'react';

interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface Props {
  categorySpending: CategorySpending[];
  monthlyTrends: MonthlyTrend[];
  totalIncome: number;
  totalExpense: number;
  topCategories: CategorySpending[];
}

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 76%, 36%)',
  'hsl(0, 84%, 60%)',
  'hsl(45, 93%, 47%)',
  'hsl(262, 83%, 58%)',
  'hsl(173, 58%, 39%)',
];

export default function Index({ categorySpending, monthlyTrends, totalIncome, totalExpense, topCategories }: Props) {
  const [activeCategory, setActiveCategory] = useState('');

  React.useEffect(() => {
    if (categorySpending.length > 0 && !activeCategory) {
      setActiveCategory(categorySpending[0].category);
    }
  }, [categorySpending, activeCategory]);

  const activeIndex = useMemo(
    () => {
      const index = categorySpending.findIndex((item) => item.category === activeCategory);
      return index >= 0 ? index : 0;
    },
    [activeCategory, categorySpending]
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const netIncome = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netIncome / totalIncome) * 100) : 0;

  const trendsConfig = {
    income: {
      label: "Income",
      color: "hsl(142, 76%, 36%)",
    },
    expense: {
      label: "Expenses",
      color: "hsl(0, 84%, 60%)",
    },
  } satisfies ChartConfig;

  return (
    <AppLayout>
      <Head title="Reports" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Financial Reports</h1>
              <p className="text-muted-foreground">Insights into your spending and saving habits</p>
            </div>
            <div className="flex gap-2">
              <a href="/export/transactions">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
              </a>
              <a href="/export/all">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Backup Data
                </Button>
              </a>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Income</div>
                    <div className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalIncome)}</div>
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
                    <div className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(totalExpense)}</div>
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
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <PieChartIcon className="h-6 w-6 text-blue-600" />
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
                {categorySpending.length > 0 && (
                  <Select value={activeCategory} onValueChange={setActiveCategory}>
                    <SelectTrigger className="ml-auto h-7 w-[160px] rounded-lg pl-2.5">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent align="end" className="rounded-xl">
                      {categorySpending.map((item, index) => (
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
              </CardHeader>
              <CardContent className="flex flex-1 justify-center pb-0">
                {categorySpending.length > 0 ? (
                  <ChartContainer config={{}} className="mx-auto aspect-square w-full max-w-[300px]">
                    <PieChart>
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={categorySpending.map((item, index) => ({
                          ...item,
                          fill: COLORS[index % COLORS.length]
                        }))}
                        dataKey="amount"
                        nameKey="category"
                        innerRadius={60}
                        strokeWidth={5}
                        activeIndex={activeIndex}
                        activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                          <g>
                            <Sector {...props} outerRadius={outerRadius + 10} />
                            <Sector
                              {...props}
                              outerRadius={outerRadius + 25}
                              innerRadius={outerRadius + 12}
                            />
                          </g>
                        )}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              const activeItem = categorySpending[activeIndex] || categorySpending[0];
                              if (!activeItem) return null;
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                                    {formatCurrency(activeItem.amount)}
                                  </tspan>
                                  <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-sm">
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
                  {topCategories.slice(0, 5).map((cat, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{cat.category}</span>
                        <span className="text-muted-foreground">{formatCurrency(cat.amount)}</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all"
                          style={{ 
                            width: `${cat.percentage}%`,
                            backgroundColor: COLORS[index % COLORS.length]
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
            <CardHeader>
              <CardTitle>Income vs Expenses Trend (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyTrends.length > 0 ? (
                <ChartContainer config={trendsConfig} className="h-[400px] w-full">
                  <BarChart accessibilityLayer data={monthlyTrends}>
                    <CartesianGrid vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="income" fill="var(--color-income)" radius={4} name="Income" />
                    <Bar dataKey="expense" fill="var(--color-expense)" radius={4} name="Expenses" />
                  </BarChart>
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
