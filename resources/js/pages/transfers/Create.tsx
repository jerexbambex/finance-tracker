import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowRight, ArrowLeft, ArrowLeftRight, AlertCircle } from 'lucide-react';

import { KravioCard } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';
import { type BreadcrumbItem } from '@/types';

interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
}

interface Props {
  accounts: Account[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Accounts', href: '/accounts' },
  { title: 'Transfer Funds', href: '/transfers/create' },
];

export default function Create({ accounts }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    from_account_id: '',
    to_account_id: '',
    amount: '',
    description: '',
    transfer_date: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/transfers');
  };

  const fromAccount = accounts.find((a) => a.id === data.from_account_id);
  const toAccount = accounts.find((a) => a.id === data.to_account_id);
  const currencyMismatch = !!fromAccount && !!toAccount && fromAccount.currency !== toAccount.currency;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Transfer Funds" />

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
              Transfer Between Accounts
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Move balances safely between your configured accounts with instant double-entry recording.
            </p>
          </div>
        </div>

        <KravioCard pattern innerClassName="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-center">
              <div>
                <Label htmlFor="from_account_id" className="text-xs font-medium text-muted-foreground">
                  Source Account
                </Label>
                <Select value={data.from_account_id} onValueChange={(value) => setData('from_account_id', value)}>
                  <SelectTrigger className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.from_account_id ? 'border-destructive' : 'border-border/70'}`}>
                    <SelectValue placeholder="From account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="text-xs">
                        {account.name} ({formatCurrency(account.balance, account.currency)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.from_account_id && <p className="text-destructive text-xs mt-1">{errors.from_account_id}</p>}
              </div>

              <div className="hidden sm:flex items-center justify-center pt-5">
                <div className="w-8 h-8 rounded-full bg-muted border border-border/60 flex items-center justify-center text-muted-foreground">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              <div>
                <Label htmlFor="to_account_id" className="text-xs font-medium text-muted-foreground">
                  Destination Account
                </Label>
                <Select value={data.to_account_id} onValueChange={(value) => setData('to_account_id', value)}>
                  <SelectTrigger className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.to_account_id ? 'border-destructive' : 'border-border/70'}`}>
                    <SelectValue placeholder="To account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="text-xs">
                        {account.name} ({formatCurrency(account.balance, account.currency)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.to_account_id && <p className="text-destructive text-xs mt-1">{errors.to_account_id}</p>}
              </div>
            </div>

            {fromAccount && toAccount && fromAccount.id === toAccount.id && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-2 text-destructive text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Cannot transfer funds to the exact same account.</span>
              </div>
            )}

            {currencyMismatch && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-2 text-destructive text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Both accounts must share the same currency ({fromAccount?.currency} → {toAccount?.currency} is not supported).
                </span>
              </div>
            )}

            <div>
              <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
                Transfer Amount
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={data.amount}
                  onChange={(e) => setData('amount', e.target.value)}
                  placeholder="0.00"
                  className={`h-10 rounded-xl text-sm font-mono font-semibold bg-background/80 ${errors.amount ? 'border-destructive' : 'border-border/70'}`}
                />
                {fromAccount && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground pointer-events-none">
                    {fromAccount.currency}
                  </span>
                )}
              </div>
              {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount}</p>}
              {fromAccount && data.amount && parseFloat(data.amount) > fromAccount.balance && (
                <p className="text-amber-600 dark:text-amber-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5" />
                  Warning: Amount exceeds available balance ({formatCurrency(fromAccount.balance, fromAccount.currency)})
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="transfer_date" className="text-xs font-medium text-muted-foreground">
                  Execution Date
                </Label>
                <Input
                  id="transfer_date"
                  type="date"
                  value={data.transfer_date}
                  onChange={(e) => setData('transfer_date', e.target.value)}
                  className={`mt-1.5 h-10 rounded-xl text-xs font-mono bg-background/80 ${errors.transfer_date ? 'border-destructive' : 'border-border/70'}`}
                />
                {errors.transfer_date && <p className="text-destructive text-xs mt-1">{errors.transfer_date}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
                  Note / Reference (Optional)
                </Label>
                <Input
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="e.g., Monthly savings contribution"
                  className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border/40">
              <Button
                type="submit"
                disabled={processing || !data.from_account_id || !data.to_account_id || fromAccount?.id === toAccount?.id || currencyMismatch}
                className="rounded-xl text-xs px-5 font-semibold gap-1.5 shadow-xs"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                {processing ? 'Processing Transfer...' : 'Complete Transfer'}
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
