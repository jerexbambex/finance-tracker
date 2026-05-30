import { Head, useForm, Link } from '@inertiajs/react';

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';

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

interface Split {
  id?: string;
  category_id: string;
  amount: number;
  description?: string;
  category?: { id: string; name: string };
}

interface Tag {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  account_id: string;
  category_id: string;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  notes: string;
  tags?: Tag[];
  splits?: Split[];
  media?: Array<{ id: number; file_name: string; original_url: string }>;
}

interface Props {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
}

export default function Edit({ transaction, accounts, categories }: Props) {
  const existingSplits = transaction.splits?.map((s) => ({
    category_id: s.category_id,
    amount: s.amount.toString(),
    description: s.description ?? '',
  })) ?? [];

  const { data, setData, put, processing, errors } = useForm({
    account_id: transaction.account_id,
    category_id: transaction.category_id ?? '',
    type: transaction.type,
    amount: transaction.amount.toString(),
    description: transaction.description,
    transaction_date: transaction.transaction_date,
    notes: transaction.notes || '',
    tags: transaction.tags?.map((t) => t.name).join(', ') ?? '',
    is_split: existingSplits.length > 0,
    splits: existingSplits as Array<{ category_id: string; amount: string; description: string }>,
    receipt: null as File | null,
  });

  const addSplit = () => setData('splits', [...data.splits, { category_id: '', amount: '', description: '' }]);
  const removeSplit = (i: number) => setData('splits', data.splits.filter((_, idx) => idx !== i));
  const updateSplit = (i: number, field: string, value: string) => {
    const next = [...data.splits];
    next[i] = { ...next[i], [field]: value };
    setData('splits', next);
  };

  const selectedAccount = accounts.find((a) => a.id === data.account_id) ?? null;
  const currencySymbol = selectedAccount
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedAccount.currency, minimumFractionDigits: 0 })
        .formatToParts(0)
        .find((p) => p.type === 'currency')?.value ?? selectedAccount.currency
    : '';

  const filteredCategories = categories.filter(
    (cat) => cat.type === data.type
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/transactions/${transaction.id}`);
  };

  return (
    <AppLayout>
      <Head title="Edit Transaction" />
      
      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/dashboard">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/transactions">Transactions</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit Transaction</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <Card>
            <CardHeader>
              <CardTitle>Edit Transaction</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="account_id">Account</Label>
                  <Select value={data.account_id} onValueChange={(value) => setData('account_id', value)}>
                    <SelectTrigger className={errors.account_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} <span className="text-muted-foreground">({account.currency})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.account_id && <p className="text-red-500 text-sm mt-1">{errors.account_id}</p>}
                </div>

                {!data.is_split && (
                  <div>
                    <Label htmlFor="category_id">Category</Label>
                    <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Split Transaction</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const next = !data.is_split;
                        setData('is_split', next);
                        if (next && data.splits.length === 0) addSplit();
                      }}
                    >
                      {data.is_split ? 'Remove Split' : 'Split Across Categories'}
                    </Button>
                  </div>

                  {data.is_split && (
                    <div className="space-y-3 border rounded-lg p-4">
                      {data.splits.map((split, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1">
                            <Select
                              value={split.category_id}
                              onValueChange={(value) => updateSplit(index, 'category_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Category" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredCategories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="relative w-32">
                            {currencySymbol && (
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                                {currencySymbol}
                              </span>
                            )}
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={split.amount}
                              onChange={(e) => updateSplit(index, 'amount', e.target.value)}
                              className={currencySymbol ? 'pl-8' : ''}
                            />
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeSplit(index)}>
                            ×
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" onClick={addSplit}>
                        + Add Split
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    {currencySymbol && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                        {currencySymbol}
                      </span>
                    )}
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={data.amount}
                      onChange={(e) => setData('amount', e.target.value)}
                      placeholder="0.00"
                      className={`${currencySymbol ? 'pl-8' : ''} ${errors.amount ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="e.g., Grocery shopping"
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div>
                  <Label htmlFor="transaction_date">Date</Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={data.transaction_date}
                    onChange={(e) => setData('transaction_date', e.target.value)}
                    className={errors.transaction_date ? 'border-red-500' : ''}
                  />
                  {errors.transaction_date && <p className="text-red-500 text-sm mt-1">{errors.transaction_date}</p>}
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => setData('notes', e.target.value)}
                    placeholder="Additional notes"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (Optional)</Label>
                  <Input
                    id="tags"
                    value={data.tags}
                    onChange={(e) => setData('tags', e.target.value)}
                    placeholder="e.g., business, tax-deductible (comma-separated)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate multiple tags with commas</p>
                </div>

                <div>
                  <Label htmlFor="receipt">Receipt/Invoice (Optional)</Label>
                  {transaction.media && transaction.media.length > 0 && (
                    <div className="mb-2 text-sm text-gray-600">
                      Current: <a href={transaction.media[0].original_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{transaction.media[0].file_name}</a>
                    </div>
                  )}
                  <Input
                    id="receipt"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setData('receipt', e.target.files?.[0] || null)}
                  />
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG, or PDF (max 5MB)</p>
                  {errors.receipt && <p className="text-red-500 text-sm mt-1">{errors.receipt}</p>}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Updating...' : 'Update Transaction'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => window.history.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
