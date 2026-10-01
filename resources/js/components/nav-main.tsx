import { Link } from '@inertiajs/react';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useActiveUrl } from '@/hooks/use-active-url';
import { type NavItem } from '@/types';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { urlIsActive } = useActiveUrl();

    return (
        <SidebarMenu>
            {items.map((item) => {
                const active = urlIsActive(item.href);
                return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={active}
                            tooltip={{ children: item.title }}
                            className="transition-all duration-150 rounded-lg text-xs font-medium"
                        >
                            <Link href={item.href} prefetch className="flex items-center gap-2.5">
                                {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                                <span className="truncate">{item.title}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/15 px-1 font-mono text-[10px] font-bold text-primary">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );
}
