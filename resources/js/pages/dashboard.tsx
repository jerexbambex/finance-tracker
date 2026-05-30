import { Head } from '@inertiajs/react';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Clock } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

import QuickAddTransaction from '@/components/QuickAddTransaction';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency as baseFmt } from '@/lib/formatCurrency';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface Account {
    id: string;
    name: string;
    type: string;
    balance: number;
    currency: string;
}

interface Transaction {
    id: string;
    type: string;
    amount: number;
    description: string;
    transaction_date: string;
    account: { name: string; currency: string };
    category?: { name: string };
}

interface Budget {
    id: string;
    category: string;
    percentage: number;
    amount: number;
    spent: number;
    status: 'ok' | 'warning' | 'exceeded';
    currency: string;
}

interface Goal {
    name: string;
    percentage: number;
}

interface Category {
    id: string;
    name: string;
    type: string;
    color?: string;
    is_active: boolean;
}

interface CategorySpending {
    name: string;
    amount: number;
    currency: string;
    color: string;
}

interface MonthlyTrend {
    month: string;
    income: Record<string, number>;
    expense: Record<string, number>;
}

interface Reminder {
    id: string;
    title: string;
    amount?: number;
    due_date: string;
    category?: { name: string; color?: string };
}

interface Props {
    accounts: Account[];
    balancesByCurrency: Record<string, number>;
    recentTransactions: Transaction[];
    incomeByCurrency: Record<string, number>;
    expensesByCurrency: Record<string, number>;
    categorySpending: CategorySpending[];
    monthlyTrend: MonthlyTrend[];
    budgets: Budget[];
    budgetAlerts: Budget[];
    goals: Goal[];
    categories: Category[];
    upcomingReminders: Reminder[];
    currencies: Record<string, { symbol: string; label: string }>;
}

