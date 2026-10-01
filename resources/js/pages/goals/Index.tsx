import { Head, useForm } from '@inertiajs/react';
import { Target, TrendingUp, Calendar, Plus, CheckCircle2, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';
import { KravioCard } from '@/components/dashboard/KravioCard';
import { KravioKPICard } from '@/components/dashboard/KravioKPICard';

interface Goal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  target_date?: string;
  category?: string;
  is_completed: boolean;
  percentage: number;
}

interface CurrencyOption {
  value: string;
  label: string;
}

interface Props {
  goals: Goal[];
  currencies: CurrencyOption[];
}

export default function Index({ goals, currencies }: Props) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<Goal | null>(null);

  const defaultCurrency = currencies[0]?.value ?? 'USD';

  const createForm = useForm({
    name: '',
    description: '',
    target_amount: '',
    current_amount: '0',
    currency: defaultCurrency,
    target_date: '',
    category: '',
  });

  const editForm = useForm({
    name: '',
    description: '',
    target_amount: '',
    currency: defaultCurrency,
    target_date: '',
    category: '',
  });

  const contributeForm = useForm({
    amount: '',
    note: '',
    contribution_date: new Date().toISOString().split('T')[0],
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/goals', {
      onSuccess: () => {
        setCreateOpen(false);
        createForm.reset();
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      editForm.put(`/goals/${editingGoal.id}`, {
        onSuccess: () => {
          setEditOpen(false);
          setEditingGoal(null);
          editForm.reset();
        },
      });
    }
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (contributingGoal) {
      contributeForm.post(`/goals/${contributingGoal.id}/contribute`, {
        onSuccess: () => {
          setContributeOpen(false);
          setContributingGoal(null);
          contributeForm.reset();
        },
      });
    }
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    editForm.setData({
      name: goal.name,
      description: goal.description || '',
      target_amount: goal.target_amount.toString(),
      currency: goal.currency,
      target_date: goal.target_date || '',
      category: goal.category || '',
    });
    setEditOpen(true);
  };

  const openContributeModal = (goal: Goal) => {
    setContributingGoal(goal);
    contributeForm.reset();
    setContributeOpen(true);
  };

  const formatDate = (date?: string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  const groupByCurrency = (amounts: { currency: string; value: number }[]) =>
    amounts.reduce<Record<string, number>>((acc, { currency, value }) => ({
      ...acc,
      [currency]: (acc[currency] ?? 0) + value,
    }), {});

  const totalTargetByCurrency = groupByCurrency(goals.map(g => ({ currency: g.currency, value: g.target_amount })));
  const totalSavedByCurrency = groupByCurrency(goals.map(g => ({ currency: g.currency, value: g.current_amount })));

  const currenciesInPlay = Object.keys(totalTargetByCurrency);
  const [activeGoalCurrency, setActiveGoalCurrency] = useState<string>(currenciesInPlay[0] || 'USD');

  const selectedTarget = totalTargetByCurrency[activeGoalCurrency] ?? 0;
  const selectedSaved = totalSavedByCurrency[activeGoalCurrency] ?? 0;
  const selectedPercentage = selectedTarget > 0 ? (selectedSaved / selectedTarget) * 100 : 0;
  const goalsInActiveCurrency = goals.filter((g) => g.currency === activeGoalCurrency);
  const completedInActiveCurrency = goalsInActiveCurrency.filter((g) => g.percentage >= 100);

  return (
    <AppLayout>
      <Head title="Goals" />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* ── Kravio Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-rise">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Savings Goals</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Set milestones, allocate savings targets, and track long-term progress.
            </p>
          </div>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 text-xs font-semibold">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Create Savings Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="create-name" className="text-xs font-semibold">Goal Name</Label>
                  <Input
                    id="create-name"
                    value={createForm.data.name}
                    onChange={(e) => createForm.setData('name', e.target.value)}
                    placeholder="e.g., Emergency Fund"
                    className="h-9 text-xs"
                  />
                  {createForm.errors.name && <p className="text-destructive text-xs">{createForm.errors.name}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="create-target" className="text-xs font-semibold">Target Amount</Label>
                    <Input
                      id="create-target"
                      type="number"
                      step="0.01"
                      value={createForm.data.target_amount}
                      onChange={(e) => createForm.setData('target_amount', e.target.value)}
                      placeholder="0.00"
                      className="h-9 text-xs font-mono"
                    />
                    {createForm.errors.target_amount && <p className="text-destructive text-xs">{createForm.errors.target_amount}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="create-currency" className="text-xs font-semibold">Currency</Label>
                    <Select value={createForm.data.currency} onValueChange={(value) => createForm.setData('currency', value)}>
                      <SelectTrigger id="create-currency" className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((c) => (
                          <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="create-current" className="text-xs font-semibold">Starting Amount</Label>
                    <Input
                      id="create-current"
                      type="number"
                      step="0.01"
                      value={createForm.data.current_amount}
                      onChange={(e) => createForm.setData('current_amount', e.target.value)}
                      placeholder="0.00"
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="create-date" className="text-xs font-semibold">Target Date</Label>
                    <Input
                      id="create-date"
                      type="date"
                      value={createForm.data.target_date}
                      onChange={(e) => createForm.setData('target_date', e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="create-category" className="text-xs font-semibold">Category (Optional)</Label>
                  <Input
                    id="create-category"
                    value={createForm.data.category}
                    onChange={(e) => createForm.setData('category', e.target.value)}
                    placeholder="e.g., Emergency, Travel, Investment"
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="create-description" className="text-xs font-semibold">Description (Optional)</Label>
                  <Textarea
                    id="create-description"
                    value={createForm.data.description}
                    onChange={(e) => createForm.setData('description', e.target.value)}
                    placeholder="Notes or reasons for this goal"
                    rows={2}
                    className="text-xs"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={createForm.processing}>
                    {createForm.processing ? 'Creating...' : 'Create Goal'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* ── Kravio KPI Metric Strip ──────────────────────────────────── */}
        {goals.length > 0 && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <KravioKPICard
              index={0}
              title={`Target Amount (${activeGoalCurrency})`}
              value={formatCurrency(selectedTarget, activeGoalCurrency)}
              icon={Target}
              iconColorClass="bg-primary/10 text-primary"
              headerRight={
                currenciesInPlay.length > 1 ? (
                  <Select value={activeGoalCurrency} onValueChange={setActiveGoalCurrency}>
                    <SelectTrigger className="h-6 px-2 text-[11px] rounded-md font-mono bg-background/80 border-border/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end" className="text-xs">
                      {currenciesInPlay.map((c) => (
                        <SelectItem key={c} value={c} className="text-xs font-mono">
                          {c} ({formatCurrency(totalTargetByCurrency[c] ?? 0, c)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : undefined
              }
              subtitle={`${goalsInActiveCurrency.length} milestone${goalsInActiveCurrency.length !== 1 ? 's' : ''} in ${activeGoalCurrency}`}
            />
            <KravioKPICard
              index={1}
              title={`Total Accumulated (${activeGoalCurrency})`}
              value={formatCurrency(selectedSaved, activeGoalCurrency)}
              icon={TrendingUp}
              iconColorClass="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
              delta={{
                value: `${selectedPercentage.toFixed(0)}%`,
                isPositive: selectedPercentage >= 50,
                label: 'overall funding rate',
              }}
            />
            <KravioKPICard
              index={2}
              title={`Milestones (${activeGoalCurrency})`}
              value={`${completedInActiveCurrency.length} of ${goalsInActiveCurrency.length}`}
              icon={Calendar}
              iconColorClass="bg-purple-500/10 text-purple-600"
              subtitle={
                completedInActiveCurrency.length === goalsInActiveCurrency.length && goalsInActiveCurrency.length > 0
                  ? 'All goals funded 🎉'
                  : `${goalsInActiveCurrency.length - completedInActiveCurrency.length} in progress`
              }
            />
          </div>
        )}

        {/* ── Active Goals Cards ───────────────────────────────────────── */}
        {activeGoals.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Goals</h2>
              <span className="text-xs text-muted-foreground">({activeGoals.length})</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal, idx) => {
                const pct = Math.min(goal.percentage, 100);
                return (
                  <KravioCard
                    key={goal.id}
                    pattern
                    className="group/g animate-rise transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                    innerClassName="p-4 sm:p-5 flex flex-col justify-between h-full bg-gradient-to-br from-card to-muted/20"
                    style={{ animationDelay: `${80 + idx * 40}ms` }}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-foreground truncate group-hover/g:text-primary transition-colors">
                            {goal.name}
                          </h3>
                          {goal.category && (
                            <span className="text-[11px] text-muted-foreground block truncate mt-0.5">
                              {goal.category}
                            </span>
                          )}
                        </div>

                        <span className="inline-flex items-center rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-bold font-mono text-primary">
                          {pct.toFixed(0)}%
                        </span>
                      </div>

                      {goal.description && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {goal.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-baseline justify-between gap-2">
                        <div>
                          <span className="font-mono text-xl font-bold text-foreground tabular-nums">
                            {formatCurrency(goal.current_amount, goal.currency)}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            of {formatCurrency(goal.target_amount, goal.currency)} target
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-teal-400 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {goal.target_date && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 pt-1">
                            <Calendar className="h-3 w-3" />
                            Target: {formatDate(goal.target_date)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2.5 font-medium" onClick={() => openContributeModal(goal)}>
                        + Add Funds
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground" onClick={() => openEditModal(goal)}>
                        Edit
                      </Button>
                    </div>
                  </KravioCard>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Completed Goals ──────────────────────────────────────────── */}
        {completedGoals.length > 0 && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Completed Goals ({completedGoals.length})
              </h2>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedGoals.map((goal) => (
                <KravioCard
                  key={goal.id}
                  pattern
                  className="border-emerald-500/30"
                  innerClassName="p-4 sm:p-5 flex flex-col justify-between h-full bg-emerald-500/[0.03]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">{goal.name}</h3>
                      <p className="text-xs font-mono font-bold text-emerald-600 mt-1">
                        {formatCurrency(goal.target_amount, goal.currency)} reached 🎉
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px]">
                      <Check className="mr-1 h-3 w-3" /> Completed
                    </Badge>
                  </div>
                </KravioCard>
              ))}
            </div>
          </div>
        )}

        {goals.length === 0 && (
          <KravioCard pattern className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No savings goals yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Create your first target to start saving toward emergencies, investments, vacations, or major purchases.
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create First Goal
              </Button>
            </div>
          </KravioCard>
        )}
      </div>

      {/* Contribute Modal */}
      <Dialog open={contributeOpen} onOpenChange={setContributeOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Add Contribution to {contributingGoal?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleContribute} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="contribute-amount" className="text-xs font-semibold">Contribution Amount ({contributingGoal?.currency})</Label>
              <Input
                id="contribute-amount"
                type="number"
                step="0.01"
                value={contributeForm.data.amount}
                onChange={(e) => contributeForm.setData('amount', e.target.value)}
                placeholder="0.00"
                className="h-9 text-xs font-mono"
                autoFocus
              />
              {contributeForm.errors.amount && <p className="text-destructive text-xs">{contributeForm.errors.amount}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contribute-date" className="text-xs font-semibold">Date</Label>
              <Input
                id="contribute-date"
                type="date"
                value={contributeForm.data.contribution_date}
                onChange={(e) => contributeForm.setData('contribution_date', e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contribute-note" className="text-xs font-semibold">Note (Optional)</Label>
              <Input
                id="contribute-note"
                value={contributeForm.data.note}
                onChange={(e) => contributeForm.setData('note', e.target.value)}
                placeholder="e.g., Monthly bonus savings"
                className="h-9 text-xs"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setContributeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={contributeForm.processing}>
                {contributeForm.processing ? 'Recording...' : 'Add Funds'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs font-semibold">Goal Name</Label>
              <Input
                id="edit-name"
                value={editForm.data.name}
                onChange={(e) => editForm.setData('name', e.target.value)}
                className="h-9 text-xs"
              />
              {editForm.errors.name && <p className="text-destructive text-xs">{editForm.errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-target" className="text-xs font-semibold">Target Amount</Label>
              <Input
                id="edit-target"
                type="number"
                step="0.01"
                value={editForm.data.target_amount}
                onChange={(e) => editForm.setData('target_amount', e.target.value)}
                className="h-9 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-date" className="text-xs font-semibold">Target Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editForm.data.target_date}
                  onChange={(e) => editForm.setData('target_date', e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-category" className="text-xs font-semibold">Category</Label>
                <Input
                  id="edit-category"
                  value={editForm.data.category}
                  onChange={(e) => editForm.setData('category', e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-description" className="text-xs font-semibold">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.data.description}
                onChange={(e) => editForm.setData('description', e.target.value)}
                rows={2}
                className="text-xs"
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
