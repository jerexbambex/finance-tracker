import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Wallet, TrendingUp, PieChart, Target, Calendar, Bell, Shield, Lock, Zap, ArrowRight, CheckCircle2, BarChart3, Users } from 'lucide-react';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { Card } from '@/components/ui/card';

export default function Welcome({ canRegister = true, testimonials = [] }: { canRegister?: boolean; testimonials?: Array<{ name: string; content: string; rating: number }> }) {
    const { auth } = usePage<SharedData>().props;

    const features = [
        { icon: Wallet, title: 'Multi-Account Tracking', description: 'Track all your accounts in one place with multi-currency support' },
        { icon: PieChart, title: 'Smart Budgets', description: 'Set budgets and get alerts when approaching limits' },
        { icon: Target, title: 'Financial Goals', description: 'Set and track progress towards your savings goals' },
        { icon: TrendingUp, title: 'Insights & Reports', description: 'Visualize your financial data with powerful analytics' },
        { icon: Calendar, title: 'Recurring Transactions', description: 'Automate tracking of regular income and expenses' },
        { icon: Bell, title: 'Smart Notifications', description: 'Stay informed with timely alerts and reminders' },
    ];

    return (
        <>
            <Head title="Welcome to Budget App" />
            <div className="flex min-h-screen flex-col">
                {/* Navigation */}
                <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
                    <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                                <Wallet className="h-5 w-5 text-background" />
                            </div>
                            <span className="text-xl font-semibold tracking-tight">Budget App</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <AppearanceToggleDropdown />
                            {auth.user ? (
                                <Link href={dashboard()} className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-5 h-10 text-sm font-medium hover:opacity-90 transition-opacity">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-flex">
                                        Log in
                                    </Link>
                                    {canRegister && (
                                        <Link href={register()} className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-5 h-10 text-sm font-medium hover:opacity-90 transition-opacity">
                                            Get Started
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
                    <div className="container mx-auto max-w-7xl px-6 py-20 sm:py-28 md:py-36 lg:py-44">
                        <div className="mx-auto max-w-4xl text-center space-y-8">
                            <div className="inline-flex items-center gap-2 rounded-full border bg-background/50 backdrop-blur-sm px-3.5 py-1.5 text-sm shadow-sm">
                                <Zap className="h-3.5 w-3.5 text-primary" />
                                <span className="text-muted-foreground">Trusted by thousands worldwide</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                                Financial management
                                <br />
                                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    that just works
                                </span>
                            </h1>
                            <p className="mx-auto max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                                Budget App brings clarity, structure, and flow to your finances with zero tolerance for bloat or complexity.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                                {auth.user ? (
                                    <Link href={dashboard()} className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-7 h-12 text-base font-medium hover:opacity-90 transition-opacity shadow-sm">
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                ) : (
                                    <>
                                        {canRegister && (
                                            <Link href={register()} className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-7 h-12 text-base font-medium hover:opacity-90 transition-opacity shadow-sm">
                                                Get Started Free
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        )}
                                        <Link href={login()} className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-7 h-12 text-base font-medium hover:bg-accent transition-colors">
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-2">
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span>Free forever</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                    <span>Bank-level security</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Proof */}
                <section className="border-y bg-muted/30">
                    <div className="container mx-auto max-w-7xl px-6 py-12">
                        <div className="grid gap-8 sm:grid-cols-3 text-center">
                            <div className="space-y-1">
                                <div className="text-3xl sm:text-4xl font-bold tracking-tight">$1M+</div>
                                <p className="text-sm text-muted-foreground">Money tracked</p>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl sm:text-4xl font-bold tracking-tight">50K+</div>
                                <p className="text-sm text-muted-foreground">Transactions logged</p>
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl sm:text-4xl font-bold tracking-tight">10K+</div>
                                <p className="text-sm text-muted-foreground">Active users</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="container mx-auto max-w-7xl px-6 py-20 sm:py-24 md:py-28">
                    <div className="text-center space-y-4 mb-14">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                            Everything you need
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            A complete financial management ecosystem in one unified workspace
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <Card key={i} className="group relative overflow-hidden border bg-card p-7 hover:shadow-md transition-all duration-200">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    <div className="relative space-y-3.5">
                                        <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </section>

                {/* Why Choose Section */}
                <section className="border-y bg-muted/30">
                    <div className="container mx-auto max-w-7xl px-6 py-20 sm:py-24 md:py-28">
                        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                            <div className="space-y-6">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                                    Why teams choose Budget App
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Stop juggling spreadsheets and multiple apps. Budget App brings everything together in one place, making financial management simple and stress-free.
                                </p>
                                <div className="space-y-4 pt-2">
                                    <div className="flex gap-3">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Simple by design</h3>
                                            <p className="text-sm text-muted-foreground">No complex setup or learning curve. Start tracking in minutes.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Powerful insights</h3>
                                            <p className="text-sm text-muted-foreground">Understand your spending patterns with beautiful visualizations.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 mt-0.5">
                                            <CheckCircle2 className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">Your data, your way</h3>
                                            <p className="text-sm text-muted-foreground">Bank-level encryption keeps your financial data secure and private.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-3xl" />
                                <Card className="relative p-8 shadow-lg">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between pb-4 border-b">
                                            <span className="text-sm font-medium text-muted-foreground">Monthly Overview</span>
                                            <span className="text-xs text-muted-foreground">January 2026</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <p className="text-xs text-muted-foreground">Income</p>
                                                <p className="text-2xl font-bold text-green-600">$5,240</p>
                                                <p className="text-xs text-green-600">+12% from last month</p>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-xs text-muted-foreground">Expenses</p>
                                                <p className="text-2xl font-bold text-red-600">$3,180</p>
                                                <p className="text-xs text-red-600">-8% from last month</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 pt-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Savings Goal</span>
                                                <span className="font-medium">68%</span>
                                            </div>
                                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full" style={{ width: '68%' }} />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section className="container mx-auto max-w-7xl px-6 py-20 sm:py-24 md:py-28">
                    <div className="text-center space-y-4 mb-14">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                            Loved by users worldwide
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Join thousands who've taken control of their finances
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {(testimonials.length > 0 ? testimonials : [
                            { name: 'Sarah Johnson', content: 'This app completely changed how I manage my finances. I finally have control over my spending!', rating: 5 },
                            { name: 'Michael Chen', content: 'The budget tracking features are incredible. I can see exactly where my money goes each month.', rating: 5 },
                            { name: 'Emily Rodriguez', content: 'Simple, intuitive, and powerful. I reached my savings goal 3 months early thanks to this app!', rating: 5 },
                        ]).map((testimonial, i) => (
                            <Card key={i} className="p-6 space-y-4 hover:shadow-md transition-shadow">
                                <div className="flex gap-0.5">
                                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                                        <span key={i} className="text-yellow-500 text-sm">★</span>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">"{testimonial.content}"</p>
                                <div className="flex items-center gap-3 pt-2 border-t">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div className="font-medium text-sm">{testimonial.name}</div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="border-t bg-muted/30">
                    <div className="container mx-auto max-w-7xl px-6 py-20 sm:py-24 md:py-28">
                        <div className="mx-auto max-w-3xl text-center space-y-8">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                                Ready to take control?
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Join thousands managing their money smarter with Budget App
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                {auth.user ? (
                                    <Link href={dashboard()} className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-7 h-12 text-base font-medium hover:opacity-90 transition-opacity shadow-sm">
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                ) : (
                                    <>
                                        {canRegister && (
                                            <Link href={register()} className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-7 h-12 text-base font-medium hover:opacity-90 transition-opacity shadow-sm">
                                                Start Free Today
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Link>
                                        )}
                                        <Link href={login()} className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-7 h-12 text-base font-medium hover:bg-accent transition-colors">
                                            Sign In
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t">
                    <div className="container mx-auto max-w-7xl px-6 py-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground">
                                    <Wallet className="h-4 w-4 text-background" />
                                </div>
                                <span className="font-semibold">Budget App</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                © {new Date().getFullYear()} Budget App. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
