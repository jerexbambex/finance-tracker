import React, { useState, useMemo } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  Search,
  Download,
  Plus,
  MoreVertical,
  FileSpreadsheet,
  Target,
  Filter,
  Eye,
  Pencil,
  Copy,
  ChevronRight,
  X,
  FileText,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency as baseFmt } from '@/lib/formatCurrency';
import { KravioCardPattern } from './KravioCard';
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
  currencies?: string[];
  primaryCurrency: string;
  className?: string;
}

export function KravioTransactionsTable({
  transactions,
  accounts,
  categories,
  currencies = [],
  primaryCurrency,
  className,
}: KravioTransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<'id' | 'description' | 'type' | 'account' | 'category' | 'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const formatCurrency = (val: number, curr: string = primaryCurrency) => baseFmt(val, curr);

  const formatDate = (date: string) => {
    return new Date(date).toISOString().slice(0, 10);
  };

  // Available unique currencies list
  const availableCurrencies = useMemo(() => {
    const list = new Set<string>(currencies);
    transactions.forEach((t) => {
      if (t.account?.currency) list.add(t.account.currency);
    });
    return Array.from(list);
  }, [currencies, transactions]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'all') count++;
    if (selectedCurrency !== 'all') count++;
    if (selectedCategory !== 'all') count++;
    return count;
  }, [typeFilter, selectedCurrency, selectedCategory]);

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
        if (selectedCurrency !== 'all' && t.account.currency !== selectedCurrency) return false;
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
    <div
      className={cn(
        'relative rounded-2xl border border-border/70 bg-muted/30 p-4 sm:p-6 overflow-hidden shadow-xs animate-rise [animation-delay:300ms]',
        className
      )}
    >
      <KravioCardPattern />

      {/* Top Table Control Bar (1:1 with Kravio reference) */}
      <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        {/* Left Section Title with Kravio Target Icon */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-foreground/30 text-foreground/80">
            <Target className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
            SLA Monitoring
          </h3>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Search Field */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ticket"
              className="h-8 w-36 sm:w-52 rounded-xl border border-border/80 bg-background pl-8 pr-7 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-xs transition-all"
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
              <button
                type="button"
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-xl border border-border/80 bg-background px-3 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors shadow-xs',
                  activeFilterCount > 0 && 'border-primary/50 bg-primary/5 text-primary'
                )}
              >
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Filter</span>
                {activeFilterCount > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-72 p-4 space-y-4 rounded-2xl shadow-xl bg-background border border-border/80">
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

              {/* Currency Filter */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium uppercase text-muted-foreground">
                  Currency
                </label>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="h-8.5 rounded-xl text-xs bg-muted/20 border-border/70 font-mono">
                    <SelectValue placeholder="All Currencies" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="all">All Currencies</SelectItem>
                    {availableCurrencies.map((c) => (
                      <SelectItem key={c} value={c} className="font-mono">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            className="flex h-8 items-center gap-1.5 rounded-xl border border-border/80 bg-background px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shadow-xs"
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
        <div className="relative z-10 flex items-center justify-between bg-primary/10 px-4 sm:px-6 py-2 mb-3 rounded-xl text-xs border border-primary/20 text-primary">
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

      {/* Inner Inset Card for Table (Kravio 1:1 Schema) */}
      <div className="relative z-10 w-full rounded-xl sm:rounded-2xl border border-border/60 bg-background shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/40 text-[11px] sm:text-xs text-muted-foreground font-normal bg-muted/5">
                <th className="w-12 pl-4 sm:pl-6 py-3.5">
                  <input
                    type="checkbox"
                    checked={
                      filteredTransactions.length > 0 &&
                      selectedIds.size === filteredTransactions.length
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-border/80 text-foreground focus:ring-primary/40 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 font-normal">
                  <button
                    type="button"
                    onClick={() => handleSort('id')}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors group select-none"
                  >
                    <span>Ticket ID</span>
                    <span className="text-[10px] opacity-60">↑↓</span>
                  </button>
                </th>
                <th className="py-3.5 font-normal">
                  <button
                    type="button"
                    onClick={() => handleSort('description')}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors group select-none"
                  >
                    <span>Subject</span>
                    <span className="text-[10px] opacity-60">↑↓</span>
                  </button>
                </th>
                <th className="py-3.5 font-normal">
                  <button
                    type="button"
                    onClick={() => handleSort('type')}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors group select-none"
                  >
                    <span>Priority</span>
                    <span className="text-[10px] opacity-60">↑↓</span>
                  </button>
                </th>
                <th className="py-3.5 font-normal">
                  <button
                    type="button"
                    onClick={() => handleSort('account')}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors group select-none"
                  >
                    <span>Assigned To</span>
                    <span className="text-[10px] opacity-60">↑↓</span>
                  </button>
                </th>
                <th className="py-3.5 font-normal">
                  <button
                    type="button"
                    onClick={() => handleSort('category')}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors group select-none"
                  >
                    <span>Status</span>
                    <span className="text-[10px] opacity-60">↑↓</span>
                  </button>
                </th>
                <th className="py-3.5 font-normal">
                  <button
                    type="button"
                    onClick={() => handleSort('date')}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors group select-none"
                  >
                    <span>Created Date</span>
                    <span className="text-[10px] opacity-60">↑↓</span>
                  </button>
                </th>
                <th className="py-3.5 font-normal text-right pr-2">
                  <button
                    type="button"
                    onClick={() => handleSort('amount')}
                    className="inline-flex items-center gap-1 hover:text-foreground transition-colors group select-none ml-auto"
                  >
                    <span>SLA Due</span>
                    <span className="text-[10px] opacity-60">↑↓</span>
                  </button>
                </th>
                <th className="w-10 pr-4 sm:pr-6 py-3.5"></th>
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
                      <td className="pl-4 sm:pl-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(tx.id)}
                          className="h-4 w-4 rounded border-border/80 text-foreground focus:ring-primary/40 cursor-pointer"
                        />
                      </td>

                      {/* Ticket ID (#2319) */}
                      <td className="py-4 whitespace-nowrap">
                        <span className="text-xs font-normal text-foreground">
                          #{displayId}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="py-4">
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <p className="text-xs sm:text-sm font-normal text-foreground truncate">
                            {tx.description}
                          </p>
                        </div>
                      </td>

                      {/* Priority (Signal Bars Kravio 1:1) */}
                      <td className="py-4 whitespace-nowrap">
                        {isIncome ? (
                          <div className="inline-flex items-center gap-1.5 text-xs text-foreground">
                            <div className="flex items-end gap-0.5 h-3">
                              <span className="w-0.5 h-1 bg-rose-500 rounded-full" />
                              <span className="w-0.5 h-2 bg-rose-500 rounded-full" />
                              <span className="w-0.5 h-3 bg-rose-500 rounded-full" />
                            </div>
                            <span>High</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs text-foreground">
                            <div className="flex items-end gap-0.5 h-3">
                              <span className="w-0.5 h-1 bg-amber-500 rounded-full" />
                              <span className="w-0.5 h-2 bg-amber-500 rounded-full" />
                              <span className="w-0.5 h-3 bg-muted-foreground/30 rounded-full" />
                            </div>
                            <span>Medium</span>
                          </div>
                        )}
                      </td>

                      {/* Assigned To (Avatar + Name) */}
                      <td className="py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-muted border border-border/70 flex items-center justify-center flex-shrink-0 text-muted-foreground text-[10px] font-medium overflow-hidden">
                            {tx.account.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs text-foreground font-normal truncate max-w-[120px]">
                            {tx.account.name}
                          </span>
                        </div>
                      </td>

                      {/* Status (Icon + Category 1:1) */}
                      <td className="py-4 whitespace-nowrap">
                        {isIncome ? (
                          <div className="flex items-center gap-1.5 text-xs text-foreground">
                            <FileText className="w-3.5 h-3.5 text-blue-500" />
                            <span>{tx.category?.name || 'In Review'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-foreground">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span>{tx.category?.name || 'In Progress'}</span>
                          </div>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 whitespace-nowrap">
                        <span className="text-xs text-foreground font-normal">
                          {formatDate(tx.transaction_date)}
                        </span>
                      </td>

                      {/* SLA Due / Amount */}
                      <td className="py-4 text-right whitespace-nowrap pr-2">
                        <span
                          className={cn(
                            'text-xs sm:text-sm font-normal tabular-nums',
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                              : 'text-foreground'
                          )}
                        >
                          {isIncome ? '+ ' : '- '}
                          {formatCurrency(tx.amount, tx.account.currency)}
                        </span>
                      </td>

                      {/* Row Actions Menu ⋮ */}
                      <td className="pr-4 sm:pr-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
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

        {/* Bottom Table Footer */}
        <div className="flex items-center justify-between border-t border-border/40 bg-muted/5 px-4 sm:px-6 py-3 text-xs">
          <span className="text-muted-foreground">
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
      </div>
    </div>
  );
}
