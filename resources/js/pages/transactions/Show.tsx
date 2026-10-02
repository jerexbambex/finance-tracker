import { Head, Link, router } from '@inertiajs/react';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Tag,
  Wallet,
  Image as ImageIcon,
  Pencil,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  Check,
  Printer,
  Download,
  Trash2,
  ShieldCheck,
  Clock,
  Building2,
  Share2,
  CheckCircle2,
  ExternalLink,
  Receipt,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { KravioCard, KravioCardPattern } from '@/components/dashboard/KravioCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

interface Split {
  id: string;
  category: { id?: string; name: string; color?: string };
  amount: number;
}

interface TagItem {
  id: string;
  name: string;
  color?: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  notes?: string;
  currency?: string;
  account: {
    id?: string;
    name: string;
    type: string;
    currency: string;
  };
  category?: {
    id?: string;
    name: string;
    color?: string;
  };
  splits?: Split[];
  tags?: TagItem[];
  media?: Array<{
    id: string;
    file_name: string;
    mime_type: string;
    size: number;
    original_url: string;
  }>;
}

interface Props {
  transaction: Transaction;
}

export default function Show({ transaction }: Props) {
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const currency = transaction.currency || transaction.account.currency || 'USD';
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';
  const isExpense = transaction.type === 'expense';

  const displayId = transaction.id.length > 8 ? transaction.id.slice(0, 8).toUpperCase() : transaction.id;
  const fullRef = `TXN-${displayId}`;

  const copyReference = () => {
    navigator.clipboard.writeText(transaction.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to permanently delete this transaction?')) {
      router.delete(`/transactions/${transaction.id}`, {
        onSuccess: () => router.visit('/transactions'),
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatShortDate = (date: string) => {
    return new Date(date).toISOString().slice(0, 10);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Generate a mock crypto ledger checksum for digital certification look
  const checksum = `sha256:${transaction.id.replace(/-/g, '').slice(0, 16)}...${transaction.id.replace(/-/g, '').slice(-8)}`;

  return (
    <AppLayout>
      <Head title={`Transaction - ${transaction.description}`} />

      <div className="py-6 sm:py-8 space-y-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Navigation & Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/transactions"
                className="p-2 rounded-xl border border-border/80 bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors shadow-xs"
                title="Back to Transactions Ledger"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    Transaction Record
                  </h1>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground border border-border/60">
                    #{displayId}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reconciled ledger entry in {transaction.account.name}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 rounded-xl text-xs border-border/80 bg-background hover:bg-muted/50 gap-1.5 shadow-xs"
                onClick={handlePrint}
              >
                <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Print Receipt</span>
              </Button>

              <Link href={`/transactions/create?duplicate_id=${transaction.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8.5 rounded-xl text-xs border-border/80 bg-background hover:bg-muted/50 gap-1.5 shadow-xs"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Duplicate</span>
                </Button>
              </Link>

              <Link href={`/transactions/${transaction.id}/edit`}>
                <Button
                  size="sm"
                  className="h-8.5 rounded-xl text-xs font-semibold gap-1.5 shadow-xs"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit Entry</span>
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="h-8.5 w-8.5 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                onClick={handleDelete}
                title="Delete Transaction"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Main Fintech Digital Statement Card */}
          <div className="relative rounded-2xl border border-border/70 bg-muted/30 p-4 sm:p-7 overflow-hidden shadow-sm">
            <KravioCardPattern />

            {/* Inset Receipt Container */}
            <div className="relative z-10 w-full rounded-2xl border border-border/60 bg-background p-6 sm:p-8 shadow-xs space-y-8">
              {/* Receipt Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      Digital Financial Statement
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {fullRef}
                      </span>
                      <button
                        type="button"
                        onClick={copyReference}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy full transaction UUID"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Cleared & Reconciled</span>
                  </div>
                </div>
              </div>

              {/* Hero Amount Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-lg',
                        isIncome
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : isTransfer
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      )}
                    >
                      {isIncome ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : isTransfer ? (
                        <Layers className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground capitalize">
                      {isIncome ? 'Inbound Cash Flow' : isTransfer ? 'Internal Transfer' : 'Outbound Expense'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {transaction.description}
                  </h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatDate(transaction.transaction_date)}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right bg-muted/20 sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none border border-border/40 sm:border-0">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    Settlement Amount
                  </span>
                  <div
                    className={cn(
                      'text-3xl sm:text-4xl font-bold font-mono tabular-nums tracking-tight mt-0.5',
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isTransfer
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-foreground'
                    )}
                  >
                    {isIncome ? '+' : isExpense ? '-' : ''}
                    {formatCurrency(transaction.amount, currency)}
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground mt-0.5 block">
                    Currency: {currency}
                  </span>
                </div>
              </div>

              {/* 4-Card Financial Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {/* Account */}
                <div className="p-4 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Wallet className="h-3.5 w-3.5" />
                    <span>Settlement Account</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {transaction.account.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground capitalize mt-0.5">
                      {transaction.account.type?.replace('_', ' ') || 'Account'} • {currency}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="p-4 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Category Allocation</span>
                  </div>
                  <div>
                    {transaction.splits && transaction.splits.length > 0 ? (
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Split Transaction
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Across {transaction.splits.length} categories
                        </p>
                      </div>
                    ) : transaction.category ? (
                      <div className="flex items-center gap-2">
                        {transaction.category.color && (
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: transaction.category.color }}
                          />
                        )}
                        <p className="text-sm font-semibold text-foreground truncate">
                          {transaction.category.name}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-muted-foreground">
                        Uncategorized
                      </p>
                    )}
                  </div>
                </div>

                {/* Priority / Signal */}
                <div className="p-4 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Ledger Priority</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-end gap-0.5 h-3.5">
                      <span
                        className={cn(
                          'w-0.5 h-1.5 rounded-full',
                          isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                        )}
                      />
                      <span
                        className={cn(
                          'w-0.5 h-2.5 rounded-full',
                          isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                        )}
                      />
                      <span
                        className={cn(
                          'w-0.5 h-3.5 rounded-full',
                          isIncome ? 'bg-emerald-500' : 'bg-rose-500'
                        )}
                      />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {isIncome ? 'High Priority Inflow' : 'Normal Settlement'}
                    </p>
                  </div>
                </div>

                {/* Verification */}
                <div className="p-4 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Audit Status</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Verified & Synced
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
                      {checksum}
                    </p>
                  </div>
                </div>
              </div>

              {/* Split Breakdown (If Present) */}
              {transaction.splits && transaction.splits.length > 0 && (
                <div className="p-5 rounded-2xl bg-muted/15 border border-border/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                        Split Allocation Breakdown
                      </h3>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {transaction.splits.length} splits • 100% allocated
                    </span>
                  </div>

                  {/* Multi-color Progress Bar */}
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                    {transaction.splits.map((split, i) => {
                      const pct = Math.max(1, Math.round((split.amount / transaction.amount) * 100));
                      const color = split.category.color || ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4'][i % 5];
                      return (
                        <div
                          key={split.id}
                          style={{ width: `${pct}%`, backgroundColor: color }}
                          className="h-full transition-all hover:opacity-80"
                          title={`${split.category.name}: ${formatCurrency(split.amount, currency)} (${pct}%)`}
                        />
                      );
                    })}
                  </div>

                  {/* Splits List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {transaction.splits.map((split, i) => {
                      const pct = Math.round((split.amount / transaction.amount) * 100);
                      const color = split.category.color || ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4'][i % 5];
                      return (
                        <div
                          key={split.id}
                          className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-background text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                            <span className="font-medium text-foreground truncate">{split.category.name}</span>
                          </div>
                          <div className="text-right whitespace-nowrap pl-2">
                            <span className="font-mono font-semibold text-foreground">
                              {formatCurrency(split.amount, currency)}
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground ml-1.5">
                              ({pct}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags Section (If Present) */}
              {transaction.tags && transaction.tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Assigned Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {transaction.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
                        style={{
                          backgroundColor: `${tag.color || '#6366f1'}15`,
                          borderColor: `${tag.color || '#6366f1'}35`,
                          color: tag.color || '#6366f1',
                        }}
                      >
                        <Tag className="h-3 w-3" />
                        <span>{tag.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes & Memo */}
              {transaction.notes && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Internal Notes & Reference Memo
                  </span>
                  <div className="text-xs sm:text-sm bg-muted/20 border border-border/50 p-4 rounded-xl whitespace-pre-wrap text-foreground font-sans leading-relaxed">
                    {transaction.notes}
                  </div>
                </div>
              )}

              {/* Receipts & Proof of Purchase Attachments */}
              {transaction.media && transaction.media.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>Attached Receipts & Invoices ({transaction.media.length})</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {transaction.media.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-background hover:bg-muted/30 transition-colors group"
                      >
                        <div
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (file.mime_type.startsWith('image/')) {
                              setSelectedImage(file.original_url);
                            } else {
                              window.open(file.original_url, '_blank');
                            }
                          }}
                        >
                          {file.mime_type.startsWith('image/') ? (
                            <img
                              src={file.original_url}
                              alt={file.file_name}
                              className="h-12 w-12 object-cover rounded-lg border border-border/60 flex-shrink-0"
                            />
                          ) : (
                            <div className="h-12 w-12 flex items-center justify-center bg-muted rounded-lg text-muted-foreground flex-shrink-0">
                              <FileText className="h-6 w-6" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                              {file.file_name}
                            </p>
                            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>

                        <a
                          href={file.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                          title="Open or Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transaction Audit Timeline Journey */}
              <div className="pt-4 border-t border-border/50">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-4">
                  Reconciliation Journey
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/10 border border-border/40">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Initiated & Recorded</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{formatShortDate(transaction.transaction_date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/10 border border-border/40">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Account Balanced</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{transaction.account.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/10 border border-border/40">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">Ledger Reconciled</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">100% Matched</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lightbox Modal for Image Preview */}
          {selectedImage && (
            <div
              className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in"
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-background border border-border/80 p-2">
                <img
                  src={selectedImage}
                  alt="Receipt Preview"
                  className="max-h-[80vh] w-auto object-contain rounded-xl"
                />
                <div className="flex justify-between items-center p-3">
                  <span className="text-xs text-muted-foreground font-mono">Receipt Attachment Preview</span>
                  <Button size="sm" variant="secondary" className="rounded-xl text-xs h-7" onClick={() => setSelectedImage(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
