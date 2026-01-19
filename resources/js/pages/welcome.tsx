import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Wallet, TrendingUp, PieChart, Target, ArrowRight, DollarSign, Calendar, Bell, Shield, Lock, CheckCircle } from 'lucide-react';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

export default function Welcome({ canRegister = true, testimonials = [] }: { canRegister?: boolean; testimonials?: Array<{ name: string; content: string; rating: number }> }) {
    const { auth } = usePage<SharedData>().props;
    const [activeFeature, setActiveFeature] = useState(0);
    const [showFloatingCTA, setShowFloatingCTA] = useState(false);
    const [animatedCount, setAnimatedCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setShowFloatingCTA(window.scrollY > 600);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const target = 1000000;
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setAnimatedCount(target);
                clearInterval(timer);
            } else {
                setAnimatedCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, []);

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
                <section className="container mx-auto flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 md:py-24 lg:py-32 relative overflow-hidden">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 -z-10 overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
                    </div>

                    <div className="flex max-w-[980px] flex-col items-center gap-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-muted-foreground">Trusted by thousands of users</span>
                        </div>
                        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
                            Take Control of Your Financial Future
                        </h1>
                        <p className="max-w-[750px] text-lg text-muted-foreground sm:text-xl">
                            Track expenses, set budgets, and achieve your financial goals with our powerful yet simple budget management tool.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <Shield className="h-4 w-4" />
                            <span>Bank-level security</span>
                            <span className="mx-2">•</span>
                            <Lock className="h-4 w-4" />
                            <span>Your data is encrypted</span>
                        </div>
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
                        <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                                            className={`relative overflow-hidden rounded-lg border bg-background p-2 text-left transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-700 ${
                                                activeFeature === index ? 'ring-2 ring-primary shadow-md' : ''
                                            }`}
                                            style={{ animationDelay: `${index * 100}ms` }}
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
                            <div className="lg:sticky lg:top-20 h-fit animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
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
                            <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                                    <DollarSign className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-3xl font-bold">${(animatedCount / 1000000).toFixed(1)}M+</h3>
                                <p className="text-sm text-muted-foreground">Money tracked</p>
                            </div>
                            <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                                    <Calendar className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-3xl font-bold">50K+</h3>
                                <p className="text-sm text-muted-foreground">Transactions logged</p>
                            </div>
                            <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                                    <Bell className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-3xl font-bold">10K+</h3>
                                <p className="text-sm text-muted-foreground">Budget alerts sent</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16 border-t">
                    <div className="mx-auto max-w-5xl space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Get started in 3 simple steps</h2>
                            <p className="text-muted-foreground">Start managing your finances in minutes</p>
                        </div>
                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                { step: '01', title: 'Create Account', description: 'Sign up for free in seconds. No credit card required.', icon: '👤' },
                                { step: '02', title: 'Add Accounts', description: 'Connect your bank accounts or add them manually.', icon: '🏦' },
                                { step: '03', title: 'Start Tracking', description: 'Set budgets, track expenses, and achieve your goals.', icon: '📊' },
                            ].map((item, i) => (
                                <div key={i} className="relative">
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="relative">
                                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
                                                {item.icon}
                                            </div>
                                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                                {item.step}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="font-bold text-lg">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                        </div>
                                    </div>
                                    {i < 2 && (
                                        <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border">
                                            <ArrowRight className="absolute -right-2 -top-2 h-5 w-5 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="container mx-auto px-4 py-8 md:py-12 lg:py-16 border-t bg-muted/30">
                    <div className="mx-auto max-w-5xl space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Loved by users worldwide</h2>
                            <p className="text-muted-foreground">See what our users have to say</p>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {testimonials.length > 0 ? (
                                testimonials.map((testimonial, i) => (
                                    <Card key={i} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                                        <div className="flex gap-1">
                                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                <span key={i} className="text-yellow-500">★</span>
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground italic">"{testimonial.content}"</p>
                                        <div className="flex items-center gap-3 pt-2 border-t">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                                                {testimonial.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{testimonial.name}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                // Fallback testimonials
                                [
                                    {
                                        name: 'Sarah Johnson',
                                        role: 'Freelancer',
                                        content: 'This app completely changed how I manage my finances. I finally have control over my spending!',
                                        avatar: '👩‍💼',
                                        rating: 5,
                                    },
                                    {
                                        name: 'Michael Chen',
                                        role: 'Small Business Owner',
                                        content: 'The budget tracking features are incredible. I can see exactly where my money goes each month.',
                                        avatar: '👨‍💻',
                                        rating: 5,
                                    },
                                    {
                                        name: 'Emily Rodriguez',
                                        role: 'Teacher',
                                        content: 'Simple, intuitive, and powerful. I reached my savings goal 3 months early thanks to this app!',
                                        avatar: '👩‍🏫',
                                        rating: 5,
                                    },
                                ].map((testimonial, i) => (
                                    <Card key={i} className="p-6 space-y-4 hover:shadow-lg transition-shadow">
                                        <div className="flex gap-1">
                                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                <span key={i} className="text-yellow-500">★</span>
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground italic">"{testimonial.content}"</p>
                                        <div className="flex items-center gap-3 pt-2 border-t">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                                                {testimonial.avatar}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{testimonial.name}</p>
                                                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="container mx-auto px-4 py-16 md:py-24">
                    <div className="mx-auto max-w-3xl text-center space-y-6">
                        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                            Ready to take control of your finances?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Join thousands of users who are already managing their money smarter.
                        </p>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-11 px-8"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-11 px-8"
                                        >
                                            Start Free Today
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    )}
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-11 px-8"
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            No credit card required • Free forever • Cancel anytime
                        </p>
                    </div>
                </section>

                {/* Floating CTA */}
                {!auth.user && showFloatingCTA && (
                    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-500">
                        <Link
                            href={canRegister ? register() : login()}
                            className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 h-12 px-6"
                        >
                            {canRegister ? 'Get Started Free' : 'Sign In'}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                )}

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
