import { Search } from 'lucide-react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

// Mac shows ⌘K; everyone else shows Ctrl K, matching what the global keydown
// listener in GlobalSearch actually accepts. Read once at module load rather
// than via an effect — this app is client-render only (no SSR), so
// `navigator` is always available here.
const shortcutLabel = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-sidebar-border/60 bg-background/80 px-4 sm:px-6 backdrop-blur-md transition-all ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2.5 min-w-0">
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
                <div className="h-4 w-px bg-border/60 hidden sm:block" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
                    className="flex h-8 items-center gap-2 rounded-lg border border-border/70 bg-card px-2.5 text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted/40 transition-all shadow-2xs"
                >
                    <Search className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="hidden sm:inline">Search...</span>
                    <kbd className="hidden sm:inline-flex h-4 items-center rounded border border-border/70 bg-muted/60 px-1 font-mono text-[9px] font-semibold text-muted-foreground">
                        {shortcutLabel}
                    </kbd>
                </button>
            </div>
        </header>
    );
}
