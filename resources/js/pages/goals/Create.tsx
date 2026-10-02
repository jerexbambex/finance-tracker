import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Target } from 'lucide-react';

import { KravioCard } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface CurrencyOption {
  value: string;
  label: string;
}

interface Props {
  currencies: CurrencyOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Goals', href: '/goals' },
  { title: 'Create Goal', href: '/goals/create' },
];

export default function Create({ currencies }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    target_amount: '',
    current_amount: '0',
    currency: currencies[0]?.value ?? 'USD',
    target_date: '',
    category: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/goals');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Goal" />

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/goals"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Create Savings Goal
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Set milestones, target dates, and track deposit progress.
            </p>
          </div>
        </div>

        <KravioCard pattern innerClassName="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                  Goal Name
                </Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.name ? 'border-destructive' : 'border-border/70'}`}
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="category" className="text-xs font-medium text-muted-foreground">
                  Category Tag (Optional)
                </Label>
                <Input
                  id="category"
                  value={data.category}
                  onChange={(e) => setData('category', e.target.value)}
                  placeholder="e.g., Savings, Travel, Real Estate"
                  className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="target_amount" className="text-xs font-medium text-muted-foreground">
                  Target Amount
                </Label>
                <Input
                  id="target_amount"
                  type="number"
                  step="0.01"
                  value={data.target_amount}
                  onChange={(e) => setData('target_amount', e.target.value)}
                  placeholder="0.00"
                  className={`mt-1.5 h-10 font-mono text-sm rounded-xl bg-background/80 ${errors.target_amount ? 'border-destructive' : 'border-border/70'}`}
                />
                {errors.target_amount && <p className="text-destructive text-xs mt-1">{errors.target_amount}</p>}
              </div>

              <div>
                <Label htmlFor="current_amount" className="text-xs font-medium text-muted-foreground">
                  Starting Amount
                </Label>
                <Input
                  id="current_amount"
                  type="number"
                  step="0.01"
                  value={data.current_amount}
                  onChange={(e) => setData('current_amount', e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5 h-10 font-mono text-sm rounded-xl bg-background/80 border-border/70"
                />
              </div>

              <div>
                <Label htmlFor="currency" className="text-xs font-medium text-muted-foreground">
                  Currency
                </Label>
                <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                  <SelectTrigger id="currency" className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70 font-mono">
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

            <div>
              <Label htmlFor="target_date" className="text-xs font-medium text-muted-foreground">
                Target Date (Optional)
              </Label>
              <Input
                id="target_date"
                type="date"
                value={data.target_date}
                onChange={(e) => setData('target_date', e.target.value)}
                className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="What is this goal for and how will you reach it?"
                rows={3}
                className="mt-1.5 rounded-xl text-xs bg-background/80 border-border/70"
              />
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border/40">
              <Button type="submit" disabled={processing} className="rounded-xl px-5 text-xs font-semibold shadow-xs">
                {processing ? 'Creating...' : 'Create Goal'}
              </Button>
              <Button type="button" variant="outline" asChild className="rounded-xl px-4 text-xs border-border/70">
                <Link href="/goals">Cancel</Link>
              </Button>
            </div>
          </form>
        </KravioCard>
      </div>
    </AppLayout>
  );
}
