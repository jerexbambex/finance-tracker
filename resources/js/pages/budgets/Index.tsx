import { Head, useForm, router, Link, usePage } from '@inertiajs/react';
import { Wallet, TrendingDown, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Lightbulb, Copy, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';

interface Budget {
  id: string;
  category: { id: string; name: string; color?: string };
  amount: number;
  spent: number;
  percentage: number;
  period_type: string;
  period_year: number;
  period_month: number | null;
  currency: string;
  auto_rollover: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface CurrencyOption {
  value: string;
  label: string;
}

interface Props {
  budgets: Budget[];
  categories: Category[];
  currencies: CurrencyOption[];
  view: 'all' | 'period';
  availableYears: number[];
  currentPeriod: { year: number; month: number };
  previousPeriod: { year: number; month: number; label: string; count: number };
}

export default function Index({ budgets, categories, currencies, view, availableYears, currentPeriod, previousPeriod }: Props) {
  const { flash } = usePage().props as { flash?: { success?: string } };
  // Track the dismissed message rather than a visibility flag, so a fresh
  // flash with the same text still shows without syncing state in an effect.
  const [dismissed, setDismissed] = useState<string | null>(null);
  const showSuccess = !!flash?.success && dismissed !== flash.success;
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const defaultCurrency = currencies[0]?.value ?? 'USD';

  const createForm = useForm({
    category_id: '',
    amount: '',
    currency: defaultCurrency,
    period_type: 'monthly',
    auto_rollover: true as boolean,
  });

  const editForm = useForm({
    category_id: '',
    amount: '',
    currency: defaultCurrency,
    period_type: 'monthly',
    period_year: '',
    period_month: '',
    auto_rollover: true as boolean,
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/budgets', {
      onSuccess: () => {
        setCreateOpen(false);
        createForm.reset();
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBudget) {
      editForm.put(`/budgets/${editingBudget.id}`, {
        onSuccess: () => {
          setEditOpen(false);
          setEditingBudget(null);
          editForm.reset();
        },
      });
    }
  };

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget);
    editForm.setData({
      category_id: budget.category.id,
      amount: budget.amount.toString(),
      currency: budget.currency,
      period_type: budget.period_type,
      period_year: budget.period_year.toString(),
      period_month: budget.period_month?.toString() ?? '',
      auto_rollover: budget.auto_rollover,
    });
    setEditOpen(true);
  };

  useEffect(() => {
    const message = flash?.success;
    if (!message) {
      return;
    }

    const timer = setTimeout(() => setDismissed(message), 4000);
    return () => clearTimeout(timer);
  }, [flash?.success]);

  // Pull the previous month's budgets into the period being viewed. Categories
  // already budgeted here are left alone, so this is safe to click twice.
  const copyFromPrevious = () => {
    router.post('/budgets/copy', {
      from_year: previousPeriod.year,
      from_month: previousPeriod.month,
      to_year: currentPeriod.year,
      to_month: currentPeriod.month,
    }, { preserveScroll: true });
  };

  const navigatePeriod = (direction: 'prev' | 'next') => {
    let newMonth = currentPeriod.month;
    let newYear = currentPeriod.year;

    if (direction === 'prev') {
      newMonth--;
      if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
    } else {
      newMonth++;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }

    router.get('/budgets', { view: 'period', year: newYear, month: newMonth });
  };


  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Years the user has budgets for (from the server), newest first
  const yearOptions = availableYears;

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overBudgetCount = budgets.filter(b => b.percentage >= 100).length;

  const chartData = budgets.map(b => ({
    category: b.category.name,
    budgeted: b.amount,
    spent: b.spent,
  }));

  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const periodLabel = (b: Budget) =>
    b.period_type === 'yearly'
      ? `${b.period_year} · Yearly`
      : `${fullMonthNames[(b.period_month ?? 1) - 1]} ${b.period_year}`;

  // Group budgets by period for the "All" view (preserves controller ordering)
  const groupedBudgets: { label: string; items: Budget[] }[] = [];
  const groupIndex: Record<string, number> = {};
  budgets.forEach((b) => {
    const label = periodLabel(b);
    if (groupIndex[label] === undefined) {
      groupIndex[label] = groupedBudgets.length;
      groupedBudgets.push({ label, items: [] });
    }
    groupedBudgets[groupIndex[label]].items.push(b);
  });

  const renderBudgetCard = (budget: Budget) => (
    <Card key={budget.id} className="transition-colors">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl">{budget.category.name}</CardTitle>
            <p className="text-xs text-muted-foreground capitalize mt-1">{budget.period_type}</p>
            {!budget.auto_rollover && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Won&apos;t carry forward
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => openEditModal(budget)}>
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-baseline">
          <div>
            <p className="text-3xl font-bold font-mono tabular-nums">{formatCurrency(budget.spent, budget.currency)}</p>
            <p className="text-sm text-muted-foreground">of {formatCurrency(budget.amount, budget.currency)}</p>
          </div>
          <div className={`text-right ${budget.percentage >= 100 ? 'text-red-600' : budget.percentage >= 80 ? 'text-yellow-600' : 'text-green-600'}`}>
            <p className="text-2xl font-bold font-mono tabular-nums">{budget.percentage.toFixed(0)}%</p>
            <p className="text-xs">used</p>
          </div>
        </div>

        <div className="space-y-2">
          <Progress
            value={Math.min(budget.percentage, 100)}
            className={`h-2 ${budget.percentage >= 100 ? '[&>div]:bg-red-600' : budget.percentage >= 80 ? '[&>div]:bg-yellow-600' : '[&>div]:bg-green-600'}`}
          />
          <div className="flex justify-between items-center text-sm">
            <span className={budget.percentage >= 100 ? 'text-red-600 font-semibold' : 'text-muted-foreground'}>
              {budget.percentage >= 100 ? (
                <>Over by {formatCurrency(budget.spent - budget.amount, budget.currency)}</>
              ) : (
                <>{formatCurrency(budget.amount - budget.spent, budget.currency)} left</>
              )}
            </span>
            {budget.percentage >= 80 && budget.percentage < 100 && (
              <span className="text-yellow-600 text-xs font-medium">⚠️ Near limit</span>
            )}
            {budget.percentage >= 100 && (
              <span className="text-red-600 text-xs font-medium">⚠️ Exceeded</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const chartConfig = {
    budgeted: {
      label: "Budgeted",
      color: "var(--chart-2)",
    },
    spent: {
      label: "Spent",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <AppLayout>
      <Head title="Budgets" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2 dark:bg-green-950/30 dark:border-green-900">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 dark:text-green-300">{flash?.success}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold">Budgets</h1>
              <div className="inline-flex rounded-lg border border-border/55 p-0.5">
                <Button
                  variant={view === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => router.get('/budgets', { view: 'all' }, { preserveScroll: true })}
                >
                  All Budgets
                </Button>
                <Button
                  variant={view === 'period' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => router.get('/budgets', { view: 'period', year: currentPeriod.year, month: currentPeriod.month }, { preserveScroll: true })}
                >
                  By Month
                </Button>
              </div>
              {view === 'period' && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => navigatePeriod('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Select
                    value={String(currentPeriod.month)}
                    onValueChange={(m) => router.get('/budgets', { view: 'period', year: currentPeriod.year, month: Number(m) }, { preserveScroll: true })}
                  >
                    <SelectTrigger className="w-[110px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((name, i) => (
                        <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={String(currentPeriod.year)}
                    onValueChange={(y) => router.get('/budgets', { view: 'period', year: Number(y), month: currentPeriod.month }, { preserveScroll: true })}
                  >
                    <SelectTrigger className="w-[90px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon" onClick={() => navigatePeriod('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {view === 'period' && previousPeriod.count > 0 && (
                <Button variant="outline" onClick={copyFromPrevious}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy from {previousPeriod.label}
                </Button>
              )}
              <Link href="/budgets/recommendations">
                <Button variant="outline">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Get Recommendations
                </Button>
              </Link>
              <Button onClick={() => setCreateOpen(true)}>Create Budget</Button>
            </div>
          </div>

          {budgets.length > 0 && (
            <>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Total Budgeted</div>
                        <div className="text-2xl font-bold font-mono tabular-nums mt-2">{formatCurrency(totalBudgeted)}</div>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Total Spent</div>
                        <div className="text-2xl font-bold font-mono tabular-nums text-red-600 mt-2">{formatCurrency(totalSpent)}</div>
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
                        <div className="text-sm font-medium text-muted-foreground">Remaining</div>
                        <div className={`text-2xl font-bold font-mono tabular-nums mt-2 ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(totalRemaining)}
                        </div>
                      </div>
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${overBudgetCount > 0 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
                        <AlertCircle className={`h-6 w-6 ${overBudgetCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {view === 'period' && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Budget vs Actual Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                      <CartesianGrid vertical={false} />
                      <XAxis 
                        dataKey="category" 
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
                      <Bar dataKey="budgeted" fill="var(--color-budgeted)" radius={4} />
                      <Bar dataKey="spent" radius={4}>
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.spent > entry.budgeted ? 'var(--chart-4)' : 'var(--chart-1)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              )}
            </>
          )}

          {budgets.length > 0 ? (
            view === 'all' ? (
              <div className="space-y-8">
                {groupedBudgets.map((group) => (
                  <div key={group.label}>
                    <div className="mb-3 flex items-center gap-3">
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{group.label}</h2>
                      <span className="text-xs text-muted-foreground">{group.items.length} budget{group.items.length !== 1 ? 's' : ''}</span>
                      <div className="h-px flex-1 bg-border/55" />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {group.items.map(renderBudgetCard)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {budgets.map(renderBudgetCard)}
              </div>
            )
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-gray-500 mb-4">
                  {view === 'period' ? 'No budgets set for this period' : 'No budgets yet'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {view === 'period' && previousPeriod.count > 0 && (
                    <Button variant="outline" onClick={copyFromPrevious}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy {previousPeriod.count} budget{previousPeriod.count === 1 ? '' : 's'} from {previousPeriod.label}
                    </Button>
                  )}
                  <Button onClick={() => setCreateOpen(true)}>Create Your First Budget</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="create-category">Category</Label>
              <Select value={createForm.data.category_id} onValueChange={(value) => createForm.setData('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {createForm.errors.category_id && <p className="text-red-500 text-sm mt-1">{createForm.errors.category_id}</p>}
            </div>
            <div>
              <Label htmlFor="create-amount">Budget Amount</Label>
              <Input
                id="create-amount"
                type="number"
                step="0.01"
                value={createForm.data.amount}
                onChange={(e) => createForm.setData('amount', e.target.value)}
                placeholder="0.00"
              />
              {createForm.errors.amount && <p className="text-red-500 text-sm mt-1">{createForm.errors.amount}</p>}
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={createForm.data.currency} onValueChange={(value) => createForm.setData('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {createForm.errors.currency && <p className="text-red-500 text-sm mt-1">{createForm.errors.currency}</p>}
            </div>
            <div>
              <Label htmlFor="create-period">Period Type</Label>
              <Select value={createForm.data.period_type} onValueChange={(value) => createForm.setData('period_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border/55 p-3">
              <div>
                <Label htmlFor="create-auto-rollover" className="cursor-pointer">Carry forward each period</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Recreate this budget automatically when a new period starts.
                </p>
              </div>
              <Switch
                id="create-auto-rollover"
                checked={createForm.data.auto_rollover}
                onCheckedChange={(checked) => createForm.setData('auto_rollover', checked)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createForm.processing}>
                {createForm.processing ? 'Creating...' : 'Create Budget'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={editForm.data.category_id} onValueChange={(value) => editForm.setData('category_id', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editForm.errors.category_id && <p className="text-red-500 text-sm mt-1">{editForm.errors.category_id}</p>}
            </div>
            <div>
              <Label htmlFor="edit-amount">Budget Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editForm.data.amount}
                onChange={(e) => editForm.setData('amount', e.target.value)}
              />
              {editForm.errors.amount && <p className="text-red-500 text-sm mt-1">{editForm.errors.amount}</p>}
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={editForm.data.currency} onValueChange={(value) => editForm.setData('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editForm.errors.currency && <p className="text-red-500 text-sm mt-1">{editForm.errors.currency}</p>}
            </div>
            <div>
              <Label htmlFor="edit-period">Period Type</Label>
              <Select
                value={editForm.data.period_type}
                onValueChange={(value) =>
                  editForm.setData((data) => ({
                    ...data,
                    period_type: value,
                    period_month: value === 'yearly' ? '' : data.period_month || String(editingBudget?.period_month ?? currentPeriod.month),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              {editForm.errors.period_type && <p className="text-red-500 text-sm mt-1">{editForm.errors.period_type}</p>}
              {editForm.errors.period_year && <p className="text-red-500 text-sm mt-1">{editForm.errors.period_year}</p>}
              {editForm.errors.period_month && <p className="text-red-500 text-sm mt-1">{editForm.errors.period_month}</p>}
            </div>
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border/55 p-3">
              <div>
                <Label htmlFor="edit-auto-rollover" className="cursor-pointer">Carry forward each period</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Recreate this budget automatically when a new period starts.
                </p>
              </div>
              <Switch
                id="edit-auto-rollover"
                checked={editForm.data.auto_rollover}
                onCheckedChange={(checked) => editForm.setData('auto_rollover', checked)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editForm.processing}>
                {editForm.processing ? 'Updating...' : 'Update Budget'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
