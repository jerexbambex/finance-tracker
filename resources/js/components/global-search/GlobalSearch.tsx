import { router } from '@inertiajs/react';
import {
  ArrowUpDown,
  Bell,
  Folder,
  Landmark,
  LayoutGrid,
  LineChart,
  PieChart,
  Repeat,
  Settings,
  Target,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { formatCurrency } from '@/lib/formatCurrency';

interface NavPage {
  title: string;
  href: string;
  icon: LucideIcon;
  keywords?: string;
}

const PAGES: NavPage[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
  { title: 'Accounts', href: '/accounts', icon: Wallet },
  { title: 'Net Worth', href: '/net-worth', icon: Landmark },
  { title: 'Transactions', href: '/transactions', icon: ArrowUpDown },
  { title: 'Reports', href: '/reports', icon: TrendingUp },
  { title: 'Insights', href: '/insights', icon: TrendingUp },
  { title: 'Cash Flow', href: '/cash-flow', icon: LineChart },
  { title: 'Notifications', href: '/notifications', icon: Bell },
  { title: 'Budgets', href: '/budgets', icon: PieChart },
  { title: 'Goals', href: '/goals', icon: Target },
  { title: 'Recurring Transactions', href: '/recurring-transactions', icon: Repeat, keywords: 'recurring subscriptions' },
  { title: 'Reminders', href: '/reminders', icon: Bell, keywords: 'bills' },
  { title: 'Categories', href: '/categories', icon: Folder },
  { title: 'Settings', href: '/settings/profile', icon: Settings },
];

interface ResultItem {
  id: string;
  label: string;
  meta: string;
  amount?: number;
  currency?: string;
  type?: string;
}

interface SearchResults {
  transactions: ResultItem[];
  accounts: ResultItem[];
  budgets: ResultItem[];
  goals: ResultItem[];
  categories: ResultItem[];
}

const EMPTY_RESULTS: SearchResults = { transactions: [], accounts: [], budgets: [], goals: [], categories: [] };

// Opened via Cmd/Ctrl+K from anywhere, or the search button in the header
// (which dispatches the 'open-global-search' event — simpler than prop-
// drilling shared state through AppLayout down to two unrelated components).
export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    const onOpenRequest = () => setOpen(true);

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('open-global-search', onOpenRequest);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('open-global-search', onOpenRequest);
    };
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery('');
      setResults(EMPTY_RESULTS);
    }
  };

  useEffect(() => {
    // Nothing to fetch for a short query — the derived `effectiveResults`
    // below already masks any stale `results` from a previous, longer query,
    // so there's no separate "clear" state to synchronize here.
    if (query.trim().length < 2) {
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/search?q=${encodeURIComponent(query)}`, { headers: { Accept: 'application/json' } })
        .then((r) => (r.ok ? r.json() : EMPTY_RESULTS))
        .then((data: SearchResults) => setResults(data))
        .catch(() => setResults(EMPTY_RESULTS))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const effectiveResults = query.trim().length < 2 ? EMPTY_RESULTS : results;

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PAGES;
    return PAGES.filter((p) => `${p.title} ${p.keywords ?? ''}`.toLowerCase().includes(q));
  }, [query]);

  const go = (href: string) => {
    setOpen(false);
    router.visit(href);
  };

  const hasEntityResults = effectiveResults.transactions.length + effectiveResults.accounts.length + effectiveResults.budgets.length + effectiveResults.goals.length + effectiveResults.categories.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange} title="Search" description="Search pages, transactions, accounts, budgets, goals, and categories">
      <CommandInput placeholder="Search or jump to..." value={query} onValueChange={setQuery} />
      <CommandList>
        {!loading && query.trim().length >= 2 && !hasEntityResults && filteredPages.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}

        {filteredPages.length > 0 && (
          <CommandGroup heading="Pages">
            {filteredPages.map((page) => (
              <CommandItem key={page.href} value={`page-${page.title}`} onSelect={() => go(page.href)}>
                <page.icon className="h-4 w-4" />
                <span>{page.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {effectiveResults.transactions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Transactions">
              {effectiveResults.transactions.map((t) => (
                <CommandItem key={t.id} value={`txn-${t.id}-${t.label}`} onSelect={() => go('/transactions')}>
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="flex-1 truncate">{t.label}</span>
                  <span className="text-muted-foreground text-xs">{t.meta}</span>
                  <span className={`font-mono text-xs ${t.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(t.amount ?? 0, t.currency)}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {effectiveResults.accounts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Accounts">
              {effectiveResults.accounts.map((a) => (
                <CommandItem key={a.id} value={`acct-${a.id}-${a.label}`} onSelect={() => go(`/accounts/${a.id}`)}>
                  <Wallet className="h-4 w-4" />
                  <span className="flex-1 truncate">{a.label}</span>
                  <span className="text-muted-foreground text-xs">{a.meta}</span>
                  <span className="font-mono text-xs">{formatCurrency(a.amount ?? 0, a.currency)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {effectiveResults.budgets.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Budgets">
              {effectiveResults.budgets.map((b) => (
                <CommandItem key={b.id} value={`budget-${b.id}-${b.label}`} onSelect={() => go('/budgets')}>
                  <PieChart className="h-4 w-4" />
                  <span className="flex-1 truncate">{b.label}</span>
                  <span className="text-muted-foreground text-xs">{b.meta}</span>
                  <span className="font-mono text-xs">{formatCurrency(b.amount ?? 0, b.currency)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {effectiveResults.goals.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Goals">
              {effectiveResults.goals.map((g) => (
                <CommandItem key={g.id} value={`goal-${g.id}-${g.label}`} onSelect={() => go('/goals')}>
                  <Target className="h-4 w-4" />
                  <span className="flex-1 truncate">{g.label}</span>
                  <span className="font-mono text-xs">{formatCurrency(g.amount ?? 0, g.currency)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {effectiveResults.categories.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Categories">
              {effectiveResults.categories.map((c) => (
                <CommandItem key={c.id} value={`cat-${c.id}-${c.label}`} onSelect={() => go('/categories')}>
                  <Folder className="h-4 w-4" />
                  <span className="flex-1 truncate">{c.label}</span>
                  <span className="text-muted-foreground text-xs">{c.meta}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
