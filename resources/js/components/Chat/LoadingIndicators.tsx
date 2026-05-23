import { BarChart3, Check, Loader2, PiggyBank, Plus, Search } from 'lucide-react';

import { cn } from '@/lib/utils';

export function LoadingDots({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn('inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3 shadow-sm', className)}>
      <div className="flex items-center space-x-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
      </div>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

const TOOL_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  accounts_list:           { label: 'Fetching accounts',       icon: Search,    color: 'text-cyan-600 dark:text-cyan-400' },
  budgets_create:          { label: 'Creating budget',         icon: PiggyBank, color: 'text-violet-600 dark:text-violet-400' },
  budgets_list:            { label: 'Fetching budgets',        icon: Search,    color: 'text-blue-600 dark:text-blue-400' },
  budgets_status:          { label: 'Checking budget status',  icon: BarChart3, color: 'text-teal-600 dark:text-teal-400' },
  transactions_create:     { label: 'Logging transaction',     icon: Plus,      color: 'text-emerald-600 dark:text-emerald-400' },
  transactions_list:       { label: 'Fetching transactions',   icon: Search,    color: 'text-blue-600 dark:text-blue-400' },
  reports_monthly_summary: { label: 'Building monthly report', icon: BarChart3, color: 'text-indigo-600 dark:text-indigo-400' },
};

function getToolMeta(toolName: string) {
  return TOOL_META[toolName] ?? {
    label: toolName.replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    icon: Loader2,
    color: 'text-muted-foreground',
  };
}

export function ToolIndicator({ toolName, status, resultSummary }: {
  toolName: string;
  status: 'running' | 'completed';
  resultSummary?: string;
}) {
  const meta = getToolMeta(toolName);
  const Icon = meta.icon;
  const done = status === 'completed';

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm transition-all',
      done
        ? 'border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-950/20'
        : 'border-border/70 bg-background',
    )}>
      <div className={cn(
        'flex h-8 w-8 items-center justify-center rounded-xl flex-shrink-0',
        done ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-primary/10',
      )}>
        {done
          ? <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          : <Icon className={cn('h-4 w-4', meta.color, !done && 'animate-spin')} />
        }
      </div>

      <div className="space-y-0.5 min-w-0 flex-1">
        <div className={cn('font-medium', done ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground')}>
          {done ? meta.label.replace('ing', 'ed').replace('Building', 'Built').replace('Fetching', 'Fetched').replace('Checking', 'Checked') : meta.label}
        </div>
        {done && resultSummary && (
          <div className="text-xs text-muted-foreground truncate">{resultSummary}</div>
        )}
        {!done && (
          <div className="text-xs text-muted-foreground">Working on it...</div>
        )}
      </div>
    </div>
  );
}
