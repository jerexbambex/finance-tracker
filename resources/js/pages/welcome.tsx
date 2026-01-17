import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Wallet, TrendingUp, PieChart, Target, ArrowRight } from 'lucide-react';

export default function Welcome({ canRegister = true }: { canRegister?: boolean }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome to Budget App" />
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950 flex flex-col">
                {/* Navigation */}
                <nav className="border-b border-emerald-100 bg-white/80 backdrop-blur-sm dark:border-emerald-900 dark:bg-gray-900/80">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Wallet className="h-8 w-8 text-emerald-600" />
                                <span className="text-xl font-bold text-gray-900 dark:text-white">Budget App</span>
                            </div>
                            <div className="flex items-center gap-4">
                                {auth.user ? (
                                    <Link
                                        href={dashboard()}
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={login()}
                                            className="text-sm font-medium text-gray-700 hover:text-emerald-600 dark:text-gray-300"
                                        >
                                            Log in
                                        </Link>
                                        {canRegister && (
                                            <Link
                                                href={register()}
                                                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                            >
                                                Get Started
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="flex-1 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
                            Take Control of Your
                            <span className="block text-emerald-600">Financial Future</span>
                        </h1>
                        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                            Track expenses, set budgets, and achieve your financial goals with our powerful yet simple budget management tool.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-4">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-base font-medium text-white hover:bg-emerald-700"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                            ) : (
                                <>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-base font-medium text-white hover:bg-emerald-700"
                                        >
                                            Start Free
                                            <ArrowRight className="h-5 w-5" />
                                        </Link>
                                    )}
                                    <Link
                                        href={login()}
                                        className="rounded-lg border border-emerald-600 px-6 py-3 text-base font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="mt-32 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                                <Wallet className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Track Expenses</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Monitor your spending across multiple accounts and categories in real-time.
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                                <PieChart className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Smart Budgets</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Set monthly budgets and get alerts when you're approaching your limits.
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                                <Target className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Financial Goals</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Set and track progress towards your savings goals and financial milestones.
                            </p>
                        </div>

                        <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                                <TrendingUp className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">Insights & Reports</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                Visualize your financial data with charts and detailed reports.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-emerald-100 bg-white/80 backdrop-blur-sm dark:border-emerald-900 dark:bg-gray-900/80">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            © {new Date().getFullYear()} Budget App. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
