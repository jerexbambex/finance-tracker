import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  account: { id: string; name: string };
  category?: { id: string; name: string; color?: string };
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

export default function Index({ transactions, accounts, categories, chartData }: Props) {
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const itemsPerPage = 10;

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
    const grouped = filteredForChart.reduce((acc: any, t) => {
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
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Transactions</h1>
            <div className="flex gap-2">
              <Link href="/import/transactions">
                <Button variant="outline">Import CSV</Button>
              </Link>
              <Link href="/transactions/create">
                <Button>New Transaction</Button>
              </Link>
            </div>
          </div>

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
                    <Select value={chartPeriod} onValueChange={(value: any) => setChartPeriod(value)}>
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
                      <BarChart accessibilityLayer data={currentChartData}>
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
                        <Bar 
                          dataKey="income" 
                          fill="var(--color-income)"
                          radius={4}
                        />
                        <Bar 
                          dataKey="expense" 
                          fill="var(--color-expense)"
                          radius={4}
                        />
                      </BarChart>
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
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Transactions</CardTitle>
                    <Link href="/transactions/create">
                      <Button>Add Transaction</Button>
                    </Link>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="max-w-xs"
                    />
                    <Input
                      type="date"
                      placeholder="From date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-40"
                    />
                    <Input
                      type="date"
                      placeholder="To date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-40"
                    />
                    <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-32">
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
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold flex-shrink-0"
                              style={{
                                backgroundColor: transaction.category?.color || '#6b7280',
                              }}
                            >
                              {transaction.type === 'income' ? '↑' : '↓'}
                            </div>
                            <span className="font-medium">{transaction.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.category?.name || '—'}</TableCell>
                        <TableCell>{transaction.account.name}</TableCell>
                        <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                        <TableCell className="text-right">
                          <span
                            className={`font-semibold ${
                              transaction.type === 'income'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/transactions/${transaction.id}/edit`}>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedTransactions.length)} of {sortedTransactions.length} transactions
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
                      <div className="text-sm">
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
