import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Upload, ArrowLeft, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

import { KravioCard } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Account {
  id: string;
  name: string;
  currency?: string;
}

interface Props {
  accounts: Account[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Transactions', href: '/transactions' },
  { title: 'Import CSV', href: '/import/transactions' },
];

export default function Index({ accounts }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    file: null as File | null,
    account_id: accounts[0]?.id ?? '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/import/transactions');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Import Transactions" />

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Link
            href="/transactions"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Import Transactions
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Bulk ingest bank statements or exported records directly into your ledger.
            </p>
          </div>
        </div>

        <KravioCard pattern innerClassName="p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-foreground">CSV Template Structure</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ensure your file includes header columns for Date, Description, Amount, Type, and Category.
              </p>
            </div>
          </div>

          <div className="bg-muted/50 border border-border/60 rounded-xl p-3 font-mono text-xs text-foreground overflow-x-auto">
            Date, Description, Amount, Type, Category
          </div>
          <p className="text-[11px] text-muted-foreground font-mono mt-2">
            Example: 2026-10-01, Grocery Store, 45.50, expense, Groceries
          </p>
        </KravioCard>

        <KravioCard pattern innerClassName="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="account" className="text-xs font-medium text-muted-foreground">
                Target Account
              </Label>
              <Select
                value={data.account_id}
                onValueChange={(value) => setData('account_id', value)}
              >
                <SelectTrigger className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.account_id ? 'border-destructive' : 'border-border/70'}`}>
                  <SelectValue placeholder="Select target account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id} className="text-xs">
                      {account.name} {account.currency ? `(${account.currency})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.account_id && (
                <p className="text-xs text-destructive mt-1">{errors.account_id}</p>
              )}
            </div>

            <div>
              <Label htmlFor="file" className="text-xs font-medium text-muted-foreground">
                CSV File
              </Label>
              <div className="mt-1.5 border border-dashed border-border/80 rounded-2xl p-6 bg-background/50 hover:bg-muted/20 transition-colors text-center">
                <input
                  id="file"
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setData('file', e.target.files?.[0] || null)}
                  className="block w-full text-xs file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border file:border-border/70 file:text-xs file:font-semibold file:bg-muted/80 file:text-foreground hover:file:bg-muted cursor-pointer text-muted-foreground"
                />
                {data.file && (
                  <p className="text-xs font-medium text-primary mt-3 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Selected: {data.file.name} ({(data.file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
              {errors.file && (
                <p className="text-xs text-destructive mt-1">{errors.file}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-border/40">
              <Button
                type="submit"
                disabled={processing || !data.file || !data.account_id}
                className="rounded-xl text-xs px-5 font-semibold gap-1.5 shadow-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                {processing ? 'Importing Data...' : 'Upload and Parse CSV'}
              </Button>
              <Button type="button" variant="outline" asChild className="rounded-xl px-4 text-xs border-border/70">
                <Link href="/transactions">Cancel</Link>
              </Button>
            </div>
          </form>
        </KravioCard>
      </div>
    </AppLayout>
  );
}
