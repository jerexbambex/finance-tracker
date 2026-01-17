import { Head, useForm, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Wallet, CreditCard, TrendingUp, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  is_active: boolean;
  description?: string;
}

interface Props {
  accounts: Account[];
  currencies?: Array<{ value: string; label: string; symbol: string }>;
}

export default function Index({ accounts, currencies = [] }: Props) {
  const { flash } = usePage().props as any;
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (flash?.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
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
    balance: '',
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
      balance: account.balance.toString(),
      currency: account.currency,
      description: account.description || '',
    });
    setEditOpen(true);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const getAccountTypeLabel = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeAccounts = accounts.filter(acc => acc.is_active).length;
  const accountsByType = accounts.reduce((acc: any, account) => {
    acc[account.type] = (acc[account.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <AppLayout>
      <Head title="Accounts" />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {showSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800">{flash.success}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Accounts</h1>
            <div className="flex gap-2">
              <Link href="/transfers/create">
                <Button variant="outline">Transfer</Button>
              </Link>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button>Add Account</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Account</DialogTitle>
                  </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <Label htmlFor="create-name">Account Name</Label>
                    <Input
                      id="create-name"
                      value={createForm.data.name}
                      onChange={(e) => createForm.setData('name', e.target.value)}
                      placeholder="e.g., Main Checking"
                    />
                    {createForm.errors.name && <p className="text-red-500 text-sm mt-1">{createForm.errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="create-type">Account Type</Label>
                    <Select value={createForm.data.type} onValueChange={(value) => createForm.setData('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {createForm.errors.type && <p className="text-red-500 text-sm mt-1">{createForm.errors.type}</p>}
                  </div>
                  <div>
                    <Label htmlFor="create-balance">Initial Balance</Label>
                    <Input
                      id="create-balance"
                      type="number"
                      step="0.01"
                      value={createForm.data.balance}
                      onChange={(e) => createForm.setData('balance', e.target.value)}
                      placeholder="0.00"
                    />
                    {createForm.errors.balance && <p className="text-red-500 text-sm mt-1">{createForm.errors.balance}</p>}
                  </div>
                  <div>
                    <Label htmlFor="create-currency">Currency</Label>
                    <Select value={createForm.data.currency} onValueChange={(value) => createForm.setData('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.symbol} {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="create-description">Description (Optional)</Label>
                    <Textarea
                      id="create-description"
                      value={createForm.data.description}
                      onChange={(e) => createForm.setData('description', e.target.value)}
                      placeholder="Additional notes"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createForm.processing}>
                      {createForm.processing ? 'Creating...' : 'Create Account'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
              </Dialog>
            </div>
          </div>

          {accounts.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Total Balance</div>
                      <div className="text-2xl font-bold mt-2">{formatCurrency(totalBalance)}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Active Accounts</div>
                      <div className="text-2xl font-bold mt-2">{activeAccounts}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Account Types</div>
                      <div className="text-2xl font-bold mt-2">{Object.keys(accountsByType).length}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{account.name}</CardTitle>
                    <Badge variant={account.is_active ? 'default' : 'secondary'}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {getAccountTypeLabel(account.type)}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {formatCurrency(account.balance, account.currency)}
                    </div>
                    {account.description && (
                      <p className="text-sm text-gray-500">{account.description}</p>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => openEditModal(account)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {accounts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No accounts found</p>
              <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogTrigger asChild>
                  <Button>Create Your First Account</Button>
                </DialogTrigger>
              </Dialog>
            </div>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Account Name</Label>
              <Input
                id="edit-name"
                value={editForm.data.name}
                onChange={(e) => editForm.setData('name', e.target.value)}
              />
              {editForm.errors.name && <p className="text-red-500 text-sm mt-1">{editForm.errors.name}</p>}
            </div>
            <div>
              <Label htmlFor="edit-type">Account Type</Label>
              <Select value={editForm.data.type} onValueChange={(value) => editForm.setData('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {editForm.errors.type && <p className="text-red-500 text-sm mt-1">{editForm.errors.type}</p>}
            </div>
            <div>
              <Label htmlFor="edit-balance">Balance</Label>
              <Input
                id="edit-balance"
                type="number"
                step="0.01"
                value={editForm.data.balance}
                onChange={(e) => editForm.setData('balance', e.target.value)}
              />
              {editForm.errors.balance && <p className="text-red-500 text-sm mt-1">{editForm.errors.balance}</p>}
            </div>
            <div>
              <Label htmlFor="edit-currency">Currency</Label>
              <Select value={editForm.data.currency} onValueChange={(value) => editForm.setData('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={editForm.data.description}
                onChange={(e) => editForm.setData('description', e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editForm.processing}>
                {editForm.processing ? 'Updating...' : 'Update Account'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
