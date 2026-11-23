import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Wallet,
    ArrowUpDown,
    PieChart,
    Target,
    Folder,
    Settings,
    TrendingUp,
    BarChart3,
    Bell,
    Repeat,
    LineChart,
    Landmark,
    CalendarClock,
} from 'lucide-react';

import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';

import AppLogo from './app-logo';

export function AppSidebar() {
    const { unreadNotifications } = usePage().props as { unreadNotifications?: number };

    // Grouped by what people come to do: day-to-day money, planning ahead,
    // and looking back. Reports/Insights/Cash Flow/Net Worth used to sit in
    // the main list between Transactions and Notifications.
    const overviewItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: LayoutGrid },
        { title: 'Transactions', href: '/transactions', icon: ArrowUpDown },
        { title: 'Accounts', href: '/accounts', icon: Wallet },
        {
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
            badge: (unreadNotifications ?? 0) > 0 ? unreadNotifications : undefined,
        },
    ];

    const planningItems: NavItem[] = [
        { title: 'Budgets', href: '/budgets', icon: PieChart },
        { title: 'Goals', href: '/goals', icon: Target },
        { title: 'Recurring', href: '/recurring-transactions', icon: Repeat },
        { title: 'Bill Reminders', href: '/reminders', icon: CalendarClock },
        { title: 'Categories', href: '/categories', icon: Folder },
    ];

    const analysisItems: NavItem[] = [
        { title: 'Reports', href: '/reports', icon: BarChart3 },
        { title: 'Insights', href: '/insights', icon: TrendingUp },
        { title: 'Cash Flow', href: '/cash-flow', icon: LineChart },
        { title: 'Net Worth', href: '/net-worth', icon: Landmark },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Settings',
            href: '/settings',
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="space-y-2">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Overview
                    </SidebarGroupLabel>
                    <NavMain items={overviewItems} />
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Plan
                    </SidebarGroupLabel>
                    <NavMain items={planningItems} />
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                        Analyze
                    </SidebarGroupLabel>
                    <NavMain items={analysisItems} />
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <div className="flex items-center justify-between px-2 py-2">
                    <AppearanceToggleDropdown />
                </div>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
