import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, Repeat, Pencil, Trash2 } from "lucide-react";
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

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

  return (
    <AppLayout>
      <Head title="Recurring Transactions" />

      <div className="py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Recurring Transactions</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage your automatic transactions
              </p>
            </div>
            <Link href="/recurring-transactions/create">
              <Button>
                <Repeat className="mr-2 h-4 w-4" />
                New Recurring
              </Button>
            </Link>
          </div>

          {recurringTransactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Repeat className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No recurring transactions</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-4">
                  Set up automatic transactions for bills, subscriptions, and regular income
                </p>
                <Link href="/recurring-transactions/create">
                  <Button>Create Your First Recurring Transaction</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Active Transactions */}
              {activeTransactions.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">
                    Active ({activeTransactions.length})
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {activeTransactions.map((transaction) => (
                      <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                                style={{
                                  backgroundColor: transaction.category?.color || "#6b7280",
                                }}
                              >
                                <Repeat className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{transaction.description}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <span>{transaction.category?.name || "Uncategorized"}</span>
                                  <span>•</span>
                                  <span className="capitalize">{transaction.frequency}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(transaction.next_due_date)}
                                  </span>
                                </div>
                                <p
                                  className={`font-semibold mt-2 ${
                                    transaction.type === "income"
                                      ? "text-green-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {transaction.type === "income" ? "+" : "-"}
                                  {formatCurrency(transaction.amount)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Switch
                                checked={transaction.is_active}
                                onCheckedChange={() =>
                                  toggleActive(transaction.id, transaction.is_active)
                                }
                              />
                              <Link href={`/recurring-transactions/${transaction.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure? This will stop future automatic transactions.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        router.delete(`/recurring-transactions/${transaction.id}`)
                                      }
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Inactive Transactions */}
              {inactiveTransactions.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">
                    Inactive ({inactiveTransactions.length})
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2">
                    {inactiveTransactions.map((transaction) => (
                      <Card key={transaction.id} className="opacity-60">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                                style={{
                                  backgroundColor: transaction.category?.color || "#6b7280",
                                }}
                              >
                                <Repeat className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{transaction.description}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <span>{transaction.category?.name || "Uncategorized"}</span>
                                  <span>•</span>
                                  <span className="capitalize">{transaction.frequency}</span>
                                </div>
                                <p className="font-semibold mt-2 text-muted-foreground">
                                  {formatCurrency(transaction.amount)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Switch
                                checked={transaction.is_active}
                                onCheckedChange={() =>
                                  toggleActive(transaction.id, transaction.is_active)
                                }
                              />
                              <Link href={`/recurring-transactions/${transaction.id}/edit`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        router.delete(`/recurring-transactions/${transaction.id}`)
                                      }
                                      className="bg-destructive hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
