import React from 'react';
import { Link } from '@inertiajs/react';
import { Wallet, CreditCard, Building2, Landmark, Plus, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency as baseFmt } from '@/lib/formatCurrency';
import { KravioCard } from './KravioCard';
import { Badge } from '@/components/ui/badge';

interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
}

interface KravioAccountsSectionProps {
    accounts: Account[];
    primaryCurrency: string;
    className?: string;
}

const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'credit_card':
        case 'credit':
            return CreditCard;
        case 'bank':
        case 'checking':
        case 'savings':
            return Landmark;
        case 'investment':
            return Building2;
        default:
            return Wallet;
    }
};

export function KravioAccountsSection({
    accounts,
    primaryCurrency,
    className,
}: KravioAccountsSectionProps) {
    const formatCurrency = (val: number, curr: string) => baseFmt(val, curr);

    return (
        <div className={cn('w-full space-y-3', className)}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">
                        Wallets & Accounts
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {accounts.length} active account{accounts.length !== 1 ? 's' : ''} connected
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/accounts/create"
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Account</span>
                    </Link>
                    <span className="text-muted-foreground">•</span>
                    <Link
                        href="/accounts"
                        className="text-xs text-muted-foreground hover:text-foreground"
                    >
                        Manage All →
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {accounts.map((acc, index) => {
                    const Icon = getAccountIcon(acc.type);
                    const isOverdrawn = acc.balance < 0;

                    return (
                        <KravioCard
                            key={acc.id}
                            pattern
                            className="group/acc transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
                            innerClassName="p-3.5 flex flex-col justify-between h-full bg-gradient-to-br from-card to-muted/20"
                            style={{ animationDelay: `${120 + index * 40}ms` }}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover/acc:bg-primary group-hover/acc:text-primary-foreground transition-colors">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-foreground truncate group-hover/acc:text-primary transition-colors">
                                            {acc.name}
                                        </p>
                                        <span className="text-[10px] uppercase font-medium tracking-wider text-muted-foreground">
                                            {acc.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0 font-mono"
                                >
                                    {acc.currency}
                                </Badge>
                            </div>

                            <div className="mt-3 flex items-baseline justify-between gap-2">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-muted-foreground block">Available Balance</span>
                                    <span
                                        className={cn(
                                            'font-mono text-lg font-bold tracking-tight tabular-nums',
                                            isOverdrawn ? 'text-rose-600' : 'text-foreground',
                                        )}
                                    >
                                        {formatCurrency(acc.balance, acc.currency)}
                                    </span>
                                </div>
                                <Link
                                    href={`/accounts/${acc.id}`}
                                    className="opacity-0 group-hover/acc:opacity-100 transition-opacity flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </KravioCard>
                    );
                })}

                {/* Add New Account Card */}
                <Link
                    href="/accounts/create"
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-muted/20 p-4 text-center transition-all duration-200 hover:border-primary/50 hover:bg-muted/40 group"
                >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background border border-border/70 text-muted-foreground group-hover:text-primary group-hover:border-primary/40 transition-colors shadow-xs">
                        <Plus className="h-4 w-4" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                            Link New Account
                        </p>
                        <p className="text-[11px] text-muted-foreground">Bank, Wallet, or Credit</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
