import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { KravioCard } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface RecurringTransaction {
  id: string;
  account_id: string;
  category_id: string | null;
  type: string;
  amount: number;
  description: string;
  frequency: string;
  next_due_date: string;
}

interface Props {
  recurringTransaction: RecurringTransaction;
  accounts: Account[];
  categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Recurring', href: '/recurring-transactions' },
  { title: 'Edit Recurring', href: '#' },
];

export default function Edit({ recurringTransaction, accounts, categories }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    account_id: recurringTransaction.account_id,
    category_id: recurringTransaction.category_id ?? '',
    type: recurringTransaction.type,
    amount: recurringTransaction.amount.toString(),
    description: recurringTransaction.description,
    frequency: recurringTransaction.frequency,
    next_due_date: recurringTransaction.next_due_date.slice(0, 10),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/recurring-transactions/${recurringTransaction.id}`);
  };

  const filteredCategories = categories.filter((c) => c.type === data.type);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Recurring Transaction" />

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/recurring-transactions"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Edit Recurring Transaction
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Modify scheduling terms, payment accounts, or amounts.
            </p>
          </div>
        </div>

        <KravioCard pattern innerClassName="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Transaction Type
              </Label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-1 border border-border/60">
                <button
                  type="button"
                  onClick={() => setData('type', 'expense')}
                  className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                    data.type === 'expense'
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 shadow-xs border border-rose-500/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setData('type', 'income')}
                  className={`rounded-lg py-2 text-xs font-semibold transition-all ${
                    data.type === 'income'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs border border-emerald-500/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
                Description / Service Name
              </Label>
              <Input
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="e.g., Netflix, Gym Membership"
                className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.description ? 'border-destructive' : 'border-border/70'}`}
              />
              {errors.description && <p className="text-destructive text-xs mt-1">{errors.description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={data.amount}
                  onChange={(e) => setData('amount', e.target.value)}
                  placeholder="0.00"
                  className={`mt-1.5 h-10 font-mono text-sm rounded-xl bg-background/80 ${errors.amount ? 'border-destructive' : 'border-border/70'}`}
                />
                {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <Label htmlFor="account_id" className="text-xs font-medium text-muted-foreground">
                  Payment Account
                </Label>
                <Select value={data.account_id} onValueChange={(value) => setData('account_id', value)}>
                  <SelectTrigger className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.account_id ? 'border-destructive' : 'border-border/70'}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="text-xs">
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.account_id && <p className="text-destructive text-xs mt-1">{errors.account_id}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category_id" className="text-xs font-medium text-muted-foreground">
                  Category (Optional)
                </Label>
                <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                  <SelectTrigger className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-xs">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="frequency" className="text-xs font-medium text-muted-foreground">
                  Frequency
                </Label>
                <Select value={data.frequency} onValueChange={(value) => setData('frequency', value)}>
                  <SelectTrigger className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily" className="text-xs">Daily</SelectItem>
                    <SelectItem value="weekly" className="text-xs">Weekly</SelectItem>
                    <SelectItem value="biweekly" className="text-xs">Bi-weekly</SelectItem>
                    <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
                    <SelectItem value="quarterly" className="text-xs">Quarterly</SelectItem>
                    <SelectItem value="yearly" className="text-xs">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="next_due_date" className="text-xs font-medium text-muted-foreground">
                  Next Due Date
                </Label>
                <Input
                  id="next_due_date"
                  type="date"
                  value={data.next_due_date}
                  onChange={(e) => setData('next_due_date', e.target.value)}
                  className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.next_due_date ? 'border-destructive' : 'border-border/70'}`}
                />
                {errors.next_due_date && <p className="text-destructive text-xs mt-1">{errors.next_due_date}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border/40">
              <Button type="submit" disabled={processing} className="rounded-xl px-5 text-xs font-semibold shadow-xs">
                {processing ? 'Saving...' : 'Update Recurring Item'}
              </Button>
              <Button type="button" variant="outline" asChild className="rounded-xl px-4 text-xs border-border/70">
                <Link href="/recurring-transactions">Cancel</Link>
              </Button>
            </div>
          </form>
        </KravioCard>
      </div>
    </AppLayout>
  );
}
