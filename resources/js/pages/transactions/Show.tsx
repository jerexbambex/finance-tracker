import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, DollarSign, FileText, Tag, Wallet, Image as ImageIcon, Pencil, ArrowUpRight, ArrowDownRight } from 'lucide-react';

import { KravioCard, KravioCardPattern } from '@/components/dashboard/KravioCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';

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

  const isExpense = transaction.type === 'expense';

  return (
    <AppLayout>
      <Head title={`Transaction - ${transaction.description}`} />

      <div className="py-6 sm:py-8 space-y-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/transactions"
                className="p-1.5 rounded-lg border border-border/70 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Transaction Details</h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Ledger entry record #{transaction.id.slice(0, 8)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/transactions/${transaction.id}/edit`}>
                <Button variant="outline" size="sm" className="rounded-xl text-xs h-9 border-border/70 gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Entry
                </Button>
              </Link>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" className="rounded-xl text-xs h-9 text-muted-foreground">
                  Back to List
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Hero Card */}
          <KravioCard className="p-6 sm:p-8" pattern>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    isExpense
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {isExpense ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{transaction.description}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                        isExpense
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {transaction.type}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">{formatDate(transaction.transaction_date)}</span>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground">Amount</span>
                <p
                  className={`text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight mt-0.5 ${
                    isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isExpense ? '-' : '+'}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
              </div>
            </div>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-border/60">
              <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5" />
                  <span>Account</span>
                </div>
                <p className="text-sm font-semibold text-foreground">{transaction.account.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{transaction.account.type.replace('_', ' ')}</p>
              </div>

              <div className="p-4 rounded-xl bg-muted/20 border border-border/40 space-y-1">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Tag className="h-3.5 w-3.5" />
                  <span>Category</span>
                </div>
                {transaction.category ? (
                  <div className="flex items-center gap-2">
                    {transaction.category.color && (
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: transaction.category.color }}
                      />
                    )}
                    <span className="text-sm font-semibold text-foreground">{transaction.category.name}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Uncategorized</p>
                )}
              </div>
            </div>

            {/* Notes */}
            {transaction.notes && (
              <div className="pt-6">
                <span className="text-xs font-medium text-muted-foreground block mb-2">Internal Notes</span>
                <div className="text-xs sm:text-sm bg-muted/30 border border-border/40 p-4 rounded-xl whitespace-pre-wrap text-foreground">
                  {transaction.notes}
                </div>
              </div>
            )}

            {/* Attachments */}
            {transaction.media && transaction.media.length > 0 && (
              <div className="pt-6 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Receipts & Attachments ({transaction.media.length})</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {transaction.media.map((file) => (
                    <a
                      key={file.id}
                      href={file.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/70 hover:bg-muted/40 transition-colors group"
                    >
                      {file.mime_type.startsWith('image/') ? (
                        <img
                          src={file.original_url}
                          alt={file.file_name}
                          className="h-12 w-12 object-cover rounded-lg border border-border/60"
                        />
                      ) : (
                        <div className="h-12 w-12 flex items-center justify-center bg-muted rounded-lg text-muted-foreground">
                          <FileText className="h-6 w-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                          {file.file_name}
                        </p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </KravioCard>
        </div>
      </div>
    </AppLayout>
  );
}

