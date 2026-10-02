import React from 'react';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
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

interface Props {
  categories: Category[];
  currencies: CurrencyOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Budgets', href: '/budgets' },
  { title: 'Quick Budget', href: '/budgets/create-simple' },
];

export default function CreateSimple({ categories, currencies }: Props) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    currency: currencies[0]?.value ?? 'USD',
    period_type: 'monthly',
    period_year: currentYear,
    period_month: currentMonth,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    router.post('/budgets', formData, {
      onError: (err) => {
        setErrors(err);
        setProcessing(false);
      },
      onSuccess: () => {
        setProcessing(false);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Budget" />

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
              Create New Budget
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Set monthly category spending limit and tracking currency.
            </p>
          </div>
        </div>

        <KravioCard pattern innerClassName="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="category_id" className="text-xs font-medium text-muted-foreground">
                Category
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
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
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  className={`mt-1.5 h-10 font-mono text-sm rounded-xl bg-background/80 ${errors.amount ? 'border-destructive' : 'border-border/70'}`}
                />
                {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <Label htmlFor="currency" className="text-xs font-medium text-muted-foreground">
                  Currency
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value })}
                >
                  <SelectTrigger className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70 font-mono">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-xs font-mono">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && <p className="text-destructive text-xs mt-1">{errors.currency}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="period_year" className="text-xs font-medium text-muted-foreground">
                  Year
                </Label>
                <Input
                  id="period_year"
                  type="number"
                  value={formData.period_year}
                  onChange={(e) => setFormData({ ...formData, period_year: parseInt(e.target.value) || currentYear })}
                  className="mt-1.5 h-10 font-mono text-xs rounded-xl bg-background/80 border-border/70"
                />
                {errors.period_year && <p className="text-destructive text-xs mt-1">{errors.period_year}</p>}
              </div>

              <div>
                <Label htmlFor="period_month" className="text-xs font-medium text-muted-foreground">
                  Month (1 - 12)
                </Label>
                <Input
                  id="period_month"
                  type="number"
                  min="1"
                  max="12"
                  value={formData.period_month}
                  onChange={(e) => setFormData({ ...formData, period_month: parseInt(e.target.value) || currentMonth })}
                  className="mt-1.5 h-10 font-mono text-xs rounded-xl bg-background/80 border-border/70"
                />
                {errors.period_month && <p className="text-destructive text-xs mt-1">{errors.period_month}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border/40">
              <Button type="submit" disabled={processing} className="rounded-xl px-5 text-xs font-semibold shadow-xs">
                {processing ? 'Creating...' : 'Create Budget'}
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
