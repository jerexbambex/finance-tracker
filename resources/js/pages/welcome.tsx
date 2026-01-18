import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Wallet, TrendingUp, PieChart, Target, ArrowRight } from 'lucide-react';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;

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
                    <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                            <div className="flex h-full flex-col justify-between rounded-md p-6">
                                <Wallet className="h-12 w-12 mb-4" />
                                <div className="space-y-2">
                                    <h3 className="font-bold">Track Expenses</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Monitor your spending across multiple accounts and categories.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                            <div className="flex h-full flex-col justify-between rounded-md p-6">
                                <PieChart className="h-12 w-12 mb-4" />
                                <div className="space-y-2">
                                    <h3 className="font-bold">Smart Budgets</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Set monthly budgets and get alerts when approaching limits.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                            <div className="flex h-full flex-col justify-between rounded-md p-6">
                                <Target className="h-12 w-12 mb-4" />
                                <div className="space-y-2">
                                    <h3 className="font-bold">Financial Goals</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Set and track progress towards your savings goals.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                            <div className="flex h-full flex-col justify-between rounded-md p-6">
                                <TrendingUp className="h-12 w-12 mb-4" />
                                <div className="space-y-2">
                                    <h3 className="font-bold">Insights & Reports</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Visualize your financial data with charts and reports.
                                    </p>
                                </div>
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
