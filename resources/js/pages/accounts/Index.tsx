import { Head, useForm, Link, router, usePage } from '@inertiajs/react';
import { Wallet, CreditCard, TrendingUp, CheckCircle, Plus, Landmark, Building2, ArrowUpRight, ArrowDownRight, Layers, ArrowLeftRight } from 'lucide-react';
import { useState, useEffect } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';
import { KravioCard } from '@/components/dashboard/KravioCard';
import { KravioKPICard } from '@/components/dashboard/KravioKPICard';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  is_active: boolean;
  description?: string;
  transactions_count: number;
}

interface Props {
  accounts: Account[];
  currencies?: Array<{ value: string; label: string; symbol: string }>;
}

export default function Index({ accounts, currencies = [] }: Props) {
  const { flash } = usePage().props as { flash?: { success?: string } };
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState<Account | null>(null);
  const [showSuccess, setShowSuccess] = useState(!!flash?.success);

  useEffect(() => {
    if (flash?.success) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [flash]);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const createForm = useForm({
    name: '',
    type: '',
    balance: '',
    currency: 'USD',
    description: '',
  });

  const editForm = useForm({
    name: '',
    type: '',
    currency: 'USD',
    description: '',
  });

  const accountTypes = [
    { value: 'checking', label: 'Checking Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'investment', label: 'Investment Account' },
    { value: 'cash', label: 'Cash' },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createForm.post('/accounts', {
      onSuccess: () => {
        setCreateOpen(false);
        createForm.reset();
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      editForm.put(`/accounts/${editingAccount.id}`, {
        onSuccess: () => {
          setEditOpen(false);
          setEditingAccount(null);
          editForm.reset();
        },
      });
    }
  };

  const openEditModal = (account: Account) => {
    setEditingAccount(account);
    editForm.setData({
      name: account.name,
      type: account.type,
      currency: account.currency,
      description: account.description || '',
    });
    setEditOpen(true);
  };

  const getAccountTypeLabel = (type: string) => {
    const found = accountTypes.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit_card':
      case 'credit':
        return CreditCard;
      case 'bank':
      case 'checking':
      case 'savings':
        return Landmark;
      case 'investment':
        return Building2;
      default:
        return Wallet;
    }
  };

  // Calculate totals per currency
  const balancesByCurrency = accounts.reduce<Record<string, number>>((acc, a) => ({
    ...acc,
    [a.currency]: (acc[a.currency] ?? 0) + a.balance,
  }), {});

  const activeAccounts = accounts.filter((a) => a.is_active).length;
  const accountsByType = accounts.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppLayout>
      <Head title="Accounts" />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {showSuccess && (
          <div className="animate-rise rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <p className="font-medium">{flash?.success}</p>
          </div>
        )}

        {/* ── Kravio Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-rise">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Accounts & Wallets</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage all connected bank accounts, credit cards, and digital wallets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/transfers/create">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <ArrowLeftRight className="mr-1.5 h-3.5 w-3.5" />
                Transfer
              </Button>
            </Link>

            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 text-xs font-semibold">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>Create New Account</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="create-name" className="text-xs font-semibold">Account Name</Label>
                    <Input
                      id="create-name"
                      value={createForm.data.name}
                      onChange={(e) => createForm.setData('name', e.target.value)}
                      placeholder="e.g., Main Checking"
                      className="h-9 text-xs"
                    />
                    {createForm.errors.name && <p className="text-destructive text-xs">{createForm.errors.name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="create-type" className="text-xs font-semibold">Account Type</Label>
                    <Select value={createForm.data.type} onValueChange={(value) => createForm.setData('type', value)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-xs">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {createForm.errors.type && <p className="text-destructive text-xs">{createForm.errors.type}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="create-balance" className="text-xs font-semibold">Initial Balance</Label>
                      <Input
                        id="create-balance"
                        type="number"
                        step="0.01"
                        value={createForm.data.balance}
                        onChange={(e) => createForm.setData('balance', e.target.value)}
                        placeholder="0.00"
                        className="h-9 text-xs font-mono"
                      />
                      {createForm.errors.balance && <p className="text-destructive text-xs">{createForm.errors.balance}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="create-currency" className="text-xs font-semibold">Currency</Label>
                      <Select value={createForm.data.currency} onValueChange={(value) => createForm.setData('currency', value)}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value} className="text-xs">
                              {currency.symbol} {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="create-description" className="text-xs font-semibold">Description (Optional)</Label>
                    <Textarea
                      id="create-description"
                      value={createForm.data.description}
                      onChange={(e) => createForm.setData('description', e.target.value)}
                      placeholder="Additional notes"
                      rows={2}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={createForm.processing}>
                      {createForm.processing ? 'Creating...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* ── Kravio KPI Metric Strip ──────────────────────────────────── */}
        {accounts.length > 0 && (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            <KravioKPICard
              index={0}
              title="Combined Balance"
              value={Object.entries(balancesByCurrency).map(([c, a]) => formatCurrency(a, c)).join(', ') || '$0.00'}
              icon={Wallet}
              iconColorClass="bg-primary/10 text-primary"
              subtitle="Sum across active currencies"
            />
            <KravioKPICard
              index={1}
              title="Active Accounts"
              value={activeAccounts.toString()}
              icon={TrendingUp}
              iconColorClass="bg-emerald-500/10 text-emerald-600"
              subtitle={`${accounts.length - activeAccounts} inactive`}
            />
            <KravioKPICard
              index={2}
              title="Account Types"
              value={Object.keys(accountsByType).length.toString()}
              icon={CreditCard}
              iconColorClass="bg-purple-500/10 text-purple-600"
              subtitle="Checking, Savings, Credit, etc."
            />
          </div>
        )}

        {/* ── Kravio Account Cards Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account, idx) => {
            const Icon = getAccountIcon(account.type);
            const isOverdrawn = account.balance < 0;

            return (
              <KravioCard
                key={account.id}
                pattern
                className="group/acc animate-rise transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                innerClassName="p-4 sm:p-5 flex flex-col justify-between h-full bg-gradient-to-br from-card to-muted/20"
                style={{ animationDelay: `${100 + idx * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover/acc:bg-primary group-hover/acc:text-primary-foreground transition-colors shadow-2xs">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/accounts/${account.id}`} className="font-semibold text-sm text-foreground truncate hover:text-primary transition-colors block">
                        {account.name}
                      </Link>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {getAccountTypeLabel(account.type)}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={account.is_active ? 'default' : 'secondary'}
                    className="text-[10px] px-2 py-0 font-medium"
                  >
                    {account.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Balance</span>
                    <span className={`font-mono text-xl font-bold tracking-tight tabular-nums ${isOverdrawn ? 'text-rose-600' : 'text-foreground'}`}>
                      {formatCurrency(account.balance, account.currency)}
                    </span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {account.currency}
                  </Badge>
                </div>

                {account.description && (
                  <p className="mt-2 text-xs text-muted-foreground line-clamp-1">
                    {account.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/30 pt-3">
                  <span className="text-[11px] text-muted-foreground">
                    {account.transactions_count} transaction{account.transactions_count !== 1 ? 's' : ''}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => openEditModal(account)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => setDeleteAccount(account)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </KravioCard>
            );
          })}

          {/* Quick Create Card */}
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-muted/20 p-6 text-center transition-all duration-200 hover:border-primary/50 hover:bg-muted/40 group min-h-[180px]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border/70 text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-colors shadow-xs">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                Connect Another Account
              </p>
              <p className="text-[11px] text-muted-foreground">Bank, Credit Card, or Cash Wallet</p>
            </div>
          </button>
        </div>

        {accounts.length === 0 && (
          <KravioCard pattern className="text-center py-12">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No accounts linked yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Add your first account to start recording transactions, monitoring budgets, and tracking your net worth.
            </p>
            <div className="mt-4">
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create First Account
              </Button>
            </div>
          </KravioCard>
        )}
      </div>

      {/* Delete Modal */}
      <AlertDialog open={!!deleteAccount} onOpenChange={(open) => !open && setDeleteAccount(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteAccount?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this account
              {deleteAccount && deleteAccount.transactions_count > 0
                ? ` and its ${deleteAccount.transactions_count} transaction${deleteAccount.transactions_count === 1 ? '' : 's'}`
                : ''}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteAccount) {
                  router.delete(`/accounts/${deleteAccount.id}`, {
                    onSuccess: () => setDeleteAccount(null),
                  });
                }
              }}
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs font-semibold">Account Name</Label>
              <Input
                id="edit-name"
                value={editForm.data.name}
                onChange={(e) => editForm.setData('name', e.target.value)}
                className="h-9 text-xs"
              />
              {editForm.errors.name && <p className="text-destructive text-xs">{editForm.errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-type" className="text-xs font-semibold">Account Type</Label>
              <Select value={editForm.data.type} onValueChange={(value) => editForm.setData('type', value)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-xs">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editForm.errors.type && <p className="text-destructive text-xs">{editForm.errors.type}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-description" className="text-xs font-semibold">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={editForm.data.description}
                onChange={(e) => editForm.setData('description', e.target.value)}
                rows={2}
                className="text-xs"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={editForm.processing}>
                {editForm.processing ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
