import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import {
    Wallet, TrendingUp, PieChart, Target, Calendar, Bell,
    Shield, Lock, Zap, ArrowRight, CheckCircle2, BarChart3,
    Users, ChevronRight, LayoutDashboard, Database, UserPlus, Building2,
    Award, Star, HelpCircle, ChevronDown
} from 'lucide-react';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Card } from '@/components/ui/card';
import { useState, useEffect, useRef } from 'react';

export default function Welcome({ canRegister = true, testimonials = [] }: { canRegister?: boolean; testimonials?: Array<{ name: string; content: string; rating: number }> }) {
    const { auth } = usePage<SharedData>().props;
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
        
        return () => observer.disconnect();
    }, []);
    
    const faqs = [
        {
            question: "Is Budget App really free?",
            answer: "Yes! Budget App is completely free to use with all core features included. We believe everyone should have access to powerful financial tools."
        },
        {
            question: "How secure is my financial data?",
            answer: "We use bank-level 256-bit encryption and are SOC 2 compliant. Your data is encrypted both in transit and at rest. We never sell your data to third parties."
        },
        {
            question: "Can I import my existing transactions?",
            answer: "Yes, you can import transactions via CSV files from your bank or other financial apps. We support most common formats."
        },
        {
            question: "Do you support multiple currencies?",
            answer: "Absolutely! We support 150+ currencies with real-time exchange rates, making it perfect for international users and travelers."
        },
        {
            question: "Can I share my budget with family members?",
            answer: "Yes, you can invite family members to collaborate on shared budgets and accounts while maintaining individual privacy for personal accounts."
        },
        {
            question: "Is there a mobile app?",
            answer: "Our web app is fully responsive and works great on mobile browsers. Native iOS and Android apps are coming soon!"
        }
    ];
    
    const features = [
        {
            icon: PieChart,
            title: 'Smart Budgeting',
            description: 'Set custom budgets and visualize spending patterns effortlessly.',
            stat: '95%',
            statLabel: 'Budget accuracy',
            image: '/images/budgets-preview.png',
            className: "col-span-1 md:col-span-2 lg:col-span-2 row-span-2"
        },
        {
            icon: Target,
            title: 'Goal Tracking',
            description: 'Create and track financial goals to reach your dreams faster.',
            stat: '3x',
            statLabel: 'Faster goal achievement',
            image: '/images/goals-preview.png',
            className: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1"
        },
        {
            icon: TrendingUp,
            title: 'Insights',
            description: 'Deep analytics to understand your money flow.',
            stat: '10+',
            statLabel: 'Report types',
            image: '/images/insights-preview.png',
            className: "col-span-1 md:col-span-1 lg:col-span-1 row-span-1"
        },
        {
            icon: Wallet,
            title: 'Multi-Currency',
            description: 'Manage accounts across different currencies seamlessly.',
            stat: '150+',
            statLabel: 'Currencies supported',
            image: '/images/accounts-preview.png',
            className: "col-span-1 md:col-span-3 lg:col-span-3 row-span-1"
        },
    ];

    return (
        <>
            <Head title="Welcome" />
            
            <style>{`
                .fade-in {
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                }
                .fade-in.animate-in {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>

            <div className="relative min-h-screen bg-background selection:bg-primary selection:text-white scroll-smooth">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary opacity-20 blur-[100px]"></div>
                </div>

                {/* Navigation */}
                <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
                    <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-foreground">
                                <Wallet className="h-4 w-4" strokeWidth={1.5} />
                            </div>
                            <span className="text-xl font-bold tracking-tight">Budget App</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <AppearanceToggleDropdown />
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="h-9 inline-flex items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="hidden sm:flex h-9 items-center justify-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <main className="pt-32 pb-16">
                    {/* Hero Section */}
                    <div className="container mx-auto max-w-7xl px-6">
                        <div className="flex flex-col items-center text-center space-y-8 mb-24">
                            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-secondary/50 backdrop-blur-sm">
                                <Zap className="h-3.5 w-3.5 text-primary mr-2" strokeWidth={1.5} />
                                Get started in minutes • No credit card required
                            </div>

                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
                                Take control of your{' '}
                                <span className="text-primary">financial future</span>
                            </h1>

                            <p className="max-w-2xl text-xl text-muted-foreground leading-relaxed">
                                The complete financial management platform. Track spending, create budgets, and achieve your goals with beautiful, intuitive tools.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="h-12 px-8 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                    >
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 h-5 w-5" strokeWidth={1.5} />
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={register()}
                                            className="h-12 px-8 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                        >
                                            Start for Free
                                            <ArrowRight className="ml-2 h-5 w-5" strokeWidth={1.5} />
                                        </Link>
                                        <Link
                                            href="#features"
                                            className="h-12 px-8 inline-flex items-center justify-center rounded-lg border-2 bg-background hover:bg-accent transition-all font-semibold hover:scale-105"
                                        >
                                            See How It Works
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
                                <div className="space-y-2">
                                    <div className="text-3xl md:text-4xl font-bold text-primary">10K+</div>
                                    <div className="text-sm text-muted-foreground">Active Users</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl md:text-4xl font-bold text-primary">$1M+</div>
                                    <div className="text-sm text-muted-foreground">Money Tracked</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-3xl md:text-4xl font-bold text-primary">50K+</div>
                                    <div className="text-sm text-muted-foreground">Transactions</div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <span>Bank-level security</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Lock className="h-4 w-4 text-primary" />
                                    <span>256-bit encryption</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-primary" />
                                    <span>SOC 2 compliant</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Star className="h-4 w-4 text-primary" />
                                    <span>4.9/5 rating</span>
                                </div>
                            </div>

                            {/* Dashboard Preview */}
                            <div className="relative mt-16 w-full max-w-6xl mx-auto rounded-2xl border-2 bg-card shadow-2xl overflow-hidden backdrop-blur-sm group">
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none"></div>
                                
                                {/* Browser Chrome */}
                                <div className="bg-muted/50 border-b px-4 py-3 flex items-center gap-2">
                                    <div className="flex gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
                                        <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                                        <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                                    </div>
                                    <div className="flex-1 mx-4 h-6 rounded bg-background/50 border px-3 flex items-center text-xs text-muted-foreground">
                                        <Lock className="h-3 w-3 mr-2" />
                                        budgetapp.com/dashboard
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-primary/10 via-orange-500/10 to-background p-8">
                                    <div className="bg-background rounded-xl border shadow-lg p-6 space-y-6">
                                        {/* Header */}
                                        <div className="flex items-center justify-between pb-4 border-b">
                                            <div>
                                                <div className="text-sm text-muted-foreground">Welcome back, Alex</div>
                                                <div className="text-2xl font-bold mt-1">Financial Overview</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-9 px-3 rounded-lg bg-muted flex items-center gap-2 text-sm font-medium">
                                                    <Calendar className="h-4 w-4" />
                                                    Jan 2026
                                                </div>
                                                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                                    <Bell className="h-4 w-4 text-primary" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Balance Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-5 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-medium text-muted-foreground">Total Balance</div>
                                                    <Wallet className="h-4 w-4 text-primary" />
                                                </div>
                                                <div className="text-3xl font-bold">$12,450.00</div>
                                                <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                                    <TrendingUp className="h-3 w-3" />
                                                    <span>+12.5% from last month</span>
                                                </div>
                                            </div>

                                            <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border border-blue-500/20 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-medium text-muted-foreground">Income</div>
                                                    <TrendingUp className="h-4 w-4 text-blue-500" />
                                                </div>
                                                <div className="text-3xl font-bold">$5,240.00</div>
                                                <div className="text-xs text-muted-foreground">This month</div>
                                            </div>

                                            <div className="p-5 rounded-xl bg-gradient-to-br from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/20 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm font-medium text-muted-foreground">Expenses</div>
                                                    <PieChart className="h-4 w-4 text-orange-500" />
                                                </div>
                                                <div className="text-3xl font-bold">$3,180.00</div>
                                                <div className="text-xs text-muted-foreground">This month</div>
                                            </div>
                                        </div>

                                        {/* Charts & Activity */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Spending Chart */}
                                            <div className="p-5 rounded-xl border bg-card space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="font-semibold">Spending Trends</div>
                                                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex items-end justify-between gap-2 h-32">
                                                    <div className="flex-1 flex flex-col justify-end items-center gap-2">
                                                        <div className="w-full bg-primary/20 rounded-t" style={{height: '60%'}}></div>
                                                        <div className="text-xs text-muted-foreground">Mon</div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-end items-center gap-2">
                                                        <div className="w-full bg-primary/20 rounded-t" style={{height: '80%'}}></div>
                                                        <div className="text-xs text-muted-foreground">Tue</div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-end items-center gap-2">
                                                        <div className="w-full bg-primary/20 rounded-t" style={{height: '45%'}}></div>
                                                        <div className="text-xs text-muted-foreground">Wed</div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-end items-center gap-2">
                                                        <div className="w-full bg-primary/20 rounded-t" style={{height: '90%'}}></div>
                                                        <div className="text-xs text-muted-foreground">Thu</div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-end items-center gap-2">
                                                        <div className="w-full bg-primary rounded-t" style={{height: '100%'}}></div>
                                                        <div className="text-xs font-medium">Fri</div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-end items-center gap-2">
                                                        <div className="w-full bg-primary/20 rounded-t" style={{height: '70%'}}></div>
                                                        <div className="text-xs text-muted-foreground">Sat</div>
                                                    </div>
                                                    <div className="flex-1 flex flex-col justify-end items-center gap-2">
                                                        <div className="w-full bg-primary/20 rounded-t" style={{height: '35%'}}></div>
                                                        <div className="text-xs text-muted-foreground">Sun</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Recent Transactions */}
                                            <div className="p-5 rounded-xl border bg-card space-y-4">
                                                <div className="font-semibold">Recent Activity</div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                                                                <span className="text-lg">🍕</span>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium">Pizza Palace</div>
                                                                <div className="text-xs text-muted-foreground">Food & Dining</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-semibold text-red-600 dark:text-red-400">-$28.50</div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                                                                <span className="text-lg">💰</span>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium">Salary Deposit</div>
                                                                <div className="text-xs text-muted-foreground">Income</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">+$5,240.00</div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                                <span className="text-lg">⚡</span>
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium">Electric Bill</div>
                                                                <div className="text-xs text-muted-foreground">Utilities</div>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm font-semibold text-red-600 dark:text-red-400">-$142.00</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Budget Progress */}
                                        <div className="p-5 rounded-xl border bg-card space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="font-semibold">Budget Overview</div>
                                                <div className="text-sm text-muted-foreground">January 2026</div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium">Food & Dining</span>
                                                        <span className="text-muted-foreground">$450 / $600</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full" style={{width: '75%'}}></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium">Transportation</span>
                                                        <span className="text-muted-foreground">$180 / $200</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 rounded-full" style={{width: '90%'}}></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="font-medium">Entertainment</span>
                                                        <span className="text-muted-foreground">$85 / $150</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500 rounded-full" style={{width: '57%'}}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bento Grid Features */}
                        <div id="features" className="py-24 space-y-12 fade-in">
                            <div className="text-center space-y-4">
                                <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-secondary/50">
                                    <LayoutDashboard className="h-3.5 w-3.5 text-primary mr-2" strokeWidth={1.5} />
                                    Features
                                </div>
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Everything you need</h2>
                                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                    Powerful features wrapped in a simple, elegant interface that just works.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
                                {features.map((feature, i) => (
                                    <div
                                        key={i}
                                        className={`group relative overflow-hidden rounded-2xl border bg-card hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 ${feature.className}`}
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <feature.icon className="h-32 w-32" />
                                        </div>
                                        
                                        <div className="relative h-full flex flex-col justify-between p-8 space-y-6">
                                            <div className="space-y-4">
                                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                                                    <feature.icon className="h-6 w-6 text-primary-foreground" strokeWidth={1.5} />
                                                </div>
                                                <h3 className="text-2xl font-bold">{feature.title}</h3>
                                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                                            </div>

                                            {/* Visual Preview */}
                                            <div className="space-y-4">
                                                {i === 0 && (
                                                    // Budgets Preview
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="font-medium">Food & Dining</span>
                                                            <span className="text-muted-foreground">$450 / $600</span>
                                                        </div>
                                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary w-3/4"></div>
                                                        </div>
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="font-medium">Transportation</span>
                                                            <span className="text-muted-foreground">$180 / $200</span>
                                                        </div>
                                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                            <div className="h-full bg-blue-500 w-[90%]"></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {i === 1 && (
                                                    // Goals Preview
                                                    <div className="p-4 rounded-lg border bg-background/50 space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-2xl">🎯</span>
                                                                <span className="font-semibold text-sm">Emergency Fund</span>
                                                            </div>
                                                            <span className="text-sm font-bold">52%</span>
                                                        </div>
                                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary w-1/2"></div>
                                                        </div>
                                                    </div>
                                                )}
                                                {i === 2 && (
                                                    // Insights Preview
                                                    <div className="grid grid-cols-3 gap-2">
                                                        <div className="h-16 rounded-lg bg-gradient-to-t from-primary/20 to-primary/5 border"></div>
                                                        <div className="h-16 rounded-lg bg-gradient-to-t from-blue-500/20 to-blue-500/5 border"></div>
                                                        <div className="h-16 rounded-lg bg-gradient-to-t from-green-500/20 to-green-500/5 border"></div>
                                                    </div>
                                                )}
                                                {i === 3 && (
                                                    // Multi-Currency Preview
                                                    <div className="flex gap-3">
                                                        <div className="flex-1 p-3 rounded-lg border bg-background/50">
                                                            <div className="text-xs text-muted-foreground">USD</div>
                                                            <div className="text-lg font-bold">$12,450</div>
                                                        </div>
                                                        <div className="flex-1 p-3 rounded-lg border bg-background/50">
                                                            <div className="text-xs text-muted-foreground">EUR</div>
                                                            <div className="text-lg font-bold">€8,320</div>
                                                        </div>
                                                        <div className="flex-1 p-3 rounded-lg border bg-background/50">
                                                            <div className="text-xs text-muted-foreground">GBP</div>
                                                            <div className="text-lg font-bold">£6,890</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pt-4 border-t">
                                                <div className="text-3xl font-bold text-primary">{feature.stat}</div>
                                                <div className="text-sm text-muted-foreground">{feature.statLabel}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="py-24 border-t fade-in">
                            <div className="text-center mb-16 space-y-4">
                                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Get started in 3 simple steps</h2>
                                <p className="text-lg text-muted-foreground">Start managing your finances in minutes</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="relative group">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="relative">
                                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <UserPlus className="h-8 w-8 text-primary-foreground" strokeWidth={1.5} />
                                            </div>
                                            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 flex items-center justify-center font-bold text-sm">
                                                01
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold">Create Account</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Sign up for free in seconds. No credit card required.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="relative">
                                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <Building2 className="h-8 w-8 text-primary-foreground" strokeWidth={1.5} />
                                            </div>
                                            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 flex items-center justify-center font-bold text-sm">
                                                02
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold">Add Accounts</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Connect your bank accounts or add them manually.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative group">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="relative">
                                            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <BarChart3 className="h-8 w-8 text-primary-foreground" strokeWidth={1.5} />
                                            </div>
                                            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-background border-2 flex items-center justify-center font-bold text-sm">
                                                03
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold">Start Tracking</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Set budgets, track expenses, and achieve your goals.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonials */}
                        <div className="py-24 border-t fade-in">
                            <div className="text-center mb-16 space-y-4">
                                <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-secondary/50">
                                    <Users className="h-3.5 w-3.5 text-primary mr-2" strokeWidth={1.5} />
                                    Testimonials
                                </div>
                                <h2 className="text-4xl font-bold tracking-tight">Loved by thousands</h2>
                                <p className="text-lg text-muted-foreground">See what our users have to say</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(testimonials.length > 0 ? testimonials : [
                                    { name: "Alex Dore", role: "Freelancer", content: "Best financial decision I've made this year. The clarity is unmatched.", rating: 5 },
                                    { name: "Sarah Jin", role: "Designer", content: "Finally, a budgeting app that doesn't feel like a spreadsheet. Beautiful UI.", rating: 5 },
                                    { name: "Mike Ross", role: "Developer", content: "The API integrations and automated categorization save me hours every week.", rating: 5 }
                                ]).map((t, i) => (
                                    <div key={i} className="p-6 rounded-2xl border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-300 space-y-4">
                                        <div className="flex gap-1">
                                            {[...Array(t.rating || 5)].map((_, i) => (
                                                <span key={i} className="text-yellow-500">★</span>
                                            ))}
                                        </div>
                                        <p className="text-lg leading-relaxed">"{t.content}"</p>
                                        <div className="flex items-center gap-3 pt-4 border-t">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg">
                                                {t.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{t.name}</div>
                                                <div className="text-sm text-muted-foreground">{t.role || 'User'}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="py-24 border-t fade-in">
                            <div className="text-center mb-16 space-y-4">
                                <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-secondary/50">
                                    <HelpCircle className="h-3.5 w-3.5 text-primary mr-2" strokeWidth={1.5} />
                                    FAQ
                                </div>
                                <h2 className="text-4xl font-bold tracking-tight">Frequently asked questions</h2>
                                <p className="text-lg text-muted-foreground">Everything you need to know about Budget App</p>
                            </div>
                            <div className="max-w-3xl mx-auto space-y-4">
                                {faqs.map((faq, i) => (
                                    <div key={i} className="rounded-xl border bg-card overflow-hidden">
                                        <button
                                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                            className="w-full flex items-center justify-between p-6 text-left hover:bg-accent/50 transition-colors"
                                        >
                                            <span className="font-semibold text-lg pr-8">{faq.question}</span>
                                            <ChevronDown 
                                                className={`h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        {openFaq === i && (
                                            <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="py-24 fade-in">
                            <div className="relative rounded-3xl border-2 bg-card px-6 py-24 overflow-hidden shadow-xl">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5"></div>
                                <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
                                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to take control?</h2>
                                    <p className="text-xl text-muted-foreground leading-relaxed">
                                        Join thousands of users managing their finances smarter. Start free, no credit card required.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                        {auth.user ? (
                                            <Link
                                                href={dashboard()}
                                                className="h-14 px-10 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg hover:scale-105"
                                            >
                                                Go to Dashboard
                                                <ArrowRight className="ml-2 h-5 w-5" strokeWidth={1.5} />
                                            </Link>
                                        ) : (
                                            <>
                                                <Link
                                                    href={register()}
                                                    className="h-14 px-10 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg hover:scale-105"
                                                >
                                                    Get Started Free
                                                    <ArrowRight className="ml-2 h-5 w-5" strokeWidth={1.5} />
                                                </Link>
                                                <Link
                                                    href={login()}
                                                    className="h-14 px-10 inline-flex items-center justify-center rounded-lg border-2 bg-background hover:bg-accent font-semibold transition-all"
                                                >
                                                    Sign In
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="border-t py-12 bg-muted/20">
                    <div className="container mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded border-2 border-foreground flex items-center justify-center">
                                <Wallet className="h-3 w-3" strokeWidth={1.5} />
                            </div>
                            <span className="font-bold">Budget App</span>
                        </div>
                        <div className="flex gap-8 text-sm text-muted-foreground">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                            <a href="#" className="hover:text-foreground transition-colors">Twitter</a>
                            <a href="#" className="hover:text-foreground transition-colors">GitHub</a>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Budget App Inc.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
