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

interface Category {
  id: string;
  name: string;
}

interface CurrencyOption {
  value: string;
  label: string;
}

interface Budget {
  id: string;
  category_id: string;
  amount: number;
  currency: string;
  period_type: string;
  period_year: number;
  period_month: number | null;
}

interface Props {
  budget: Budget;
  categories: Category[];
  currencies: CurrencyOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Budgets', href: '/budgets' },
  { title: 'Edit Budget', href: '#' },
];

export default function Edit({ budget, categories, currencies }: Props) {
  const currentYear = new Date().getFullYear();

  const { data, setData, put, processing, errors } = useForm({
    category_id: budget.category_id,
    amount: budget.amount.toString(),
    currency: budget.currency ?? 'USD',
    period_type: budget.period_type,
    period_year: budget.period_year.toString(),
    period_month: budget.period_month?.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/budgets/${budget.id}`);
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Budget" />

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/budgets"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Edit Budget
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Update spending limits or period definitions.
            </p>
          </div>
        </div>

        <KravioCard pattern innerClassName="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="category_id" className="text-xs font-medium text-muted-foreground">
                Category
              </Label>
              <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                <SelectTrigger className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.category_id ? 'border-destructive' : 'border-border/70'}`}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-xs">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="text-destructive text-xs mt-1">{errors.category_id}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
                  Budget Amount
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
                <Label htmlFor="currency" className="text-xs font-medium text-muted-foreground">
                  Currency
                </Label>
                <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                  <SelectTrigger className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.currency ? 'border-destructive' : 'border-border/70'}`}>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-xs font-mono">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && <p className="text-destructive text-xs mt-1">{errors.currency}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="period_type" className="text-xs font-medium text-muted-foreground">
                  Period Type
                </Label>
                <Select value={data.period_type} onValueChange={(value) => setData('period_type', value)}>
                  <SelectTrigger className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
                    <SelectItem value="yearly" className="text-xs">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="period_year" className="text-xs font-medium text-muted-foreground">
                  Year
                </Label>
                <Select value={data.period_year} onValueChange={(value) => setData('period_year', value)}>
                  <SelectTrigger className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-xs font-mono">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {data.period_type === 'monthly' && (
                <div>
                  <Label htmlFor="period_month" className="text-xs font-medium text-muted-foreground">
                    Month
                  </Label>
                  <Select value={data.period_month} onValueChange={(value) => setData('period_month', value)}>
                    <SelectTrigger className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value} className="text-xs">
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border/40">
              <Button type="submit" disabled={processing} className="rounded-xl px-5 text-xs font-semibold shadow-xs">
                {processing ? 'Saving...' : 'Update Budget'}
              </Button>
              <Button type="button" variant="outline" asChild className="rounded-xl px-4 text-xs border-border/70">
                <Link href="/budgets">Cancel</Link>
              </Button>
            </div>
          </form>
        </KravioCard>
      </div>
    </AppLayout>
  );
}
