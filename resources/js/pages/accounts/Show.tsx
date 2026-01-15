import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  category: { name: string } | null;
}

interface Account {
  id: number;
  name: string;
  type: string;
  balance: number;
  currency: string;
  description: string | null;
  transactions: Transaction[];
}

interface Props {
  account: Account;
}

export default function Show({ account }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: account.currency || 'USD',
    }).format(amount);
  };

  return (
    <AppLayout>
      <Head title={account.name} />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">{account.name}</h1>
            <div className="flex gap-2">
              <Link href={`/accounts/${account.id}/edit`}>
                <Button>Edit Account</Button>
              </Link>
              <Link href="/accounts">
                <Button variant="outline">Back</Button>
              </Link>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Type:</span>
                <p className="font-medium capitalize">{account.type.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Balance:</span>
                <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
              </div>
              {account.description && (
                <div>
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <p>{account.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {account.transactions.length > 0 ? (
                <div className="space-y-2">
                  {account.transactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category?.name} • {new Date(transaction.transaction_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No transactions yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
