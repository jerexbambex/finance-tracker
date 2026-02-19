import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Wallet, ArrowUpDown, PieChart, Target, Folder, Settings, TrendingUp, BarChart3, Bell, Repeat } from 'lucide-react';

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

    const overviewItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'Accounts',
            href: '/accounts',
            icon: Wallet,
        },
        {
            title: 'Transactions',
            href: '/transactions',
            icon: ArrowUpDown,
        },
        {
            title: 'Reports',
            href: '/reports',
            icon: BarChart3,
        },
        {
            title: 'Insights',
            href: '/insights',
            icon: TrendingUp,
        },
        {
            title: 'Notifications',
            href: '/notifications',
            icon: Bell,
            badge: unreadNotifications > 0 ? unreadNotifications : undefined,
        },
    ];

    const planningItems: NavItem[] = [
        {
            title: 'Budgets',
            href: '/budgets',
            icon: PieChart,
        },
        {
            title: 'Goals',
            href: '/goals',
            icon: Target,
        },
        {
            title: 'Recurring',
            href: '/recurring-transactions',
            icon: Repeat,
        },
        {
            title: 'Reminders',
            href: '/reminders',
            icon: Bell,
        },
        {
            title: 'Categories',
            href: '/categories',
            icon: Folder,
        },
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

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Overview</SidebarGroupLabel>
                    <NavMain items={overviewItems} />
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Planning</SidebarGroupLabel>
                    <NavMain items={planningItems} />
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
