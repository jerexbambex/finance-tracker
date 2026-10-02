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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Download,
  Copy,
  SlidersHorizontal,
  Activity,
  Layers,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

import { KravioCard } from '@/components/dashboard/KravioCard';
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
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

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

export default function Index({ transactions, accounts = [], categories = [], chartData }: Props) {
  const page = usePage();
  const { flash } = page.props as { flash?: { success?: string } };
  const queryParams = new URLSearchParams(page.url.split('?')[1] ?? '');

  const [showSuccess, setShowSuccess] = useState(!!flash?.success);
  const [searchQuery, setSearchQuery] = useState(queryParams.get('search') || '');
  const [filterType, setFilterType] = useState<string>(queryParams.get('type') || 'all');
  const [selectedCategory, setSelectedCategory] = useState<string>(queryParams.get('category_id') || 'all');
  const [selectedAccount, setSelectedAccount] = useState<string>(queryParams.get('account_id') || 'all');
  const [dateFrom, setDateFrom] = useState(queryParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(queryParams.get('date_to') || '');
  const [amountMin, setAmountMin] = useState(queryParams.get('amount_min') || '');
  const [amountMax, setAmountMax] = useState(queryParams.get('amount_max') || '');

  const [sortColumn, setSortColumn] = useState<'id' | 'description' | 'type' | 'account' | 'category' | 'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [chartPeriod, setChartPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [chartCurrency, setChartCurrency] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategoryId, setBulkCategoryId] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Export state
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterType !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    if (selectedAccount !== 'all') count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (amountMin) count++;
    if (amountMax) count++;
    return count;
  }, [filterType, selectedCategory, selectedAccount, dateFrom, dateTo, amountMin, amountMax]);

  useEffect(() => {
    if (flash?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [flash]);

  // Apply server-side filters
  const applyFiltersToServer = (newParams?: Record<string, string>) => {
    const params: Record<string, string> = {
      ...(searchQuery ? { search: searchQuery } : {}),
      ...(filterType !== 'all' ? { type: filterType } : {}),
      ...(selectedCategory !== 'all' ? { category_id: selectedCategory } : {}),
      ...(selectedAccount !== 'all' ? { account_id: selectedAccount } : {}),
      ...(dateFrom ? { date_from: dateFrom } : {}),
      ...(dateTo ? { date_to: dateTo } : {}),
      ...(amountMin ? { amount_min: amountMin } : {}),
      ...(amountMax ? { amount_max: amountMax } : {}),
      ...newParams,
    };

    router.get('/transactions', params, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

  const handleResetFilters = () => {
    setFilterType('all');
    setSelectedCategory('all');
    setSelectedAccount('all');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
    setSearchQuery('');
    router.get('/transactions', {}, { preserveState: true, preserveScroll: true, replace: true });
    setIsFilterOpen(false);
  };

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

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

  const formatDate = (date: string) => {
    return new Date(date).toISOString().slice(0, 10);
  };

  // Totals calculation
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

  // Chart data
  const rawChartData = chartData?.[chartPeriod] || [];
  const chartCurrencies = [
    ...new Set(
      rawChartData.flatMap((d) => [...Object.keys(d.income), ...Object.keys(d.expense)])
    ),
  ];
  const activeCurrency =
    chartCurrency && chartCurrencies.includes(chartCurrency)
      ? chartCurrency
      : chartCurrencies[0] ?? (transactions.data[0]?.account?.currency || 'USD');

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

  // Filtered & Sorted Transactions for current page view
  const processedTransactions = useMemo(() => {
    return [...transactions.data].sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'account':
          comparison = a.account.name.localeCompare(b.account.name);
          break;
        case 'category':
          comparison = (a.category?.name || '').localeCompare(b.category?.name || '');
          break;
        case 'date':
          comparison = new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
      }
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [transactions.data, sortColumn, sortDirection]);

  return (
    <AppLayout>
      <Head title="Transactions Ledger" />

      <div className="py-6 sm:py-8 space-y-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {showSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl p-4 flex items-center gap-3 animate-rise">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{flash?.success}</p>
            </div>
          )}

          {/* Top Page Header (Kravio Header) */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Transactions</h1>
                <span className="flex h-5 items-center justify-center rounded-full bg-secondary px-2.5 text-[11px] font-mono font-semibold text-secondary-foreground border border-border/60">
                  {transactions.total} records
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Comprehensive financial ledger, transaction tracking, and cash flow monitoring.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Export Modal Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8.5 gap-1.5 rounded-xl text-xs font-medium border-border/70 hover:bg-muted/50 shadow-xs">
                    <Download className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Export</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-2xl">
                  <DialogHeader>
                    <DialogTitle className="tracking-tight">Export Transactions</DialogTitle>
                    <DialogDescription className="text-xs">
                      Choose a date range preset, then download a CSV spreadsheet or formatted PDF statement.
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
                        <Input id="export_from" type="date" value={exportFrom} max={exportTo || undefined} onChange={(e) => setExportFrom(e.target.value)} className="h-9 rounded-xl text-xs font-mono" />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="export_to" className="text-xs font-medium text-muted-foreground">To</label>
                        <Input id="export_to" type="date" value={exportTo} min={exportFrom || undefined} onChange={(e) => setExportTo(e.target.value)} className="h-9 rounded-xl text-xs font-mono" />
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {exportFrom || exportTo ? 'Custom date range active.' : 'Full archive will be exported.'}
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
                <Button variant="outline" size="sm" className="h-8.5 gap-1.5 rounded-xl text-xs font-medium border-border/70 hover:bg-muted/50 shadow-xs">
                  <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Import CSV</span>
                </Button>
              </Link>

              <Link href="/transactions/create">
                <Button size="sm" className="h-8.5 gap-1.5 rounded-xl text-xs font-semibold shadow-xs hover:opacity-95">
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Transaction</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Top KPI Metrics Cards */}
          {transactions.data.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KravioKPICard
                title={`Total Income (${activeCurrency})`}
                value={formatCurrency(incomeByCurrency[activeCurrency] ?? 0, activeCurrency)}
                delta={{
                  value: 'Inbound',
                  isPositive: true,
                  label: 'across filtered ledger',
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
                  label: 'net balance movement',
                }}
                icon={Wallet}
                iconColorClass={(netByCurrency[activeCurrency] ?? 0) >= 0 ? "text-emerald-600 bg-emerald-500/10" : "text-rose-600 bg-rose-500/10"}
                index={2}
              />
            </div>
          )}

          {/* Income vs Expenses Area Chart */}
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
                <ChartContainer config={chartConfig} className="h-[240px] sm:h-[280px] w-full">
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
                <div className="flex items-center justify-center h-[240px] text-xs text-muted-foreground">
                  No chart data available for this period.
                </div>
              )}
            </KravioCard>
          )}

          {/* Kravio Transactions Table Card */}
          <KravioCard pattern innerClassName="p-0 overflow-hidden" className="w-full">
            {/* Kravio Header Control Toolbar (1:1 with Kravio reference) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:px-6 border-b border-border/60 bg-card">
              {/* Left Title with Kravio Section Icon */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
                    Transactions Monitoring
                  </h2>
                </div>
              </div>

              {/* Right Toolbar Controls: Search, Filter Popover, Actions */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Compact Search Field */}
                <div className="relative flex-1 sm:w-56">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') applyFiltersToServer();
                    }}
                    placeholder="Search transactions..."
                    className="h-8.5 w-full rounded-xl border border-border/70 bg-muted/20 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        applyFiltersToServer({ search: '' });
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Kravio Filter Popover Button */}
                <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-8.5 gap-1.5 rounded-xl text-xs font-medium border-border/70 hover:bg-muted/50 shadow-xs transition-colors',
                        activeFilterCount > 0 && 'border-primary/50 bg-primary/5 text-primary'
                      )}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                      {activeFilterCount > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {activeFilterCount}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent align="end" className="w-80 p-4 space-y-4 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Filters
                      </span>
                      {activeFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="text-[11px] font-medium text-rose-500 hover:underline"
                        >
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Type Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium uppercase text-muted-foreground">
                        Transaction Type
                      </label>
                      <div className="grid grid-cols-3 gap-1 rounded-lg border border-border/70 bg-muted/30 p-0.5 text-xs">
                        {(['all', 'income', 'expense'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFilterType(type)}
                            className={cn(
                              'rounded-md py-1 text-xs font-medium capitalize transition-all',
                              filterType === type
                                ? 'bg-background text-foreground shadow-xs font-semibold'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium uppercase text-muted-foreground">
                        Category
                      </label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-8.5 rounded-xl text-xs bg-muted/20 border-border/70">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Account Filter */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium uppercase text-muted-foreground">
                        Account
                      </label>
                      <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                        <SelectTrigger className="h-8.5 rounded-xl text-xs bg-muted/20 border-border/70">
                          <SelectValue placeholder="All Accounts" />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          <SelectItem value="all">All Accounts</SelectItem>
                          {accounts.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium uppercase text-muted-foreground">
                        Date Range
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="h-8.5 rounded-xl text-xs font-mono bg-muted/20 border-border/70"
                        />
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="h-8.5 rounded-xl text-xs font-mono bg-muted/20 border-border/70"
                        />
                      </div>
                    </div>

                    {/* Amount Range */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium uppercase text-muted-foreground">
                        Amount Range ($)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={amountMin}
                          onChange={(e) => setAmountMin(e.target.value)}
                          className="h-8.5 rounded-xl text-xs font-mono bg-muted/20 border-border/70"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={amountMax}
                          onChange={(e) => setAmountMax(e.target.value)}
                          className="h-8.5 rounded-xl text-xs font-mono bg-muted/20 border-border/70"
                        />
                      </div>
                    </div>

                    {/* Apply Button */}
                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/60">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-xl text-xs text-muted-foreground"
                        onClick={handleResetFilters}
                      >
                        Reset
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="h-8 rounded-xl text-xs font-semibold px-4"
                        onClick={() => {
                          applyFiltersToServer();
                          setIsFilterOpen(false);
                        }}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Kravio Top Table More Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8.5 w-8.5 rounded-xl border-border/70 hover:bg-muted/50 text-muted-foreground hover:text-foreground shadow-xs"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 text-xs rounded-xl">
                    <DropdownMenuLabel className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
                      Ledger Actions
                    </DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <a href={`/export/transactions?${exportRangeQuery()}`} className="cursor-pointer">
                        <Download className="h-3.5 w-3.5 mr-2" />
                        Export to CSV
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={`/export/statement?${exportRangeQuery()}`} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        <FileText className="h-3.5 w-3.5 mr-2" />
                        Generate PDF Statement
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/import/transactions" className="cursor-pointer">
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        Import CSV File
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={toggleAll} className="cursor-pointer">
                      <Layers className="h-3.5 w-3.5 mr-2" />
                      {selectedIds.length === transactions.data.length ? 'Deselect All' : 'Select All on Page'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Bulk Selection Actions Bar */}
            {selectedIds.length > 0 && (
              <div className="px-4 sm:px-6 py-2.5 bg-primary/5 border-b border-primary/20 flex flex-wrap items-center gap-3 animate-rise">
                <span className="text-xs font-medium text-foreground">
                  <span className="font-mono font-bold text-primary">{selectedIds.length}</span> transaction{selectedIds.length !== 1 ? 's' : ''} selected
                </span>

                <div className="flex items-center gap-2">
                  <Select value={bulkCategoryId} onValueChange={setBulkCategoryId}>
                    <SelectTrigger className="w-36 sm:w-44 h-7 rounded-lg text-xs bg-background">
                      <SelectValue placeholder="Categorize as..." />
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

            {/* Transactions Data Table (Kravio 1:1 Schema) */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/20 text-[11px] font-medium text-muted-foreground">
                    <th className="w-10 px-4 sm:px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === transactions.data.length && transactions.data.length > 0}
                        onChange={toggleAll}
                        className="h-3.5 w-3.5 rounded border-border/80 text-primary focus:ring-primary/40 cursor-pointer"
                      />
                    </th>

                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSort('id')}
                        className="inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors group select-none"
                      >
                        <span>Ticket ID</span>
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 group-hover:text-foreground" />
                      </button>
                    </th>

                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSort('description')}
                        className="inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors group select-none"
                      >
                        <span>Subject</span>
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 group-hover:text-foreground" />
                      </button>
                    </th>

                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSort('type')}
                        className="inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors group select-none"
                      >
                        <span>Priority</span>
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 group-hover:text-foreground" />
                      </button>
                    </th>

                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSort('account')}
                        className="inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors group select-none"
                      >
                        <span>Assigned To</span>
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 group-hover:text-foreground" />
                      </button>
                    </th>

                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSort('category')}
                        className="inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors group select-none"
                      >
                        <span>Status</span>
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 group-hover:text-foreground" />
                      </button>
                    </th>

                    <th className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleSort('date')}
                        className="inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors group select-none"
                      >
                        <span>Created Date</span>
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 group-hover:text-foreground" />
                      </button>
                    </th>

                    <th className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleSort('amount')}
                        className="inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors group select-none ml-auto"
                      >
                        <span>Amount</span>
                        <ArrowUpDown className="h-3 w-3 text-muted-foreground/50 group-hover:text-foreground" />
                      </button>
                    </th>

                    <th className="w-12 px-3 py-3 text-center"></th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/40">
                  {processedTransactions.length > 0 ? (
                    processedTransactions.map((tx) => {
                      const isIncome = tx.type === 'income';
                      const isTransfer = tx.type === 'transfer';
                      const isSelected = selectedIds.includes(tx.id);
                      const displayId = tx.id.length > 5 ? tx.id.slice(-4) : tx.id;

                      return (
                        <tr
                          key={tx.id}
                          className={cn(
                            'group transition-colors hover:bg-muted/40 cursor-pointer',
                            isSelected && 'bg-primary/5'
                          )}
                          onClick={() => router.visit(`/transactions/${tx.id}`)}
                        >
                          {/* Checkbox */}
                          <td className="px-4 sm:px-6 py-3.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelection(tx.id)}
                              className="h-3.5 w-3.5 rounded border-border/80 text-primary focus:ring-primary/40 cursor-pointer"
                            />
                          </td>

                          {/* Ticket ID (#2319 font-mono) */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-mono text-xs text-muted-foreground/90">
                              #{displayId}
                            </span>
                          </td>

                          {/* Subject / Description */}
                          <td className="px-4 py-3.5">
                            <div className="min-w-0 max-w-xs sm:max-w-md">
                              <p className="font-medium text-xs sm:text-sm text-foreground truncate tracking-tight">
                                {tx.description}
                              </p>
                              {tx.splits && tx.splits.length > 0 && (
                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                  Split across {tx.splits.length} categories
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Priority / Type with 3 Signal Bars (Kravio 1:1) */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {isIncome ? (
                              <div className="inline-flex items-center gap-1.5">
                                <div className="flex items-end gap-0.5 h-3">
                                  <span className="w-0.5 h-1.5 bg-emerald-500 rounded-full" />
                                  <span className="w-0.5 h-2.5 bg-emerald-500 rounded-full" />
                                  <span className="w-0.5 h-3.5 bg-emerald-500 rounded-full" />
                                </div>
                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                  High
                                </span>
                              </div>
                            ) : isTransfer ? (
                              <div className="inline-flex items-center gap-1.5">
                                <div className="flex items-end gap-0.5 h-3">
                                  <span className="w-0.5 h-1.5 bg-blue-500 rounded-full" />
                                  <span className="w-0.5 h-2.5 bg-blue-500 rounded-full" />
                                  <span className="w-0.5 h-3.5 bg-blue-500/40 rounded-full" />
                                </div>
                                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                  Medium
                                </span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <div className="flex items-end gap-0.5 h-3">
                                  <span className="w-0.5 h-1.5 bg-rose-500 rounded-full" />
                                  <span className="w-0.5 h-2.5 bg-rose-500 rounded-full" />
                                  <span className="w-0.5 h-3.5 bg-rose-500 rounded-full" />
                                </div>
                                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                                  Expense
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Assigned To / Account (with circular avatar) */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-muted/80 border border-border/70 flex items-center justify-center flex-shrink-0 text-muted-foreground">
                                <Wallet className="w-2.5 h-2.5" />
                              </div>
                              <span className="text-xs text-foreground/80 font-normal truncate max-w-[120px]">
                                {tx.account.name}
                              </span>
                            </div>
                          </td>

                          {/* Status / Category (with colored dot / status pill) */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            {tx.splits && tx.splits.length > 0 ? (
                              <span className="inline-flex items-center text-[11px] font-mono px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/50">
                                Split ({tx.splits.length})
                              </span>
                            ) : tx.category?.name ? (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{
                                    backgroundColor: tx.category.color || '#94a3b8',
                                  }}
                                />
                                <span className="text-xs text-foreground/90 font-medium truncate max-w-[130px]">
                                  {tx.category.name}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>

                          {/* Created Date (YYYY-MM-DD font-mono) */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-mono text-xs text-muted-foreground">
                              {formatDate(tx.transaction_date)}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="px-4 py-3.5 text-right whitespace-nowrap">
                            <span
                              className={cn(
                                'font-mono font-semibold tabular-nums text-xs sm:text-sm',
                                isIncome
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-foreground'
                              )}
                            >
                              {isIncome ? '+ ' : '- '}
                              {formatCurrency(tx.amount, tx.account.currency)}
                            </span>
                          </td>

                          {/* Row Actions Menu ⋮ (1:1 with Kravio Row Popover) */}
                          <td className="px-3 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                >
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 text-xs rounded-xl shadow-lg">
                                <DropdownMenuLabel className="font-mono text-[11px] text-muted-foreground">
                                  #{displayId}
                                </DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/transactions/${tx.id}`} className="cursor-pointer">
                                    <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/transactions/${tx.id}/edit`} className="cursor-pointer">
                                    <Pencil className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Edit Transaction
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/transactions/create?duplicate_id=${tx.id}`} className="cursor-pointer">
                                    <Copy className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Duplicate Entry
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    if (confirm('Delete this transaction?')) {
                                      router.delete(`/transactions/${tx.id}`);
                                    }
                                  }}
                                  className="text-rose-600 dark:text-rose-400 focus:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground">
                        <FileText className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-xs font-semibold text-foreground">No transactions found</p>
                        <p className="text-[11px] mt-0.5">Try adjusting your search terms or filter criteria.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Table Footer (Kravio Pagination 1:1) */}
            {transactions.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:px-6 border-t border-border/60 bg-muted/10">
                <div className="text-xs text-muted-foreground font-mono">
                  {transactions.from !== null && transactions.to !== null
                    ? `Showing ${transactions.from} to ${transactions.to} of ${transactions.total} transactions`
                    : `${transactions.total} transactions total`}
                </div>
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {transactions.links.map((link, i) =>
                    link.url ? (
                      <Link
                        key={i}
                        href={link.url}
                        className={cn(
                          'px-2.5 py-1 text-xs font-medium rounded-lg border transition-all',
                          link.active
                            ? 'bg-foreground text-background border-foreground font-semibold shadow-xs'
                            : 'bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border/70'
                        )}
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
        </div>
      </div>
    </AppLayout>
  );
}
