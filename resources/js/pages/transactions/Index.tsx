import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Pencil,
  Trash2,
  MoreVertical,
  Eye,
  CheckCircle,
  FileText,
  Upload,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  X,
  Download,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

import { KravioCard, KravioCardPattern } from '@/components/dashboard/KravioCard';
import { KravioKPICard } from '@/components/dashboard/KravioKPICard';
import { Button } from '@/components/ui/button';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { formatCurrency } from '@/lib/formatCurrency';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  account: { id: string; name: string; currency: string };
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

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

interface Props {
  transactions: {
    data: Transaction[];
    links: PaginationLink[];
    from: number | null;
    to: number | null;
    total: number;
  };
  accounts: Account[];
  categories: Category[];
  chartData: {
    daily: Array<{ period: string; income: Record<string, number>; expense: Record<string, number> }>;
    monthly: Array<{ period: string; income: Record<string, number>; expense: Record<string, number> }>;
    yearly: Array<{ period: string; income: Record<string, number>; expense: Record<string, number> }>;
  };
}

export default function Index({ transactions, categories, chartData }: Props) {
  const page = usePage();
  const { flash } = page.props as { flash?: { success?: string } };
  const queryParams = new URLSearchParams(page.url.split('?')[1] ?? '');
  const [showSuccess, setShowSuccess] = useState(!!flash?.success);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [chartCurrency, setChartCurrency] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');

  const exportRangeQuery = () => {
    const params = new URLSearchParams();
    if (filterType !== 'all') params.set('type', filterType);
    if (searchQuery) params.set('search', searchQuery);
    if (exportFrom) params.set('date_from', exportFrom);
    if (exportTo) params.set('date_to', exportTo);
    return params.toString();
  };

  const applyExportPreset = (preset: 'this-month' | 'last-month' | 'this-year' | 'all') => {
    const now = new Date();
    const iso = (d: Date) => d.toLocaleDateString('en-CA');
    if (preset === 'all') {
      setExportFrom('');
      setExportTo('');
    } else if (preset === 'this-month') {
      setExportFrom(iso(new Date(now.getFullYear(), now.getMonth(), 1)));
      setExportTo(iso(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
    } else if (preset === 'last-month') {
      setExportFrom(iso(new Date(now.getFullYear(), now.getMonth() - 1, 1)));
      setExportTo(iso(new Date(now.getFullYear(), now.getMonth(), 0)));
    } else {
      setExportFrom(iso(new Date(now.getFullYear(), 0, 1)));
      setExportTo(iso(new Date(now.getFullYear(), 11, 31)));
    }
  };

  useEffect(() => {
    if (flash?.success) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === transactions.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.data.map((t) => t.id));
    }
  };

  const handleBulkDelete = () => {
    if (!confirm(`Delete ${selectedIds.length} transactions?`)) return;

    router.post(
      '/transactions/bulk-delete',
      { ids: selectedIds },
      {
        onSuccess: () => setSelectedIds([]),
      }
    );
  };

  const handleBulkCategorize = () => {
    if (!bulkCategoryId) return;

    router.post(
      '/transactions/bulk-categorize',
      {
        ids: selectedIds,
        category_id: bulkCategoryId,
      },
      {
        onSuccess: () => {
          setSelectedIds([]);
          setBulkCategoryId('');
        },
      }
    );
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

  // Calculate totals per currency
  const incomeByCurrency = transactions.data
    .filter((t) => t.type === 'income')
    .reduce<Record<string, number>>(
      (acc, t) => ({
        ...acc,
        [t.account.currency]: (acc[t.account.currency] ?? 0) + t.amount,
      }),
      {}
    );

  const expenseByCurrency = transactions.data
    .filter((t) => t.type === 'expense')
    .reduce<Record<string, number>>(
      (acc, t) => ({
        ...acc,
        [t.account.currency]: (acc[t.account.currency] ?? 0) + t.amount,
      }),
      {}
    );

  const netByCurrency = Object.keys({ ...incomeByCurrency, ...expenseByCurrency }).reduce<
    Record<string, number>
  >(
    (acc, currency) => ({
      ...acc,
      [currency]: (incomeByCurrency[currency] ?? 0) - (expenseByCurrency[currency] ?? 0),
    }),
    {}
  );

  // Get current chart data based on selected period and date filters
  let rawChartData = chartData?.[chartPeriod] || [];

  if (dateFrom || dateTo) {
    const filteredForChart = transactions.data.filter((t) => {
      if (dateFrom && new Date(t.transaction_date) < new Date(dateFrom)) return false;
      if (dateTo && new Date(t.transaction_date) > new Date(dateTo)) return false;
      return true;
    });

    const grouped = filteredForChart.reduce(
      (
        acc: Record<
          string,
          { period: string; income: Record<string, number>; expense: Record<string, number> }
        >,
        t
      ) => {
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
          acc[key] = { period: key, income: {}, expense: {} };
        }

        const currency = t.account.currency;
        if (t.type === 'income') {
          acc[key].income[currency] = (acc[key].income[currency] ?? 0) + t.amount;
        } else {
          acc[key].expense[currency] = (acc[key].expense[currency] ?? 0) + t.amount;
        }

        return acc;
      },
      {}
    );

    rawChartData = Object.values(grouped);
  }

  const chartCurrencies = [
    ...new Set(
      rawChartData.flatMap((d) => [...Object.keys(d.income), ...Object.keys(d.expense)])
    ),
  ];
  const activeCurrency =
    chartCurrency && chartCurrencies.includes(chartCurrency)
      ? chartCurrency
      : chartCurrencies[0] ?? 'USD';

  const currentChartData = rawChartData.map((d) => ({
    period: d.period,
    income: d.income[activeCurrency] ?? 0,
    expense: d.expense[activeCurrency] ?? 0,
  }));

  const chartLabel =
    chartPeriod === 'daily'
      ? 'Last 30 days'
      : chartPeriod === 'monthly'
      ? 'Last 6 months'
      : 'This year (12 months)';

  const chartConfig = {
    income: {
      label: 'Income',
      color: '#10b981',
    },
    expense: {
      label: 'Expenses',
      color: '#ef4444',
    },
  } satisfies ChartConfig;

  // Filter transactions
  const filteredTransactions = transactions.data.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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

  return (
    <AppLayout>
      <Head title="Transactions" />

      <div className="py-6 sm:py-8 space-y-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {showSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl p-4 flex items-center gap-3 animate-rise">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{flash?.success}</p>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Transactions</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-secondary text-secondary-foreground border border-border/60">
                  {transactions.total} records
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                View, filter, search, and manage all your cash movements and statements.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl text-xs font-medium border-border/70 hover:bg-muted/50">
                    <Download className="h-3.5 w-3.5" />
                    <span>Export</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="tracking-tight">Export Transactions</DialogTitle>
                    <DialogDescription className="text-xs">
                      Choose a date range, then download a CSV or a formatted PDF statement.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 pt-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Button type="button" variant="secondary" size="sm" className="text-xs h-7 rounded-lg" onClick={() => applyExportPreset('this-month')}>This Month</Button>
                      <Button type="button" variant="secondary" size="sm" className="text-xs h-7 rounded-lg" onClick={() => applyExportPreset('last-month')}>Last Month</Button>
                      <Button type="button" variant="secondary" size="sm" className="text-xs h-7 rounded-lg" onClick={() => applyExportPreset('this-year')}>This Year</Button>
                      <Button type="button" variant="secondary" size="sm" className="text-xs h-7 rounded-lg" onClick={() => applyExportPreset('all')}>All Time</Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label htmlFor="export_from" className="text-xs font-medium text-muted-foreground">From</label>
                        <Input id="export_from" type="date" value={exportFrom} max={exportTo || undefined} onChange={(e) => setExportFrom(e.target.value)} className="h-9 rounded-xl text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="export_to" className="text-xs font-medium text-muted-foreground">To</label>
                        <Input id="export_to" type="date" value={exportTo} min={exportFrom || undefined} onChange={(e) => setExportTo(e.target.value)} className="h-9 rounded-xl text-xs" />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {exportFrom || exportTo ? 'Custom range active.' : 'Full transaction archive will be exported.'}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <a href={`/export/transactions?${exportRangeQuery()}`} className="flex-1">
                        <Button variant="outline" className="w-full text-xs h-9 rounded-xl gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          Download CSV
                        </Button>
                      </a>
                      <a href={`/export/statement?${exportRangeQuery()}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button className="w-full text-xs h-9 rounded-xl gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          PDF Statement
                        </Button>
                      </a>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Link href="/import/transactions">
                <Button variant="outline" size="sm" className="h-9 gap-1.5 rounded-xl text-xs font-medium border-border/70 hover:bg-muted/50">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Import CSV</span>
                </Button>
              </Link>

              <Link href="/transactions/create">
                <Button size="sm" className="h-9 gap-1.5 rounded-xl text-xs font-medium shadow-sm hover:opacity-95">
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Transaction</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Top KPI Cards */}
          {transactions.data.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KravioKPICard
                title={`Total Income (${activeCurrency})`}
                value={formatCurrency(incomeByCurrency[activeCurrency] ?? 0, activeCurrency)}
                delta={{
                  value: 'Inbound',
                  isPositive: true,
                  label: 'across filtered transactions',
                }}
                icon={TrendingUp}
                iconColorClass="text-emerald-600 bg-emerald-500/10"
                index={0}
              />
              <KravioKPICard
                title={`Total Expenses (${activeCurrency})`}
                value={formatCurrency(expenseByCurrency[activeCurrency] ?? 0, activeCurrency)}
                delta={{
                  value: 'Outbound',
                  isPositive: false,
                  label: 'spend outflow',
                }}
                icon={TrendingDown}
                iconColorClass="text-rose-600 bg-rose-500/10"
                index={1}
              />
              <KravioKPICard
                title={`Net Volume (${activeCurrency})`}
                value={formatCurrency(netByCurrency[activeCurrency] ?? 0, activeCurrency)}
                delta={{
                  value: (netByCurrency[activeCurrency] ?? 0) >= 0 ? '+ Positive' : '- Deficit',
                  isPositive: (netByCurrency[activeCurrency] ?? 0) >= 0,
                  label: 'net ledger delta',
                }}
                icon={Wallet}
                iconColorClass={(netByCurrency[activeCurrency] ?? 0) >= 0 ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"}
                index={2}
              />
            </div>
          )}

          {/* Income vs Expenses Hero Chart */}
          {transactions.data.length > 0 && (
            <KravioCard className="p-5 sm:p-6" pattern>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-semibold tracking-tight">Income vs Expenses</h2>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-muted text-muted-foreground border border-border/50">
                      {chartLabel}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Visual comparison of incoming vs outgoing cash flow over time.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {chartCurrencies.length > 1 && (
                    <Select value={activeCurrency} onValueChange={setChartCurrency}>
                      <SelectTrigger className="w-24 h-8 rounded-xl text-xs font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {chartCurrencies.map((c) => (
                          <SelectItem key={c} value={c} className="text-xs font-mono">
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <div className="inline-flex rounded-xl p-0.5 bg-muted/60 border border-border/60">
                    {(['daily', 'monthly', 'yearly'] as const).map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setChartPeriod(period)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                          chartPeriod === period
                            ? 'bg-background text-foreground shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {currentChartData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[260px] sm:h-[300px] w-full">
                  <AreaChart accessibilityLayer data={currentChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="txFillIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="txFillExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/40" />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      className="text-[11px] fill-muted-foreground font-mono"
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatCurrency(value, activeCurrency)}
                      className="text-[11px] fill-muted-foreground font-mono"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#txFillIncome)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#10b981' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#txFillExpense)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#ef4444' }}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[260px] text-xs text-muted-foreground">
                  No chart data available for this period.
                </div>
              )}
            </KravioCard>
          )}

          {/* Filter Toolbar & Data Table */}
          {transactions.data.length > 0 ? (
            <KravioCard className="p-0 overflow-hidden" pattern>
              {/* Header & Filter Controls */}
              <div className="p-4 sm:p-6 border-b border-border/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold tracking-tight">Ledger Records</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Filter by keyword, date range, or transaction direction.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  <div className="relative lg:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 rounded-xl text-xs bg-background/80 border-border/70 focus-visible:ring-1"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-9 rounded-xl text-xs font-mono bg-background/80 border-border/70"
                    />
                    <span className="text-muted-foreground text-xs">to</span>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-9 rounded-xl text-xs font-mono bg-background/80 border-border/70"
                    />
                  </div>

                  <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'income' | 'expense')}>
                    <SelectTrigger className="h-9 rounded-xl text-xs bg-background/80 border-border/70">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">All Types</SelectItem>
                      <SelectItem value="income" className="text-xs">Income Only</SelectItem>
                      <SelectItem value="expense" className="text-xs">Expenses Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'amount')}>
                      <SelectTrigger className="h-9 rounded-xl text-xs bg-background/80 border-border/70 flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date" className="text-xs">By Date</SelectItem>
                        <SelectItem value="amount" className="text-xs">By Amount</SelectItem>
                      </SelectContent>
                    </Select>

                    {(searchQuery || dateFrom || dateTo || filterType !== 'all') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2.5 rounded-xl text-xs text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setSearchQuery('');
                          setDateFrom('');
                          setDateTo('');
                          setFilterType('all');
                        }}
                      >
                        Reset
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bulk Actions Banner */}
              {selectedIds.length > 0 && (
                <div className="px-4 sm:px-6 py-2.5 bg-primary/5 border-b border-primary/20 flex flex-wrap items-center gap-3 animate-rise">
                  <span className="text-xs font-medium text-foreground">
                    <span className="font-mono font-bold text-primary">{selectedIds.length}</span> selected
                  </span>

                  <div className="flex items-center gap-2">
                    <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                      <SelectTrigger className="w-40 h-7 rounded-lg text-xs bg-background">
                        <SelectValue placeholder="Categorize..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-xs">
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="h-7 text-xs rounded-lg px-2.5" onClick={handleBulkCategorize} disabled={!bulkCategoryId}>
                      Apply
                    </Button>
                  </div>

                  <Button size="sm" variant="destructive" className="h-7 text-xs rounded-lg px-2.5" onClick={handleBulkDelete}>
                    Delete
                  </Button>

                  <Button size="sm" variant="ghost" className="h-7 text-xs rounded-lg px-2.5 ml-auto text-muted-foreground" onClick={() => setSelectedIds([])}>
                    Clear selection
                  </Button>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border/60 bg-muted/20">
                      <TableHead className="w-10 pl-4 sm:pl-6">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === transactions.data.length && transactions.data.length > 0}
                          onChange={toggleAll}
                          className="rounded border-border/70 cursor-pointer"
                        />
                      </TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Description</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Account</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Date</TableHead>
                      <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Amount</TableHead>
                      <TableHead className="text-right w-16 pr-4 sm:pr-6"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTransactions.map((transaction) => {
                      const isExpense = transaction.type === 'expense';
                      return (
                        <TableRow
                          key={transaction.id}
                          className="cursor-pointer hover:bg-muted/40 transition-colors border-b border-border/40 group"
                          onClick={() => router.visit(`/transactions/${transaction.id}`)}
                        >
                          <TableCell className="pl-4 sm:pl-6" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(transaction.id)}
                              onChange={() => toggleSelection(transaction.id)}
                              className="rounded border-border/70 cursor-pointer"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
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
                              <div className="min-w-0">
                                <p className="font-medium text-xs sm:text-sm text-foreground truncate tracking-tight">
                                  {transaction.description}
                                </p>
                                <p className="text-[11px] text-muted-foreground md:hidden flex items-center gap-1.5 mt-0.5">
                                  <span>
                                    {transaction.splits && transaction.splits.length > 0
                                      ? `Split (${transaction.splits.length})`
                                      : transaction.category?.name || 'Uncategorized'}
                                  </span>
                                  <span>•</span>
                                  <span className="font-mono">{formatDate(transaction.transaction_date)}</span>
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {transaction.splits && transaction.splits.length > 0 ? (
                              <span className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/50">
                                Split: {transaction.splits.map((s) => s.category.name).join(', ')}
                              </span>
                            ) : transaction.category?.name ? (
                              <span
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border"
                                style={{
                                  backgroundColor: `${transaction.category.color || '#6b7280'}15`,
                                  borderColor: `${transaction.category.color || '#6b7280'}35`,
                                  color: transaction.category.color || 'inherit',
                                }}
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: transaction.category.color || '#6b7280' }}
                                />
                                {transaction.category.name}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground font-medium">
                              {transaction.account.name}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="text-xs font-mono text-muted-foreground">
                              {formatDate(transaction.transaction_date)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={`font-semibold font-mono tabular-nums text-xs sm:text-sm ${
                                isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {isExpense ? '-' : '+'}
                              {formatCurrency(transaction.amount, transaction.account.currency)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-4 sm:pr-6" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem asChild>
                                  <Link href={`/transactions/${transaction.id}`} className="cursor-pointer text-xs">
                                    <Eye className="h-3.5 w-3.5 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/transactions/${transaction.id}/edit`} className="cursor-pointer text-xs">
                                    <Pencil className="h-3.5 w-3.5 mr-2" />
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
                                  className="text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer text-xs"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {transactions.total > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:px-6 border-t border-border/60 bg-muted/10">
                  <div className="text-xs text-muted-foreground font-mono">
                    {transactions.from !== null && transactions.to !== null
                      ? `Showing ${transactions.from}–${transactions.to} of ${transactions.total}`
                      : `${transactions.total} total`}
                  </div>
                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {transactions.links.map((link, i) =>
                      link.url ? (
                        <Link
                          key={i}
                          href={link.url}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                            link.active
                              ? 'bg-foreground text-background border-foreground font-semibold shadow-xs'
                              : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/70'
                          }`}
                          preserveState
                          preserveScroll
                        >
                          <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Link>
                      ) : (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-xs rounded-lg border border-border/40 opacity-40 cursor-not-allowed text-muted-foreground"
                        >
                          <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </KravioCard>
          ) : (
            <KravioCard className="p-12 text-center" pattern>
              <div className="w-12 h-12 rounded-2xl bg-muted/80 border border-border/70 flex items-center justify-center mx-auto mb-3 text-muted-foreground">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold tracking-tight">No transactions found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                You have not recorded any transactions yet or your filters returned no matching results.
              </p>
              <Link href="/transactions/create">
                <Button size="sm" className="rounded-xl text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Add Your First Transaction
                </Button>
              </Link>
            </KravioCard>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

