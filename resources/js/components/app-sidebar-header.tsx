import { Search } from 'lucide-react';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

// Mac shows ⌘K; everyone else shows Ctrl K, matching what the global keydown
// listener in GlobalSearch actually accepts. Read once at module load rather
// than via an effect — this app is client-render only (no SSR), so
// `navigator` is always available here.
const shortcutLabel = /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
                className="flex items-center gap-2 rounded-md border border-sidebar-border/50 bg-background px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
                <Search className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border/60 bg-muted px-1.5 font-mono text-[10px]">
                    {shortcutLabel}
                </kbd>
            </button>
        </header>
    );
}
