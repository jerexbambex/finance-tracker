import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, CreditCard, Pencil, History } from 'lucide-react';

import { KravioCard, KravioCardPattern } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';

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
  return (
    <AppLayout>
      <Head title={account.name} />

      <div className="py-6 sm:py-8 space-y-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/accounts"
                className="p-1.5 rounded-lg border border-border/70 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{account.name}</h1>
                  <span className="text-[11px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/60">
                    {account.type.replace('_', ' ')}
                  </span>
                </div>
                {account.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{account.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/accounts/${account.id}/edit`}>
                <Button variant="outline" size="sm" className="rounded-xl text-xs h-9 border-border/70 gap-1.5">
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Account
                </Button>
              </Link>
              <Link href="/accounts">
                <Button variant="ghost" size="sm" className="rounded-xl text-xs h-9 text-muted-foreground">
                  All Accounts
                </Button>
              </Link>
            </div>
          </div>

          {/* Balance card */}
          <KravioCard pattern innerClassName="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Current Cleared Balance</span>
                <p className="text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight mt-1 text-foreground">
                  {formatCurrency(account.balance, account.currency)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </KravioCard>

          {/* Transactions list */}
          <KravioCard pattern noPadding innerClassName="overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-base font-semibold tracking-tight">Recent Activity</h2>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {account.transactions.length} entries
              </span>
            </div>

            {account.transactions.length > 0 ? (
              <div className="divide-y divide-border/40">
                {account.transactions.map((transaction) => {
                  const isExpense = transaction.type === 'expense';
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isExpense
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isExpense ? (
                            <ArrowDownRight className="h-4 w-4" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-foreground">{transaction.description}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {transaction.category?.name || 'Uncategorized'} •{' '}
                            <span className="font-mono">{new Date(transaction.transaction_date).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-semibold font-mono tabular-nums text-xs sm:text-sm ${
                          isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(Math.abs(transaction.amount), account.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No transactions recorded for this account yet.
              </div>
            )}
          </KravioCard>
        </div>
      </div>
    </AppLayout>
  );
}

