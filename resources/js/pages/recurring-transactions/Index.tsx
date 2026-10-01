import { Head, Link, router } from "@inertiajs/react";
import { Calendar, Repeat, Pencil, Trash2, Plus, Clock, CheckCircle2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import AppLayout from "@/layouts/app-layout";
import { formatCurrency } from '@/lib/formatCurrency';
import { KravioCard } from '@/components/dashboard/KravioCard';

interface RecurringTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  frequency: string;
  next_due_date: string;
  is_active: boolean;
  account: { name: string };
  category?: { name: string; color?: string };
}

interface Props {
  recurringTransactions: RecurringTransaction[];
}

export default function Index({ recurringTransactions }: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const toggleActive = (id: string, isActive: boolean) => {
    router.put(`/recurring-transactions/${id}`, { is_active: !isActive }, {
      preserveScroll: true,
    });
  };

  const activeTransactions = recurringTransactions.filter((t) => t.is_active);
  const inactiveTransactions = recurringTransactions.filter((t) => !t.is_active);

  const RecurringCardItem = ({ transaction }: { transaction: RecurringTransaction }) => {
    const isIncome = transaction.type === "income";

    return (
      <KravioCard
        pattern
        className="group/rec animate-rise transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
        innerClassName="p-4 sm:p-5 flex flex-col justify-between h-full bg-gradient-to-br from-card to-muted/20"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white font-semibold shadow-2xs"
              style={{
                backgroundColor: transaction.category?.color || "#6b7280",
              }}
            >
              <Repeat className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm text-foreground truncate group-hover/rec:text-primary transition-colors">
                {transaction.description}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">{transaction.category?.name || "Uncategorized"}</span>
                <span>•</span>
                <span className="capitalize">{transaction.frequency}</span>
                {transaction.next_due_date && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Next: {formatDate(transaction.next_due_date)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Switch
              checked={transaction.is_active}
              onCheckedChange={() => toggleActive(transaction.id, transaction.is_active)}
            />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block">Amount</span>
            <span
              className={`font-mono text-base sm:text-lg font-bold tabular-nums ${
                isIncome
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {isIncome ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Link href={`/recurring-transactions/${transaction.id}/edit`}>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground">
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure? This will stop future automatic executions.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => router.delete(`/recurring-transactions/${transaction.id}`)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </KravioCard>
    );
  };

  return (
    <AppLayout>
      <Head title="Recurring Transactions" />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* ── Kravio Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-rise">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Recurring Transactions</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Automated schedules for subscriptions, recurring invoices, and regular paychecks.
            </p>
          </div>

          <Link href="/recurring-transactions/create">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New Recurring
            </Button>
          </Link>
        </div>

        {recurringTransactions.length === 0 ? (
          <KravioCard pattern className="text-center py-16">
            <Repeat className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No recurring schedules active</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Automate routine bills, rent, subscriptions, and paycheck deposits with automatic balance tracking.
            </p>
            <div className="mt-4">
              <Link href="/recurring-transactions/create">
                <Button size="sm">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Create First Recurring Transaction
                </Button>
              </Link>
            </div>
          </KravioCard>
        ) : (
          <div className="space-y-6">
            {activeTransactions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Active Schedules ({activeTransactions.length})
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {activeTransactions.map((tx) => (
                    <RecurringCardItem key={tx.id} transaction={tx} />
                  ))}
                </div>
              </div>
            )}

            {inactiveTransactions.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Paused / Inactive ({inactiveTransactions.length})
                  </h2>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 opacity-70">
                  {inactiveTransactions.map((tx) => (
                    <RecurringCardItem key={tx.id} transaction={tx} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
