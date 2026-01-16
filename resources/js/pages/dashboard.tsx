import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Clock } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import AppLayout from '@/layouts/app-layout';
import QuickAddTransaction from '@/components/QuickAddTransaction';
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
}

interface Transaction {
    id: string;
    type: string;
    amount: number;
    description: string;
    transaction_date: string;
    account: { name: string };
    category?: { name: string };
}

interface Budget {
    category: string;
    percentage: number;
}

interface Goal {
    name: string;
    percentage: number;
}

interface CategorySpending {
    name: string;
    amount: number;
    color: string;
}

interface MonthlyTrend {
    month: string;
    income: number;
    expense: number;
}

interface Props {
    accounts: Account[];
    totalBalance: number;
    recentTransactions: Transaction[];
    monthlyIncome: number;
    monthlyExpenses: number;
    categorySpending: CategorySpending[];
    monthlyTrend: MonthlyTrend[];
    budgets: Budget[];
    goals: Goal[];
    categories: Category[];
}

export default function Dashboard({ accounts, totalBalance, recentTransactions, monthlyIncome, monthlyExpenses, categorySpending, monthlyTrend, budgets, goals, categories }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (d.toDateString() === today.toDateString()) return 'Today';
        if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const netIncome = monthlyIncome - monthlyExpenses;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex-1 space-y-6 p-6 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
                            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
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
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</div>
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
                            <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</div>
                            <p className="text-xs text-muted-foreground mt-1">This month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border/40">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${netIncome >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                <TrendingUp className={`h-[18px] w-[18px] ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(netIncome)}
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
                                                    <p className="text-sm font-semibold">{formatCurrency(category.amount)}</p>
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
                                        <CardTitle>6-Month Trend</CardTitle>
                                        <p className="text-xs text-muted-foreground">Income vs Expenses</p>
                                    </CardHeader>
                                    <CardContent>
                                        <ChartContainer
                                            config={{
                                                income: { label: 'Income', color: '#10b981' },
                                                expense: { label: 'Expense', color: '#ef4444' },
                                            }}
                                            className="h-[200px]"
                                        >
                                            <BarChart data={monthlyTrend}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="month" className="text-xs" />
                                                <YAxis className="text-xs" />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                            </BarChart>
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
                                    <div key={account.id} className="flex items-center gap-3 rounded-lg border border-border/40 p-3 hover:bg-accent transition-colors">
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
                                        <div className="text-sm font-semibold">{formatCurrency(account.balance)}</div>
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
                                    <div key={transaction.id} className="flex items-center gap-3 rounded-lg border border-border/40 p-3 hover:bg-accent transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium truncate">{transaction.description}</p>
                                                <Badge 
                                                    variant={transaction.type === 'income' ? 'default' : 'secondary'} 
                                                    className={`text-[10px] px-1.5 py-0 ${transaction.type === 'income' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}
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
                                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {recentTransactions.length === 0 && (
                                <p className="text-sm text-muted-foreground">No transactions yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            </div>
        </AppLayout>
    );
}
