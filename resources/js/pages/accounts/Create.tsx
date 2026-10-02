import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Wallet } from 'lucide-react';

import { KravioCard } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Accounts', href: '/accounts' },
  { title: 'Create Account', href: '/accounts/create' },
];

export default function Create({ currencies = [] }: { currencies?: Array<{ value: string; label: string; symbol: string }> }) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    type: 'checking',
    balance: '',
    currency: currencies[0]?.value ?? 'USD',
    description: '',
  });

  const accountTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'investment', label: 'Investment Account' },
    { value: 'cash', label: 'Cash' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/accounts');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Account" />

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/accounts"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Create New Account
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Add a bank account, credit card, investment fund, or cash wallet.
            </p>
          </div>
        </div>

        <KravioCard pattern innerClassName="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                  Account Name
                </Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="e.g., Main Checking, Savings, Chase Sapphire"
                  className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.name ? 'border-destructive' : 'border-border/70'}`}
                />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="type" className="text-xs font-medium text-muted-foreground">
                  Account Type
                </Label>
                <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                  <SelectTrigger className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.type ? 'border-destructive' : 'border-border/70'}`}>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-xs">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-destructive text-xs mt-1">{errors.type}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="balance" className="text-xs font-medium text-muted-foreground">
                  Initial Balance
                </Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={data.balance}
                  onChange={(e) => setData('balance', e.target.value)}
                  placeholder="0.00"
                  className={`mt-1.5 h-10 font-mono text-sm rounded-xl bg-background/80 ${errors.balance ? 'border-destructive' : 'border-border/70'}`}
                />
                {errors.balance && <p className="text-destructive text-xs mt-1">{errors.balance}</p>}
              </div>

              <div>
                <Label htmlFor="currency" className="text-xs font-medium text-muted-foreground">
                  Currency
                </Label>
                <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                  <SelectTrigger className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value} className="text-xs font-mono">
                        {currency.symbol} {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Additional notes about this account"
                rows={3}
                className="mt-1.5 rounded-xl text-xs bg-background/80 border-border/70"
              />
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border/40">
              <Button type="submit" disabled={processing} className="rounded-xl px-5 text-xs font-semibold shadow-xs">
                {processing ? 'Creating...' : 'Create Account'}
              </Button>
              <Button type="button" variant="outline" asChild className="rounded-xl px-4 text-xs border-border/70">
                <Link href="/accounts">Cancel</Link>
              </Button>
            </div>
          </form>
        </KravioCard>
      </div>
    </AppLayout>
  );
}
