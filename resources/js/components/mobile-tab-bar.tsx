import { Link, usePage } from '@inertiajs/react';
import { ArrowUpDown, LayoutGrid, Menu, PieChart, Plus } from 'lucide-react';
import { type ComponentType, useState } from 'react';

import QuickAddTransactionForm from '@/components/quick-add/QuickAddTransactionForm';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useSidebar } from '@/components/ui/sidebar';
import { useActiveUrl } from '@/hooks/use-active-url';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

interface QuickAddShared {
    accounts: { id: string; name: string }[];
    categories: { id: string; name: string; type: string }[];
}

const tabClass =
    'flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors';

function Tab({
    href,
    icon: Icon,
    label,
}: {
    href: string;
    icon: ComponentType<{ className?: string }>;
    label: string;
}) {
    const { urlIsActiveOrChild } = useActiveUrl();
    const active = urlIsActiveOrChild(href);

    return (
        <Link
            href={href}
            prefetch
            aria-current={active ? 'page' : undefined}
            className={cn(
                tabClass,
                active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
            )}
        >
            <Icon className="h-5 w-5" />
            <span className="truncate">{label}</span>
        </Link>
    );
}

/**
 * Phone navigation: the four places people go most, plus a centre button to
 * log a transaction (replaces the old floating + button, which covered list
 * content). "More" opens the full sidebar. Hidden from md up, where the
 * sidebar is always on screen.
 */
export function MobileTabBar() {
    const [open, setOpen] = useState(false);
    const { setOpenMobile } = useSidebar();
    const { quickAdd } = usePage().props as {
        quickAdd?: QuickAddShared | null;
    };
    const canQuickAdd = !!quickAdd && quickAdd.accounts.length > 0;

    return (
        <>
            <nav
                aria-label="Primary"
                className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
            >
                <div className="mx-auto flex h-16 max-w-md items-stretch px-2">
                    <Tab
                        href={dashboard().url}
                        icon={LayoutGrid}
                        label="Home"
                    />
                    <Tab
                        href="/transactions"
                        icon={ArrowUpDown}
                        label="Transactions"
                    />

                    <div className="flex flex-1 items-center justify-center">
                        {canQuickAdd ? (
                            <button
                                type="button"
                                onClick={() => setOpen(true)}
                                aria-label="Add transaction"
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
                            >
                                <Plus className="h-6 w-6" />
                            </button>
                        ) : (
                            <Link
                                href="/accounts/create"
                                aria-label="Add an account"
                                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
                            >
                                <Plus className="h-6 w-6" />
                            </Link>
                        )}
                    </div>

                    <Tab href="/budgets" icon={PieChart} label="Budgets" />
                    <button
                        type="button"
                        onClick={() => setOpenMobile(true)}
                        className={cn(
                            tabClass,
                            'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Menu className="h-5 w-5" />
                        <span>More</span>
                    </button>
                </div>
            </nav>

            {canQuickAdd && (
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Quick Add Transaction</DialogTitle>
                        </DialogHeader>
                        <QuickAddTransactionForm
                            accounts={quickAdd.accounts}
                            categories={quickAdd.categories}
                            onDone={() => setOpen(false)}
                            onCancel={() => setOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
