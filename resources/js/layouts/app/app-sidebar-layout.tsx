import { type PropsWithChildren, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast, Toaster } from 'sonner';

import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    const { flash, impersonating } = usePage().props as { flash?: { success?: string; error?: string }; impersonating?: { name: string } };

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    return (
        <AppShell variant="sidebar">
            <Toaster position="top-right" />
            {impersonating && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 px-4 py-2 text-center text-sm font-medium text-white">
                    You are impersonating {impersonating.name}
                    <a href="/filament-impersonate/leave" className="ml-4 underline hover:no-underline">
                        Leave Impersonation
                    </a>
                </div>
            )}
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden" style={impersonating ? { marginTop: '40px' } : {}}>
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
        </AppShell>
    );
}
