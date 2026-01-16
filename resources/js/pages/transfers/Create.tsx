import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface Props {
  accounts: Account[];
}

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
    post('/transfers', {
      onSuccess: () => {
        // Redirect happens automatically via Inertia
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const fromAccount = accounts.find(a => a.id === data.from_account_id);
  const toAccount = accounts.find(a => a.id === data.to_account_id);

  return (
    <AppLayout>
      <Head title="Transfer Between Accounts" />
      
      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Between Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label htmlFor="from_account_id">From Account</Label>
                    <Select value={data.from_account_id} onValueChange={(value) => setData('from_account_id', value)}>
                      <SelectTrigger className={errors.from_account_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} ({formatCurrency(account.balance)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.from_account_id && <p className="text-red-500 text-sm mt-1">{errors.from_account_id}</p>}
                  </div>

                  <div className="flex justify-center">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div>
                    <Label htmlFor="to_account_id">To Account</Label>
                    <Select value={data.to_account_id} onValueChange={(value) => setData('to_account_id', value)}>
                      <SelectTrigger className={errors.to_account_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name} ({formatCurrency(account.balance)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.to_account_id && <p className="text-red-500 text-sm mt-1">{errors.to_account_id}</p>}
                  </div>
                </div>

                {fromAccount && toAccount && fromAccount.id === toAccount.id && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">Cannot transfer to the same account</p>
                  </div>
                )}

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
                  {fromAccount && data.amount && parseFloat(data.amount) > fromAccount.balance && (
                    <p className="text-orange-600 text-sm mt-1">
                      Warning: Amount exceeds available balance
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Transfer description"
                  />
                </div>

                <div>
                  <Label htmlFor="transfer_date">Transfer Date</Label>
                  <Input
                    id="transfer_date"
                    type="date"
                    value={data.transfer_date}
                    onChange={(e) => setData('transfer_date', e.target.value)}
                    className={errors.transfer_date ? 'border-red-500' : ''}
                  />
                  {errors.transfer_date && <p className="text-red-500 text-sm mt-1">{errors.transfer_date}</p>}
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={processing || (fromAccount?.id === toAccount?.id)}>
                    {processing ? 'Processing...' : 'Transfer'}
                  </Button>
                  <Link href="/accounts">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
