import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Wallet, TrendingUp, PieChart, Target, ArrowRight, DollarSign, Calendar, Bell } from 'lucide-react';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { useState } from 'react';
import { Card } from '@/components/ui/card';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            icon: Wallet,
            title: 'Track Expenses',
            description: 'Monitor your spending across multiple accounts and categories.',
            demo: (
                <Card className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Recent Transactions</span>
                        <span className="text-xs text-muted-foreground">Today</span>
                    </div>
                    {[
                        { name: 'Grocery Store', amount: '-$45.20', category: 'Food' },
                        { name: 'Salary Deposit', amount: '+$3,200', category: 'Income' },
                        { name: 'Electric Bill', amount: '-$120.00', category: 'Utilities' },
                    ].map((tx, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded-md hover:bg-accent transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${tx.amount.startsWith('+') ? 'bg-green-500' : 'bg-red-500'}`} />
                                <div>
                                    <p className="text-sm font-medium">{tx.name}</p>
                                    <p className="text-xs text-muted-foreground">{tx.category}</p>
                                </div>
                            </div>
                            <span className={`text-sm font-semibold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.amount}
                            </span>
                        </div>
                    ))}
                </Card>
            ),
        },
        {
            icon: PieChart,
            title: 'Smart Budgets',
            description: 'Set monthly budgets and get alerts when approaching limits.',
            demo: (
                <Card className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Budget Overview</span>
                        <span className="text-xs text-muted-foreground">January</span>
                    </div>
                    {[
                        { category: 'Food & Dining', spent: 450, budget: 600, color: 'bg-blue-500' },
                        { category: 'Transportation', spent: 180, budget: 200, color: 'bg-green-500' },
                        { category: 'Entertainment', spent: 95, budget: 100, color: 'bg-purple-500' },
                    ].map((item, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{item.category}</span>
                                <span className="text-muted-foreground">${item.spent} / ${item.budget}</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className={`h-full ${item.color} transition-all duration-500`} style={{ width: `${(item.spent / item.budget) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </Card>
            ),
        },
        {
            icon: Target,
            title: 'Financial Goals',
            description: 'Set and track progress towards your savings goals.',
            demo: (
                <Card className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Active Goals</span>
                        <span className="text-xs text-muted-foreground">3 goals</span>
                    </div>
                    {[
                        { name: 'Emergency Fund', current: 3500, target: 5000, icon: '🏦' },
                        { name: 'Vacation', current: 1200, target: 2000, icon: '✈️' },
                        { name: 'New Laptop', current: 800, target: 1500, icon: '💻' },
                    ].map((goal, i) => (
                        <div key={i} className="space-y-2 p-2 rounded-md hover:bg-accent transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{goal.icon}</span>
                                    <span className="text-sm font-medium">{goal.name}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{Math.round((goal.current / goal.target) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(goal.current / goal.target) * 100}%` }} />
                            </div>
                            <p className="text-xs text-muted-foreground">${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}</p>
                        </div>
                    ))}
                </Card>
            ),
        },
        {
            icon: TrendingUp,
            title: 'Insights & Reports',
            description: 'Visualize your financial data with charts and reports.',
            demo: (
                <Card className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Summary</span>
                        <span className="text-xs text-muted-foreground">Last 6 months</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-md bg-green-500/10 border border-green-500/20">
                            <p className="text-xs text-muted-foreground">Income</p>
                            <p className="text-lg font-bold text-green-600">$3,200</p>
                            <p className="text-xs text-green-600">+12%</p>
                        </div>
                        <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20">
                            <p className="text-xs text-muted-foreground">Expenses</p>
                            <p className="text-lg font-bold text-red-600">$2,145</p>
                            <p className="text-xs text-red-600">-5%</p>
                        </div>
                        <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20">
                            <p className="text-xs text-muted-foreground">Savings</p>
                            <p className="text-lg font-bold text-blue-600">$1,055</p>
                            <p className="text-xs text-blue-600">+33%</p>
                        </div>
                    </div>
                    <div className="flex items-end justify-between h-24 gap-2">
                        {[65, 45, 80, 55, 70, 85].map((height, i) => (
                            <div key={i} className="flex-1 bg-primary/20 rounded-t-md hover:bg-primary/40 transition-all duration-300" style={{ height: `${height}%` }} />
                        ))}
                    </div>
                </Card>
            ),
        },
    ];

    return (
        <>
            <Head title="Welcome to Budget App" />
            <div className="flex min-h-screen flex-col">
                {/* Navigation */}
                <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container mx-auto flex h-14 max-w-screen-2xl items-center px-4">
                        <div className="mr-4 flex">
                            <Link href="/" className="mr-6 flex items-center space-x-2">
                                <Wallet className="h-6 w-6" />
                                <span className="font-bold">Budget App</span>
                            </Link>
                        </div>
                        <div className="flex flex-1 items-center justify-end space-x-2">
                            <AppearanceToggleDropdown />
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="container mx-auto flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 md:py-24 lg:py-32">
                    <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
                        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
                            Take Control of Your Financial Future
                        </h1>
                        <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                            Track expenses, set budgets, and achieve your financial goals with our powerful yet simple budget management tool.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8"
                            >
                                Go to Dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-8"
                                    >
                                        Get Started
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                )}
                                <Link
                                    href={login()}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 px-8"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                </section>

                {/* Features */}
                <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
                    <div className="mx-auto max-w-6xl space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Everything you need to manage your finances</h2>
                            <p className="text-muted-foreground">Click on any feature to see it in action</p>
                        </div>
                        
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Feature Cards */}
                            <div className="grid gap-4 sm:grid-cols-2">
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setActiveFeature(index)}
                                            className={`relative overflow-hidden rounded-lg border bg-background p-2 text-left transition-all hover:shadow-md ${
                                                activeFeature === index ? 'ring-2 ring-primary shadow-md' : ''
                                            }`}
                                        >
                                            <div className="flex h-full flex-col justify-between rounded-md p-6">
                                                <Icon className={`h-12 w-12 mb-4 transition-colors ${activeFeature === index ? 'text-primary' : ''}`} />
                                                <div className="space-y-2">
                                                    <h3 className="font-bold">{feature.title}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {feature.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Interactive Demo */}
                            <div className="lg:sticky lg:top-20 h-fit">
                                <div className="rounded-lg border bg-muted/50 p-6">
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                            <div className="w-3 h-3 rounded-full bg-green-500" />
                                        </div>
                                        <span className="text-xs text-muted-foreground ml-2">Live Preview</span>
                                    </div>
                                    <div className="transition-all duration-300">
                                        {features[activeFeature].demo}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16 border-t">
                    <div className="mx-auto max-w-5xl">
                        <div className="grid gap-8 sm:grid-cols-3">
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                                    <DollarSign className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-3xl font-bold">$1M+</h3>
                                <p className="text-sm text-muted-foreground">Money tracked</p>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                                    <Calendar className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-3xl font-bold">50K+</h3>
                                <p className="text-sm text-muted-foreground">Transactions logged</p>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                                    <Bell className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-3xl font-bold">10K+</h3>
                                <p className="text-sm text-muted-foreground">Budget alerts sent</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-auto border-t py-6 md:py-0">
                    <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 md:h-24 md:flex-row">
                        <p className="text-center text-sm leading-loose text-muted-foreground">
                            © {new Date().getFullYear()} Budget App. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
