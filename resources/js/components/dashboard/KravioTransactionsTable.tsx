import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import {
    Search,
    SlidersHorizontal,
    Download,
    ArrowUpDown,
    Plus,
    Clock,
    Tag,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Check,
    ChevronRight,
    MoreHorizontal,
    FileSpreadsheet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency as baseFmt } from '@/lib/formatCurrency';
import { KravioCard } from './KravioCard';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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

type TypeFilter = 'all' | 'expense' | 'income';

export function KravioTransactionsTable({
    transactions,
    accounts,
    categories,
    primaryCurrency,
    className,
}: KravioTransactionsTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
    const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const formatCurrency = (val: number, curr: string = primaryCurrency) => baseFmt(val, curr);

    const formatDate = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
                if (sortBy === 'date') {
                    const da = new Date(a.transaction_date).getTime();
                    const db = new Date(b.transaction_date).getTime();
                    return sortDirection === 'desc' ? db - da : da - db;
                } else {
                    return sortDirection === 'desc' ? b.amount - a.amount : a.amount - b.amount;
                }
            });
    }, [transactions, typeFilter, selectedCategory, searchQuery, sortBy, sortDirection]);

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
            {/* Top Table Control Bar */}
            <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between bg-card">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold tracking-tight text-foreground">
                            Transactions Explorer
                        </h3>
                        <span className="flex h-5 items-center justify-center rounded-full bg-secondary px-2 text-[11px] font-bold text-secondary-foreground">
                            {filteredTransactions.length}
                        </span>
                    </div>

                    {/* Type Filter Pills */}
                    <div className="hidden sm:flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5 text-xs">
                        {(['all', 'expense', 'income'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setTypeFilter(type)}
                                className={cn(
                                    'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-all',
                                    typeFilter === type
                                        ? 'bg-card text-foreground shadow-xs font-semibold'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Search Field */}
                    <div className="relative flex-1 sm:w-56">
                        <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search description, account..."
                            className="h-8 w-full rounded-lg border border-border/70 bg-muted/20 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary/30"
                        />
                    </div>

                    {/* Category Filter */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type="button"
                                className="flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors shadow-xs"
                            >
                                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="max-w-[80px] truncate">
                                    {selectedCategory === 'all' ? 'Category' : selectedCategory}
                                </span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 text-xs">
                            <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                                All Categories
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {categories.map((c) => (
                                <DropdownMenuItem
                                    key={c.id}
                                    onClick={() => setSelectedCategory(c.name)}
                                >
                                    {c.name}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Sort Direction Toggle */}
                    <button
                        type="button"
                        onClick={() => {
                            if (sortBy === 'date') {
                                setSortDirection((d) => (d === 'desc' ? 'asc' : 'desc'));
                            } else {
                                setSortBy('date');
                                setSortDirection('desc');
                            }
                        }}
                        className="flex h-8 items-center gap-1 rounded-lg border border-border/70 bg-card px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shadow-xs"
                        title="Sort by date"
                    >
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">{sortDirection === 'desc' ? 'Newest' : 'Oldest'}</span>
                    </button>

                    {/* Export Action */}
                    <button
                        type="button"
                        onClick={handleExportCSV}
                        className="flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors shadow-xs"
                        title="Export filtered transactions as CSV"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Export</span>
                    </button>

                    {/* Quick Add Action */}
                    <QuickAddTransaction accounts={accounts} categories={categories} />
                </div>
            </div>

            {/* Selection Banner if items selected */}
            {selectedIds.size > 0 && (
                <div className="flex items-center justify-between bg-primary/10 px-4 py-2 text-xs border-b border-primary/20 text-primary">
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

            {/* Transactions Data Table */}
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-border/50 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            <th className="w-10 px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={
                                        filteredTransactions.length > 0 &&
                                        selectedIds.size === filteredTransactions.length
                                    }
                                    onChange={handleSelectAll}
                                    className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/40"
                                />
                            </th>
                            <th className="px-4 py-3">Transaction</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Account</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3 text-right">Amount</th>
                            <th className="w-12 px-3 py-3 text-center"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                        {filteredTransactions.length > 0 ? (
                            filteredTransactions.map((tx) => {
                                const isIncome = tx.type === 'income';
                                const isSelected = selectedIds.has(tx.id);

                                return (
                                    <tr
                                        key={tx.id}
                                        className={cn(
                                            'group transition-colors hover:bg-muted/40',
                                            isSelected && 'bg-primary/5',
                                        )}
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(tx.id)}
                                                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/40"
                                            />
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={cn(
                                                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-bold',
                                                        isIncome
                                                            ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                            : 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300',
                                                    )}
                                                >
                                                    {isIncome ? (
                                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <ArrowDownRight className="h-3.5 w-3.5" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 max-w-[200px] sm:max-w-xs">
                                                    <p className="font-semibold text-foreground truncate">
                                                        {tx.description}
                                                    </p>
                                                    <span className="text-[10px] text-muted-foreground capitalize">
                                                        {tx.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            {tx.category?.name ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground">
                                                    <span
                                                        className="h-1.5 w-1.5 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                tx.category.color || '#94a3b8',
                                                        }}
                                                    />
                                                    {tx.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-muted-foreground">
                                                    Uncategorized
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <Wallet className="h-3.5 w-3.5 text-muted-foreground/70 shrink-0" />
                                                <span className="truncate max-w-[120px]">
                                                    {tx.account.name}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                                                <Clock className="h-3 w-3 text-muted-foreground/70" />
                                                <span>{formatDate(tx.transaction_date)}</span>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-right">
                                            <span
                                                className={cn(
                                                    'font-mono font-bold tabular-nums text-xs sm:text-sm',
                                                    isIncome
                                                        ? 'text-emerald-600 dark:text-emerald-400'
                                                        : 'text-rose-600 dark:text-rose-400',
                                                )}
                                            >
                                                {isIncome ? '+' : '-'}
                                                {formatCurrency(tx.amount, tx.account.currency)}
                                            </span>
                                        </td>

                                        <td className="px-3 py-3 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        type="button"
                                                        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="text-xs">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/transactions/${tx.id}`}>
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/transactions/${tx.id}/edit`}>
                                                            Edit Transaction
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
                                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                                    <FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                                    <p className="text-xs font-semibold text-foreground">No transactions found</p>
                                    <p className="text-[11px] mt-0.5">Try changing your search query or filter tags</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bottom Table Footer */}
            <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-4 py-3 text-xs">
                <span className="text-muted-foreground">
                    Showing {filteredTransactions.length} of {transactions.length} transactions
                </span>
                <Link
                    href="/transactions"
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                    <span>View All Transactions</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        </KravioCard>
    );
}
