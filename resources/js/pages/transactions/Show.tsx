import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, DollarSign, FileText, Tag, Wallet, Image as ImageIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';


interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  notes?: string;
  currency: string;
  account: {
    name: string;
    type: string;
  };
  category?: {
    name: string;
    color?: string;
  };
  media?: Array<{
    id: string;
    file_name: string;
    mime_type: string;
    size: number;
    original_url: string;
  }>;
}

interface Props {
  transaction: Transaction;
}

export default function Show({ transaction }: Props) {
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <AppLayout>
      <Head title={`Transaction - ${transaction.description}`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/transactions">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Transactions
              </Button>
            </Link>
            <Link href={`/transactions/${transaction.id}/edit`}>
              <Button size="sm">Edit Transaction</Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Transaction Details</CardTitle>
                <Badge
                  variant={transaction.type === 'income' ? 'default' : 'destructive'}
                  className="text-sm"
                >
                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Amount
                  </div>
                  <div className="text-2xl font-bold">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date
                  </div>
                  <div className="text-lg">{formatDate(transaction.transaction_date)}</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4 mr-2" />
                    Account
                  </div>
                  <div className="text-lg">{transaction.account.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {transaction.account.type.replace('_', ' ')}
                  </div>
                </div>

                {transaction.category && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Tag className="h-4 w-4 mr-2" />
                      Category
                    </div>
                    <div className="flex items-center gap-2">
                      {transaction.category.color && (
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: transaction.category.color }}
                        />
                      )}
                      <div className="text-lg">{transaction.category.name}</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="h-4 w-4 mr-2" />
                  Description
                </div>
                <div className="text-lg">{transaction.description}</div>
              </div>

              {transaction.notes && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Notes</div>
                  <div className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                    {transaction.notes}
                  </div>
                </div>
              )}

              {transaction.media && transaction.media.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Attachments ({transaction.media.length})
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {transaction.media.map((file) => (
                      <a
                        key={file.id}
                        href={file.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted transition-colors"
                      >
                        {file.mime_type.startsWith('image/') ? (
                          <img
                            src={file.original_url}
                            alt={file.file_name}
                            className="h-16 w-16 object-cover rounded"
                          />
                        ) : (
                          <div className="h-16 w-16 flex items-center justify-center bg-muted rounded">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{file.file_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