export default function Dashboard({ accounts, balancesByCurrency, recentTransactions, incomeByCurrency, expensesByCurrency, categorySpending, monthlyTrend, budgets, budgetAlerts, goals, categories, upcomingReminders }: Props) {
    const primaryCurrency = Object.keys(balancesByCurrency)[0] ?? 'USD';

    const trendCurrencies = [...new Set(
        monthlyTrend.flatMap((d) => [...Object.keys(d.income), ...Object.keys(d.expense)]),
    )];
    const [trendCurrency, setTrendCurrency] = useState(trendCurrencies[0] ?? primaryCurrency);
    const trendChartData = monthlyTrend.map((d) => ({
        month: d.month,
        income: d.income[trendCurrency] ?? 0,
        expense: d.expense[trendCurrency] ?? 0,
    }));

    const formatCurrency = (amount: number, currency: string = primaryCurrency) => baseFmt(amount, currency);

    const formatCurrencyGroup = (amounts: Record<string, number>) =>
        Object.entries(amounts).map(([currency, amount]) => formatCurrency(amount, currency)).join(', ') || formatCurrency(0);

    const netByCurrency = Object.keys({ ...incomeByCurrency, ...expensesByCurrency }).reduce<Record<string, number>>(
        (acc, currency) => ({
            ...acc,
            [currency]: (incomeByCurrency[currency] ?? 0) - (expensesByCurrency[currency] ?? 0),
        }),
        {},
    );

    const formatDate = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex-1 space-y-6 p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h2>
                            <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
                        </div>
                        <QuickAddTransaction accounts={accounts} categories={categories} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-border/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                                <Wallet className="h-[18px] w-[18px] text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrencyGroup(balancesByCurrency)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {accounts.length} account{accounts.length !== 1 ? 's' : ''}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Income</CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
                                <ArrowUpRight className="h-[18px] w-[18px] text-green-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrencyGroup(incomeByCurrency)}</div>
                            <p className="text-xs text-muted-foreground mt-1">This month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10">
                                <ArrowDownRight className="h-[18px] w-[18px] text-red-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{formatCurrencyGroup(expensesByCurrency)}</div>
                            <p className="text-xs text-muted-foreground mt-1">This month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${Object.values(netByCurrency).every((v) => v >= 0) ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                <TrendingUp className={`h-[18px] w-[18px] ${Object.values(netByCurrency).every((v) => v >= 0) ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${Object.values(netByCurrency).every((v) => v >= 0) ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrencyGroup(netByCurrency)}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">This month</p>
                        </CardContent>
                    </Card>
                </div>

                    {(budgets.length > 0 || goals.length > 0) && (
                        <div className="grid gap-6 md:grid-cols-2">
                            {budgets.length > 0 && (
                                <Card className="border-border/40">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Budget Alerts</CardTitle>
                                            <Badge variant="secondary" className="text-xs">{budgets.filter(b => b.percentage >= 80).length}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {budgets
                                                .filter(b => b.percentage >= 80)
                                                .slice(0, 5)
                                                .map((budget, index) => (
                                                    <div key={index} className="flex items-center gap-3 rounded-lg border border-border/40 p-3">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">{budget.category}</p>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {budget.percentage >= 100 ? 'Over budget' : 'Near limit'}
                                                            </p>
                                                        </div>
                                                        <Badge 
                                                            variant="secondary"
                                                            className={`text-xs ${budget.percentage >= 100 ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'}`}
                                                        >
                                                            {budget.percentage.toFixed(0)}%
                                                        </Badge>
                                                    </div>
                                                ))}
                                        </div>
                                        {budgets.filter(b => b.percentage >= 80).length === 0 && (
                                            <p className="text-sm text-muted-foreground">All budgets on track! 🎉</p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {goals.length > 0 && (
                                <Card className="border-border/40">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Goals Progress</CardTitle>
                                            <Badge variant="secondary" className="text-xs">{goals.length}</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {goals.slice(0, 5).map((goal, index) => (
                                                <div key={index} className="flex items-center gap-3 rounded-lg border border-border/40 p-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{goal.name}</p>
                                                        <div className="mt-2">
                                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-green-600 transition-all"
                                                                    style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                                                        {goal.percentage.toFixed(0)}%
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Charts Section */}
                    {(categorySpending.length > 0 || monthlyTrend.length > 0) && (
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Spending by Category */}
                            {categorySpending.length > 0 && (
                                <Card className="border-border/40">
                                    <CardHeader>
                                        <CardTitle>Top Spending Categories</CardTitle>
                                        <p className="text-xs text-muted-foreground">This month</p>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {categorySpending.map((category, index) => (
                                                <div key={index} className="flex items-center gap-3">
                                                    <div 
                                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">{category.name}</p>
                                                    </div>
                                                    <p className="text-sm font-semibold">{formatCurrency(category.amount, category.currency)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Monthly Trend */}
                            {monthlyTrend.length > 0 && (
                                <Card className="border-border/40">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>6-Month Trend</CardTitle>
                                                <p className="text-xs text-muted-foreground">Income vs Expenses</p>
                                            </div>
                                            {trendCurrencies.length > 1 && (
                                                <Select value={trendCurrency} onValueChange={setTrendCurrency}>
                                                    <SelectTrigger className="w-24 h-7 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {trendCurrencies.map((c) => (
                                                            <SelectItem key={c} value={c}>{c}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer
                                            config={{
                                                income: { label: 'Income', color: '#10b981' },
                                                expense: { label: 'Expense', color: '#ef4444' },
                                            }}
                                            className="h-[200px]"
                                        >
                                            <LineChart data={trendChartData}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="month" className="text-xs" />
                                                <YAxis className="text-xs" tickFormatter={(v) => formatCurrency(v, trendCurrency)} />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            </LineChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-border/40">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Accounts</CardTitle>
                                    <Badge variant="secondary" className="text-xs">{accounts.length}</Badge>
                                </div>
                            </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {accounts.slice(0, 5).map((account) => (
                                    <div key={account.id} className="flex items-center gap-3 rounded-lg border border-border/40 p-3 hover:bg-muted transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium truncate">{account.name}</p>
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                                    {account.type.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {account.balance >= 0 ? 'Active' : 'Overdrawn'}
                                            </p>
                                        </div>
                                        <div className="text-sm font-semibold">{formatCurrency(account.balance, account.currency)}</div>
                                    </div>
                                ))}
                            </div>
                            {accounts.length === 0 && (
                                <p className="text-sm text-muted-foreground">No accounts yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border/40">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold">Recent Transactions</CardTitle>
                                <Badge variant="secondary" className="text-xs">{recentTransactions.length}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentTransactions.slice(0, 5).map((transaction) => (
                                    <div key={transaction.id} className="flex items-center gap-3 rounded-lg border border-border/40 p-3 hover:bg-muted transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium truncate">{transaction.description}</p>
                                                <Badge
                                                    variant={transaction.type === 'expense' ? 'secondary' : 'default'}
                                                    className={`text-[10px] px-1.5 py-0 ${transaction.type === 'expense' ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-green-500/10 text-green-600 border-green-500/20'}`}
                                                >
                                                    {transaction.type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <p className="text-xs text-muted-foreground">{transaction.account.name}</p>
                                                <span className="text-xs text-muted-foreground">•</span>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-muted-foreground" />
                                                    <p className="text-xs text-muted-foreground">{formatDate(transaction.transaction_date)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`text-sm font-semibold ${
                                            transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                                        }`}>
                                            {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount, transaction.account.currency)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {recentTransactions.length === 0 && (
                                <p className="text-sm text-muted-foreground">No transactions yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    {budgetAlerts.length > 0 && (
                        <Card className="border-border/40">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold">Budget Alerts</CardTitle>
                                    <Badge variant="destructive" className="text-xs">{budgetAlerts.length}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {budgetAlerts.map((budget) => (
                                        <div key={budget.id} className="flex items-center gap-3 rounded-lg border border-border/40 p-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium truncate">{budget.category}</p>
                                                    <Badge 
                                                        variant={budget.status === 'exceeded' ? 'destructive' : 'default'}
                                                        className={budget.status === 'warning' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20' : ''}
                                                    >
                                                        {budget.percentage.toFixed(0)}%
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {formatCurrency(budget.spent, budget.currency)} of {formatCurrency(budget.amount, budget.currency)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {upcomingReminders.length > 0 && (
                        <Card className="border-border/40">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold">Upcoming Bills</CardTitle>
                                    <Badge variant="secondary" className="text-xs">{upcomingReminders.length}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {upcomingReminders.map((reminder) => {
                                        const dueDate = new Date(reminder.due_date);
                                        const isOverdue = dueDate < new Date();
                                        const isDueToday = dueDate.toDateString() === new Date().toDateString();
                                        
                                        return (
                                            <div key={reminder.id} className="flex items-center gap-3 rounded-lg border border-border/40 p-3 hover:bg-muted transition-colors">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-medium truncate">{reminder.title}</p>
                                                        {isOverdue && (
                                                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                                                Overdue
                                                            </Badge>
                                                        )}
                                                        {isDueToday && !isOverdue && (
                                                            <Badge className="text-[10px] px-1.5 py-0 bg-orange-500/10 text-orange-600 border-orange-500/20">
                                                                Today
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        {reminder.category && (
                                                            <>
                                                                <p className="text-xs text-muted-foreground">{reminder.category.name}</p>
                                                                <span className="text-xs text-muted-foreground">•</span>
                                                            </>
                                                        )}
                                                        <p className="text-xs text-muted-foreground">
                                                            {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {reminder.amount && (
                                                    <div className="text-sm font-semibold">
                                                        {formatCurrency(reminder.amount, primaryCurrency)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
            </div>
        </AppLayout>
    );
}
