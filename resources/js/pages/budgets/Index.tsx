import { Head, useForm, router, Link, usePage } from '@inertiajs/react';
import { Wallet, TrendingDown, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Lightbulb, Copy, RefreshCw, Plus, PieChart as PieIcon, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';
import { KravioCard } from '@/components/dashboard/KravioCard';
import { KravioKPICard } from '@/components/dashboard/KravioKPICard';

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
    if (!message) return;
    const timer = setTimeout(() => setDismissed(message), 4000);
    return () => clearTimeout(timer);
  }, [flash?.success]);

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
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const overBudgetCount = budgets.filter(b => b.percentage >= 100).length;

  const chartData = budgets.map(b => ({
    category: b.category.name,
    budgeted: b.amount,
    spent: b.spent,
    currency: b.currency,
  }));

  const periodLabel = (b: Budget) =>
    b.period_type === 'yearly'
      ? `${b.period_year} · Yearly`
      : `${fullMonthNames[(b.period_month ?? 1) - 1]} ${b.period_year}`;

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

  const renderBudgetCard = (budget: Budget, idx: number) => {
    const isExceeded = budget.percentage >= 100;
    const isWarning = budget.percentage >= 80 && !isExceeded;

    return (
      <KravioCard
        key={budget.id}
        pattern
        className="group/b animate-rise transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        innerClassName="p-4 sm:p-5 flex flex-col justify-between h-full bg-gradient-to-br from-card to-muted/20"
        style={{ animationDelay: `${80 + idx * 40}ms` }}
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: budget.category.color || 'var(--primary)' }}
                />
                <h3 className="font-semibold text-sm text-foreground truncate group-hover/b:text-primary transition-colors">
                  {budget.category.name}
                </h3>
              </div>
              <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                {budget.period_type}
                {!budget.auto_rollover && ' • No rollover'}
              </p>
            </div>

            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold font-mono ${
                isExceeded
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  : isWarning
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              }`}
            >
              {budget.percentage.toFixed(0)}%
            </span>
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-2">
            <div>
              <p className="font-mono text-2xl font-bold text-foreground tabular-nums">
                {formatCurrency(budget.spent, budget.currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                of {formatCurrency(budget.amount, budget.currency)} allocated
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3.5 space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isExceeded
                    ? 'bg-rose-500'
                    : isWarning
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(budget.percentage, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={`text-[11px] font-medium ${isExceeded ? 'text-rose-600' : 'text-muted-foreground'}`}>
                {isExceeded ? (
                  <>Over by {formatCurrency(budget.spent - budget.amount, budget.currency)}</>
                ) : (
                  <>{formatCurrency(budget.amount - budget.spent, budget.currency)} remaining</>
                )}
              </span>
              {isExceeded && (
                <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider flex items-center gap-0.5">
                  <AlertTriangle className="h-3 w-3" /> Exceeded
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2" onClick={() => openEditModal(budget)}>
            Edit Budget
          </Button>
          <Link
            href={`/transactions?category=${encodeURIComponent(budget.category.name)}`}
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
          >
            Transactions →
          </Link>
        </div>
      </KravioCard>
    );
  };

  return (
    <AppLayout>
      <Head title="Budgets" />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {showSuccess && (
          <div className="animate-rise rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <p className="font-medium">{flash?.success}</p>
          </div>
        )}

        {/* ── Kravio Header Toolbar ────────────────────────────────────── */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between animate-rise">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Budgets & Limits</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Set spending thresholds, monitor monthly usage, and prevent budget overruns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Switcher: All vs By Month */}
            <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => router.get('/budgets', { view: 'all' }, { preserveScroll: true })}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  view === 'all'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                All Budgets
              </button>
              <button
                type="button"
                onClick={() => router.get('/budgets', { view: 'period', year: currentPeriod.year, month: currentPeriod.month }, { preserveScroll: true })}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  view === 'period'
                    ? 'bg-card text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                By Month
              </button>
            </div>

            {/* Period Navigation */}
            {view === 'period' && (
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => navigatePeriod('prev')}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Select
                  value={String(currentPeriod.month)}
                  onValueChange={(m) => router.get('/budgets', { view: 'period', year: currentPeriod.year, month: Number(m) }, { preserveScroll: true })}
                >
                  <SelectTrigger className="h-8 w-24 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {monthNames.map((name, i) => (
                      <SelectItem key={i} value={String(i + 1)} className="text-xs">{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={String(currentPeriod.year)}
                  onValueChange={(y) => router.get('/budgets', { view: 'period', year: Number(y), month: currentPeriod.month }, { preserveScroll: true })}
                >
                  <SelectTrigger className="h-8 w-20 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableYears.map((y) => (
                      <SelectItem key={y} value={String(y)} className="text-xs">{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" onClick={() => navigatePeriod('next')}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            {view === 'period' && previousPeriod.count > 0 && (
              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={copyFromPrevious}>
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy {previousPeriod.label}
              </Button>
            )}

            <Link href="/budgets/recommendations">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Lightbulb className="h-3.5 w-3.5 mr-1 text-amber-500" />
                Suggestions
              </Button>
            </Link>

            <Button size="sm" className="h-8 text-xs font-semibold" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1 h-3.5 w-3.5" />
              Create Budget
            </Button>
          </div>
        </div>

        {/* ── Kravio KPI Metric Strip ──────────────────────────────────── */}
        {budgets.length > 0 && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <KravioKPICard
              index={0}
              title="Total Budget Allocated"
              value={formatCurrency(totalBudgeted)}
              icon={Wallet}
              iconColorClass="bg-primary/10 text-primary"
              subtitle={`${budgets.length} active budget categories`}
            />
            <KravioKPICard
              index={1}
              title="Total Spent"
              value={formatCurrency(totalSpent)}
              icon={TrendingDown}
              iconColorClass="bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
              subtitle={`${totalBudgeted > 0 ? ((totalSpent / totalBudgeted) * 100).toFixed(0) : 0}% of budget utilized`}
            />
            <KravioKPICard
              index={2}
              title="Remaining Balance"
              value={formatCurrency(totalRemaining)}
              icon={AlertCircle}
              iconColorClass={totalRemaining >= 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}
              subtitle={overBudgetCount > 0 ? `${overBudgetCount} budgets exceeded limit` : 'All budgets healthy'}
            />
          </div>
        )}

        {/* ── Budget vs Actual Chart (in Period View) ─────────────────── */}
        {view === 'period' && chartData.length > 0 && (
          <KravioCard pattern className="animate-rise [animation-delay:160ms]" innerClassName="p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Budgeted vs. Actual Spending</h3>
                <p className="text-xs text-muted-foreground">Category comparison for active period</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-slate-400" />
                  Budget
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Spent
                </span>
              </div>
            </div>

            <div className="mt-4 h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} className="text-xs font-medium fill-muted-foreground" />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} className="text-xs font-mono fill-muted-foreground" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const b = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border/70 bg-card p-2.5 shadow-md text-xs">
                            <p className="font-semibold text-foreground mb-1">{b.category}</p>
                            <p className="text-muted-foreground">Budget: <span className="font-mono font-medium">{formatCurrency(b.budgeted, b.currency)}</span></p>
                            <p className="text-foreground">Spent: <span className="font-mono font-bold">{formatCurrency(b.spent, b.currency)}</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="budgeted" name="Budget" fill="#94a3b8" opacity={0.6} radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="spent" name="Spent" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.spent > entry.budgeted ? '#ef4444' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </KravioCard>
        )}

        {/* ── Budget Cards Grid ────────────────────────────────────────── */}
        {budgets.length > 0 ? (
          view === 'all' ? (
            <div className="space-y-8">
              {groupedBudgets.map((group) => (
                <div key={group.label} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group.label}</h2>
                    <span className="text-xs text-muted-foreground">({group.items.length} budgets)</span>
                    <div className="h-px flex-1 bg-border/40" />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {group.items.map((b, i) => renderBudgetCard(b, i))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {budgets.map((b, i) => renderBudgetCard(b, i))}
            </div>
          )
        ) : (
          <KravioCard pattern className="text-center py-12">
            <PieIcon className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No budgets for this period</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Create category budgets to set spending boundaries and receive automated alerts.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Budget
              </Button>
              <Link href="/budgets/recommendations">
                <Button variant="outline" size="sm">
                  <Lightbulb className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                  AI Recommendations
                </Button>
              </Link>
            </div>
          </KravioCard>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-category" className="text-xs font-semibold">Category</Label>
              <Select value={createForm.data.category_id} onValueChange={(value) => createForm.setData('category_id', value)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {createForm.errors.category_id && <p className="text-destructive text-xs">{createForm.errors.category_id}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="create-amount" className="text-xs font-semibold">Budget Limit</Label>
                <Input
                  id="create-amount"
                  type="number"
                  step="0.01"
                  value={createForm.data.amount}
                  onChange={(e) => createForm.setData('amount', e.target.value)}
                  placeholder="0.00"
                  className="h-9 text-xs font-mono"
                />
                {createForm.errors.amount && <p className="text-destructive text-xs">{createForm.errors.amount}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="create-currency" className="text-xs font-semibold">Currency</Label>
                <Select value={createForm.data.currency} onValueChange={(value) => createForm.setData('currency', value)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value} className="text-xs">{curr.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
              <div>
                <Label htmlFor="create-rollover" className="text-xs font-semibold">Auto-Rollover</Label>
                <p className="text-[11px] text-muted-foreground">Carry unused budget balance into next month</p>
              </div>
              <Switch
                id="create-rollover"
                checked={createForm.data.auto_rollover}
                onCheckedChange={(checked) => createForm.setData('auto_rollover', checked)}
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={createForm.processing}>
                {createForm.processing ? 'Creating...' : 'Create Budget'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-category" className="text-xs font-semibold">Category</Label>
              <Select value={editForm.data.category_id} onValueChange={(value) => editForm.setData('category_id', value)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-amount" className="text-xs font-semibold">Budget Limit</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={editForm.data.amount}
                onChange={(e) => editForm.setData('amount', e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/70 p-3">
              <div>
                <Label htmlFor="edit-rollover" className="text-xs font-semibold">Auto-Rollover</Label>
                <p className="text-[11px] text-muted-foreground">Carry unused budget balance into next month</p>
              </div>
              <Switch
                id="edit-rollover"
                checked={editForm.data.auto_rollover}
                onCheckedChange={(checked) => editForm.setData('auto_rollover', checked)}
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={editForm.processing}>
                {editForm.processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
