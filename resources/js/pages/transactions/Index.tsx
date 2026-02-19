import { Head, Link, router, usePage } from '@inertiajs/react';
import { TrendingUp, TrendingDown, Wallet, Pencil, Trash2, MoreVertical, Eye, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';


interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  account: { id: string; name: string };
  category?: { id: string; name: string; color?: string };
  splits?: Array<{ id: string; category: { name: string }; amount: number }>;
}

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  transactions: { data: Transaction[] };
  accounts: Account[];
  categories: Category[];
  chartData: {
    daily: Array<{ period: string; income: number; expense: number }>;
    monthly: Array<{ period: string; income: number; expense: number }>;
    yearly: Array<{ period: string; income: number; expense: number }>;
  };
}

export default function Index({ transactions, categories, chartData }: Props) {
  const { flash } = usePage().props as { flash?: { success?: string } };
  const [showSuccess, setShowSuccess] = useState(!!flash?.success);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    if (flash?.success) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === transactions.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.data.map(t => t.id));
    }
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedIds.length} transactions?`)) return;
    
    router.post('/transactions/bulk-delete', { ids: selectedIds }, {
      onSuccess: () => setSelectedIds([])
    });
  };

  const handleBulkCategorize = () => {
    if (!bulkCategoryId) return;
    
    router.post('/transactions/bulk-categorize', { 
      ids: selectedIds, 
      category_id: bulkCategoryId 
    }, {
      onSuccess: () => {
        setSelectedIds([]);
        setBulkCategoryId('');
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate totals
  const totalIncome = transactions.data
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions.data
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netAmount = totalIncome - totalExpense;

  // Get current chart data based on selected period and date filters
  let currentChartData = chartData?.[chartPeriod] || [];
  
  // If date filters are applied, recalculate chart data from filtered transactions
  if (dateFrom || dateTo) {
    const filteredForChart = transactions.data.filter(t => {
      if (dateFrom && new Date(t.transaction_date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.transaction_date) > new Date(dateTo)) return false;
      return true;
    });
    
    // Group by period
    const grouped = filteredForChart.reduce((acc: Record<string, { period: string; income: number; expense: number }>, t) => {
      const date = new Date(t.transaction_date);
      let key = '';
      
      if (chartPeriod === 'daily') {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (chartPeriod === 'monthly') {
        key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short' });
      }
      
      if (!acc[key]) {
        acc[key] = { period: key, income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        acc[key].income += t.amount;
      } else {
        acc[key].expense += t.amount;
      }
      
      return acc;
    }, {});
    
    currentChartData = Object.values(grouped);
  }
  
  const chartLabel = chartPeriod === 'daily' ? 'Last 30 days' : chartPeriod === 'monthly' ? 'Last 6 months' : 'This year (12 months)';

  const chartConfig = {
    income: {
      label: "Income",
      color: "hsl(142, 76%, 36%)",
    },
    expense: {
      label: "Expenses",
      color: "hsl(0, 84%, 60%)",
    },
  } satisfies ChartConfig;

  // Filter transactions
  const filteredTransactions = transactions.data.filter(t => {
    // Type filter
    if (filterType !== 'all' && t.type !== filterType) return false;
    
    // Search filter
    if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    // Date range filter
    if (dateFrom && new Date(t.transaction_date) < new Date(dateFrom)) return false;
    if (dateTo && new Date(t.transaction_date) > new Date(dateTo)) return false;
    
    return true;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime();
    }
    return b.amount - a.amount;
  });

  // Paginate
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <AppLayout>
      <Head title="Transactions" />
      
      <div className="py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800">{flash?.success}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
            <div className="flex gap-2">
              <a href={`/export/transactions?${new URLSearchParams(window.location.search).toString()}`}>
                <Button variant="outline" size="sm" className="sm:size-default">
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">Export</span>
                </Button>
              </a>
              <Link href="/import/transactions">
                <Button variant="outline" size="sm" className="sm:size-default">
                  <span className="hidden sm:inline">Import CSV</span>
                  <span className="sm:hidden">Import</span>
                </Button>
              </Link>
              <Link href="/transactions/create">
                <Button size="sm" className="sm:size-default">
                  <span className="hidden sm:inline">New Transaction</span>
                  <span className="sm:hidden">New</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <Input
                    placeholder="Search description..."
                    defaultValue={new URLSearchParams(window.location.search).get('search') || ''}
                    onChange={(e) => {
                      const params = new URLSearchParams(window.location.search);
                      if (e.target.value) {
                        params.set('search', e.target.value);
                      } else {
                        params.delete('search');
                      }
                      router.get(`/transactions?${params.toString()}`, {}, { preserveState: true });
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">From Date</label>
                  <Input
                    type="date"
                    defaultValue={new URLSearchParams(window.location.search).get('date_from') || ''}
                    onChange={(e) => {
                      const params = new URLSearchParams(window.location.search);
                      if (e.target.value) {
                        params.set('date_from', e.target.value);
                      } else {
                        params.delete('date_from');
                      }
                      router.get(`/transactions?${params.toString()}`, {}, { preserveState: true });
                    }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">To Date</label>
                  <Input
                    type="date"
                    defaultValue={new URLSearchParams(window.location.search).get('date_to') || ''}
                    onChange={(e) => {
                      const params = new URLSearchParams(window.location.search);
                      if (e.target.value) {
                        params.set('date_to', e.target.value);
                      } else {
                        params.delete('date_to');
                      }
                      router.get(`/transactions?${params.toString()}`, {}, { preserveState: true });
                    }}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.get('/transactions')}
                  >
                    Clear Filters
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {transactions.data.length > 0 && (
            <>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Total Income</div>
                        <div className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalIncome)}</div>
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
                        <div className="text-sm font-medium text-muted-foreground">Total Expenses</div>
                        <div className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(totalExpense)}</div>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                        <TrendingDown className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Net</div>
                        <div className={`text-2xl font-bold mt-2 ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(netAmount)}
                        </div>
                      </div>
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${netAmount >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                        <Wallet className={`h-6 w-6 ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Income vs Expenses</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{chartLabel}</p>
                    </div>
                    <Select value={chartPeriod} onValueChange={(value) => setChartPeriod(value as 'daily' | 'monthly' | 'yearly')}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentChartData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <LineChart accessibilityLayer data={currentChartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis 
                          dataKey="period" 
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                        />
                        <YAxis 
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone"
                          dataKey="income" 
                          stroke="var(--color-income)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone"
                          dataKey="expense" 
                          stroke="var(--color-expense)"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                      No data available for this period
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {transactions.data.length > 0 ? (
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle>Recent Transactions</CardTitle>
                    <Link href="/transactions/create" className="hidden sm:block">
                      <Button>Add Transaction</Button>
                    </Link>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:max-w-xs"
                    />
                    <Input
                      type="date"
                      placeholder="From"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full sm:w-40"
                    />
                    <Input
                      type="date"
                      placeholder="To"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full sm:w-40"
                    />
                    <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'income' | 'expense')}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'amount')}>
                      <SelectTrigger className="w-full sm:w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date">By Date</SelectItem>
                        <SelectItem value="amount">By Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {selectedIds.length > 0 && (
                  <div className="p-4 bg-muted border-b flex items-center gap-4">
                    <span className="text-sm font-medium">{selectedIds.length} selected</span>
                    <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                      Delete
                    </Button>
                    <div className="flex items-center gap-2">
                      <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue placeholder="Change category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={handleBulkCategorize} disabled={!bulkCategoryId}>
                        Apply
                      </Button>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
                      Clear
                    </Button>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.length === transactions.data.length && transactions.data.length > 0}
                            onChange={toggleAll}
                            className="rounded"
                          />
                        </TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="hidden md:table-cell">Category</TableHead>
                        <TableHead className="hidden lg:table-cell">Account</TableHead>
                        <TableHead className="hidden sm:table-cell">Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right w-20"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTransactions.map((transaction) => (
                        <TableRow 
                          key={transaction.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => router.visit(`/transactions/${transaction.id}`)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(transaction.id)}
                              onChange={() => toggleSelection(transaction.id)}
                              className="rounded"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                                style={{
                                  backgroundColor: transaction.category?.color || '#6b7280',
                                }}
                              >
                                {transaction.type === 'income' ? '↑' : '↓'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground md:hidden">
                                {transaction.splits && transaction.splits.length > 0 
                                  ? `Split: ${transaction.splits.map(s => s.category.name).join(', ')}`
                                  : transaction.category?.name || 'Uncategorized'}
                                <span className="sm:hidden"> • {formatDate(transaction.transaction_date)}</span>
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {transaction.splits && transaction.splits.length > 0 
                            ? <span className="text-xs">Split: {transaction.splits.map(s => s.category.name).join(', ')}</span>
                            : transaction.category?.name || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{transaction.account.name}</TableCell>
                        <TableCell className="hidden sm:table-cell">{formatDate(transaction.transaction_date)}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold text-sm sm:text-base ${
                              transaction.type === 'income'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/transactions/${transaction.id}`} className="cursor-pointer">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/transactions/${transaction.id}/edit`} className="cursor-pointer">
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this transaction?')) {
                                    router.delete(`/transactions/${transaction.id}`);
                                  }
                                }}
                                className="text-destructive focus:text-destructive cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
                
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-4 sm:px-0">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedTransactions.length)} of {sortedTransactions.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-xs sm:text-sm">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">No transactions found</p>
                <Link href="/transactions/create">
                  <Button>Add Your First Transaction</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
