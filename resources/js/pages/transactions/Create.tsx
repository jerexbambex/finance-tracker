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

export default function Create({ accounts, categories }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    account_id: '',
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

  const filteredCategories = categories.filter(
    (cat) => cat.type === data.type
  );

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
    <AppLayout>
      <Head title="Add Transaction" />
      
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
                <BreadcrumbPage>Add Transaction</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <Card>
            <CardHeader>
              <CardTitle>Add New Transaction</CardTitle>
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
                          {account.name}
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
                        setData('is_split', !data.is_split);
                        if (!data.is_split && data.splits.length === 0) {
                          addSplit();
                        }
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
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="Amount"
                            value={split.amount}
                            onChange={(e) => updateSplit(index, 'amount', e.target.value)}
                            className="w-32"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSplit(index)}
                          >
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
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={data.amount}
                    onChange={(e) => setData('amount', e.target.value)}
                    placeholder="0.00"
                    className={errors.amount ? 'border-red-500' : ''}
                  />
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
                    placeholder="e.g., business, tax-deductible, urgent (comma-separated)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate multiple tags with commas
                  </p>
                </div>

                <div>
                  <Label htmlFor="receipt">Receipt/Invoice (Optional)</Label>
                  <Input
                    id="receipt"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setData('receipt', e.target.files?.[0] || null)}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or PDF (max 5MB)
                  </p>
                  {errors.receipt && <p className="text-red-500 text-sm mt-1">{errors.receipt}</p>}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Adding...' : 'Add Transaction'}
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
