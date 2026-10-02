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

interface Props {
  categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Budgets', href: '/budgets' },
  { title: 'Create Budget', href: '/budgets/create' },
];

export default function Create({ categories }: Props) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const { data, setData, transform, post, processing, errors } = useForm({
    category_id: '',
    amount: '',
    period_type: 'monthly',
    year: currentYear,
    month: currentMonth,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map to the backend field names before submitting
    transform((data) => ({
      category_id: data.category_id,
      amount: data.amount,
      period_type: data.period_type,
      period_year: data.year,
      period_month: data.month,
    }));

    post('/budgets');
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
              Set spending limits for categories by month or year.
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

            <div>
              <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
                Budget Limit Amount
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
                <Label htmlFor="year" className="text-xs font-medium text-muted-foreground">
                  Year
                </Label>
                <Select value={data.year.toString()} onValueChange={(value) => setData('year', parseInt(value))}>
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
                  <Label htmlFor="month" className="text-xs font-medium text-muted-foreground">
                    Month
                  </Label>
                  <Select value={data.month.toString()} onValueChange={(value) => setData('month', parseInt(value))}>
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
