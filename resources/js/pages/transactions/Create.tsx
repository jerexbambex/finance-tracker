import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Plus, Receipt, Split as SplitIcon, Tag, Calendar, Wallet } from 'lucide-react';

import { KravioCard } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

interface Account {
  id: string;
  name: string;
  currency: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface Props {
  accounts: Account[];
  categories: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Transactions', href: '/transactions' },
  { title: 'Add Transaction', href: '/transactions/create' },
];

export default function Create({ accounts, categories }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    account_id: accounts[0]?.id ?? '',
    category_id: '',
    type: 'expense',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: '',
    receipt: null as File | null,
    tags: '',
    is_split: false,
    splits: [] as Array<{ category_id: string; amount: string; description: string }>,
  });

  const selectedAccount = accounts.find((a) => a.id === data.account_id) ?? accounts[0] ?? null;
  const currencySymbol = selectedAccount
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedAccount.currency, minimumFractionDigits: 0 })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value ?? selectedAccount.currency
    : '$';

  const filteredCategories = categories.filter((cat) => cat.type === data.type);

  const addSplit = () => {
    setData('splits', [...data.splits, { category_id: '', amount: '', description: '' }]);
  };

  const removeSplit = (index: number) => {
    setData('splits', data.splits.filter((_, i) => i !== index));
  };

  const updateSplit = (index: number, field: string, value: string) => {
    const newSplits = [...data.splits];
    newSplits[index] = { ...newSplits[index], [field]: value };
    setData('splits', newSplits);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/transactions');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Add Transaction" />

      <div className="flex-1 max-w-3xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/transactions"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-muted/50 text-muted-foreground hover:text-foreground shadow-xs transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Add Transaction
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Record a new income, expense, or category split in your ledger.
              </p>
            </div>
          </div>
        </div>

        <KravioCard pattern innerClassName="p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type selector pill group */}
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

            {/* Account and Category row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account_id" className="text-xs font-medium text-muted-foreground">
                  Account
                </Label>
                <Select value={data.account_id} onValueChange={(value) => setData('account_id', value)}>
                  <SelectTrigger className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.account_id ? 'border-destructive' : 'border-border/70'}`}>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="text-xs">
                        {account.name} <span className="text-muted-foreground font-mono">({account.currency})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.account_id && <p className="text-destructive text-xs mt-1">{errors.account_id}</p>}
              </div>

              {!data.is_split && (
                <div>
                  <Label htmlFor="category_id" className="text-xs font-medium text-muted-foreground">
                    Category
                  </Label>
                  <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                    <SelectTrigger className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.category_id ? 'border-destructive' : 'border-border/70'}`}>
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
                  {errors.category_id && <p className="text-destructive text-xs mt-1">{errors.category_id}</p>}
                </div>
              )}
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
                  Amount
                </Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm pointer-events-none">
                    {currencySymbol}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={data.amount}
                    onChange={(e) => setData('amount', e.target.value)}
                    placeholder="0.00"
                    className={`h-10 pl-8 font-mono text-sm rounded-xl bg-background/80 ${errors.amount ? 'border-destructive' : 'border-border/70'}`}
                  />
                </div>
                {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount}</p>}
              </div>

              <div>
                <Label htmlFor="transaction_date" className="text-xs font-medium text-muted-foreground">
                  Date
                </Label>
                <Input
                  id="transaction_date"
                  type="date"
                  value={data.transaction_date}
                  onChange={(e) => setData('transaction_date', e.target.value)}
                  className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.transaction_date ? 'border-destructive' : 'border-border/70'}`}
                />
                {errors.transaction_date && <p className="text-destructive text-xs mt-1">{errors.transaction_date}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
                Description
              </Label>
              <Input
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="e.g., Grocery store, Monthly rent, Client invoice"
                className={`mt-1.5 h-10 rounded-xl text-xs bg-background/80 ${errors.description ? 'border-destructive' : 'border-border/70'}`}
              />
              {errors.description && <p className="text-destructive text-xs mt-1">{errors.description}</p>}
            </div>

            {/* Split Transactions Section */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <SplitIcon className="h-3.5 w-3.5" />
                  Split Across Multiple Categories
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-lg border-border/70"
                  onClick={() => {
                    setData('is_split', !data.is_split);
                    if (!data.is_split && data.splits.length === 0) {
                      addSplit();
                    }
                  }}
                >
                  {data.is_split ? 'Remove Split' : '+ Split Category'}
                </Button>
              </div>

              {data.is_split && (
                <div className="space-y-2.5 rounded-xl border border-border/60 bg-muted/20 p-3.5">
                  {data.splits.map((split, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Select
                          value={split.category_id}
                          onValueChange={(value) => updateSplit(index, 'category_id', value)}
                        >
                          <SelectTrigger className="h-9 rounded-lg text-xs bg-background">
                            <SelectValue placeholder="Category" />
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
                      <div className="relative w-32">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs pointer-events-none">
                          {currencySymbol}
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={split.amount}
                          onChange={(e) => updateSplit(index, 'amount', e.target.value)}
                          className="h-9 pl-6 font-mono text-xs rounded-lg bg-background"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeSplit(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px] rounded-lg border-dashed border-border/80"
                    onClick={addSplit}
                  >
                    + Add Category Split
                  </Button>
                </div>
              )}
            </div>

            {/* Notes & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tags" className="text-xs font-medium text-muted-foreground">
                  Tags (Optional)
                </Label>
                <Input
                  id="tags"
                  value={data.tags}
                  onChange={(e) => setData('tags', e.target.value)}
                  placeholder="e.g., tax, subscription, travel"
                  className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70"
                />
                <p className="text-[11px] text-muted-foreground mt-1">Comma-separated tags</p>
              </div>

              <div>
                <Label htmlFor="receipt" className="text-xs font-medium text-muted-foreground">
                  Receipt / Invoice (Optional)
                </Label>
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setData('receipt', e.target.files?.[0] || null)}
                  className="mt-1.5 h-10 rounded-xl text-xs bg-background/80 border-border/70 cursor-pointer file:text-xs file:font-medium"
                />
                <p className="text-[11px] text-muted-foreground mt-1">PNG, JPG or PDF up to 5MB</p>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground">
                Notes (Optional)
              </Label>
              <Textarea
                id="notes"
                value={data.notes}
                onChange={(e) => setData('notes', e.target.value)}
                placeholder="Additional notes about this transaction"
                rows={2}
                className="mt-1.5 rounded-xl text-xs bg-background/80 border-border/70"
              />
            </div>

            {/* Submit Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-border/40">
              <Button type="submit" disabled={processing} className="rounded-xl px-5 text-xs font-semibold shadow-xs">
                {processing ? 'Adding Transaction...' : 'Add Transaction'}
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
