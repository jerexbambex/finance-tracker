import React, { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  Search,
  Download,
  ArrowUpDown,
  Plus,
  Wallet,
  MoreVertical,
  FileSpreadsheet,
  Activity,
  Filter,
  Eye,
  Pencil,
  Copy,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency as baseFmt } from '@/lib/formatCurrency';
import { KravioCard } from './KravioCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import QuickAddTransaction from '@/components/QuickAddTransaction';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  account: { name: string; currency: string };
  category?: { name: string; color?: string };
}

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface KravioTransactionsTableProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  primaryCurrency: string;
  className?: string;
}

export function KravioTransactionsTable({
  transactions,
  accounts,
  categories,
  primaryCurrency,
  className,
}: KravioTransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<'id' | 'description' | 'type' | 'account' | 'category' | 'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const formatCurrency = (val: number, curr: string = primaryCurrency) => baseFmt(val, curr);

  const formatDate = (date: string) => {
    return new Date(date).toISOString().slice(0, 10);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    return count;
  }, [typeFilter, selectedCategory]);

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;
        if (selectedCategory !== 'all' && t.category?.name !== selectedCategory) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const descMatch = t.description.toLowerCase().includes(q);
          const catMatch = t.category?.name?.toLowerCase().includes(q) ?? false;
          const acctMatch = t.account?.name?.toLowerCase().includes(q) ?? false;
          return descMatch || catMatch || acctMatch;
        }
        return true;
      })
      .sort((a, b) => {
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
  }, [transactions, typeFilter, selectedCategory, searchQuery, sortColumn, sortDirection]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'Amount', 'Currency', 'Account', 'Category'];
    const rows = filteredTransactions.map((t) => [
      t.transaction_date,
      `"${t.description.replace(/"/g, '""')}"`,
      t.type,
      t.amount,
      t.account.currency,
      `"${t.account.name.replace(/"/g, '""')}"`,
      `"${t.category?.name || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <KravioCard
      pattern
      className={cn('w-full animate-rise [animation-delay:300ms]', className)}
      innerClassName="p-0 overflow-hidden"
    >
      {/* Top Table Control Bar (1:1 with Kravio reference) */}
      <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:px-6 sm:flex-row sm:items-center sm:justify-between bg-card">
        {/* Left Section Title with Kravio Section Icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
              Transactions Monitoring
            </h3>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Field */}
          <div className="relative flex-1 sm:w-52">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transactions..."
              className="h-8.5 w-full rounded-xl border border-border/70 bg-muted/20 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Kravio Filter Popover */}
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

            <PopoverContent align="end" className="w-72 p-4 space-y-4 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Quick Filters
                </span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setTypeFilter('all');
                      setSelectedCategory('all');
                    }}
                    className="text-[11px] font-medium text-rose-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Type Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase text-muted-foreground">
                  Type
                </label>
                <div className="grid grid-cols-3 gap-1 rounded-lg border border-border/70 bg-muted/30 p-0.5 text-xs">
                  {(['all', 'income', 'expense'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setTypeFilter(type)}
                      className={cn(
                        'rounded-md py-1 text-xs font-medium capitalize transition-all',
                        typeFilter === type
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
                      <SelectItem key={c.id} value={c.name}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 rounded-xl text-xs font-semibold px-4"
                  onClick={() => setIsFilterOpen(false)}
                >
                  Done
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Export Action */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex h-8.5 items-center gap-1.5 rounded-xl border border-border/70 bg-card px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shadow-xs"
            title="Export filtered transactions as CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {/* Quick Add Action */}
          <QuickAddTransaction accounts={accounts} categories={categories} />
        </div>
      </div>

      {/* Selection Banner if items selected */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-primary/10 px-4 sm:px-6 py-2 text-xs border-b border-primary/20 text-primary">
          <span>{selectedIds.size} transaction{selectedIds.size !== 1 ? 's' : ''} selected</span>
          <button
            type="button"
            onClick={() => setSelectedIds(new Set())}
            className="font-semibold underline hover:no-underline"
          >
            Clear Selection
          </button>
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
                  checked={
                    filteredTransactions.length > 0 &&
                    selectedIds.size === filteredTransactions.length
                  }
                  onChange={handleSelectAll}
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
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                const isSelected = selectedIds.has(tx.id);
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
                        onChange={() => toggleSelect(tx.id)}
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
                      </div>
                    </td>

                    {/* Priority / Signal Bars (Kravio 1:1) */}
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

                    {/* Assigned To / Account */}
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

                    {/* Status / Category */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {tx.category?.name ? (
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

                    {/* Created Date */}
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

                    {/* Row Actions Menu ⋮ (Kravio 1:1) */}
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
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-12 text-center text-muted-foreground">
                  <FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-xs font-semibold text-foreground">No transactions found</p>
                  <p className="text-[11px] mt-0.5">Try adjusting your search terms or filter criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Table Footer (Kravio style) */}
      <div className="flex items-center justify-between border-t border-border/60 bg-muted/10 px-4 sm:px-6 py-3 text-xs">
        <span className="text-muted-foreground font-mono">
          Showing {filteredTransactions.length} of {transactions.length} transactions
        </span>
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary transition-colors group"
        >
          <span>View All Transactions</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </KravioCard>
  );
}
