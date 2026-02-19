import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, Play, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { SharedData } from '@/types';

export default function Hero() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    return (
        <section className="relative pt-28 pb-20 md:pt-40 md:pb-28 overflow-hidden">
            {/* Soft gradient background inspired by Laravel AI */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-background to-background dark:from-emerald-950/20" />
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-200/30 dark:bg-emerald-900/20 blur-[120px] rounded-full" />
                <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-teal-200/20 dark:bg-teal-900/10 blur-[100px] rounded-full" />
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#0001_1px,transparent_1px),linear-gradient(to_bottom,#0001_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#fff1_1px,transparent_1px),linear-gradient(to_bottom,#fff1_1px,transparent_1px)] bg-[size:60px_60px] opacity-30" />
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

                    {/* Left Content */}
                    <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl lg:max-w-xl">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary backdrop-blur-sm mx-auto lg:mx-0"
                        >
                            <Sparkles className="h-4 w-4" />
                            <span>Smart finance for modern life</span>
                        </motion.div>

                        {/* Headline with gradient keywords */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]"
                        >
                            Financial management for people who{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">
                                actually want to save
                            </span>
                        </motion.h1>

                        {/* Subheadline */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0"
                        >
                            Budget App replaces spreadsheets, expense trackers, and goal planners with one unified workspace. Zero bloat, zero complexity—just clarity.
                        </motion.p>

                        {/* REPLACES Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                            className="space-y-3"
                        >
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Replaces</p>
                            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                {['Excel Spreadsheets', 'Mint', 'YNAB', 'Personal Capital', 'EveryDollar'].map((tool) => (
                                    <span
                                        key={tool}
                                        className="px-3 py-1.5 rounded-full border border-border/50 bg-muted/30 text-xs font-medium text-muted-foreground"
                                    >
                                        {tool}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
                        >
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="h-12 px-7 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/register"
                                        className="h-12 px-7 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center gap-2"
                                    >
                                        Start Managing Smarter
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <button className="h-12 px-6 rounded-lg border border-border bg-background/80 backdrop-blur-sm hover:bg-muted text-foreground font-semibold transition-all flex items-center gap-2 group">
                                        <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <Play className="h-3 w-3 ml-0.5 text-primary" fill="currentColor" />
                                        </span>
                                        <span>View Demo</span>
                                    </button>
                                </>
                            )}
                        </motion.div>

                        {/* Stats - Outcome focused */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="pt-4 grid grid-cols-3 gap-6 text-center lg:text-left"
                        >
                            <div>
                                <div className="text-3xl font-bold text-foreground">73%</div>
                                <div className="text-xs text-muted-foreground mt-1">Less time on finances</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-foreground">$2.4K</div>
                                <div className="text-xs text-muted-foreground mt-1">Avg. savings increase</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-foreground">4.9/5</div>
                                <div className="text-xs text-muted-foreground mt-1">User satisfaction</div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Dashboard Mockup */}
                    <div className="flex-1 w-full max-w-[580px] lg:max-w-none relative">
                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="relative"
                        >
                            {/* Glow behind mockup */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-3xl rounded-3xl opacity-60 -z-10" />

                            {/* Main Dashboard Card */}
                            <div className="rounded-2xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                                {/* Browser Chrome */}
                                <div className="h-10 bg-muted/50 border-b border-border/50 flex items-center px-4 gap-3">
                                    <div className="flex gap-1.5">
                                        <div className="h-2.5 w-2.5 rounded-full bg-border" />
                                        <div className="h-2.5 w-2.5 rounded-full bg-border" />
                                        <div className="h-2.5 w-2.5 rounded-full bg-border" />
                                    </div>
                                    <div className="flex-1 bg-background/50 h-6 rounded-md border border-border/30 flex items-center justify-center text-[10px] text-muted-foreground font-medium">
                                        app.budgetwise.io/dashboard
                                    </div>
                                </div>

                                {/* Dashboard Content */}
                                <div className="p-6 space-y-5">
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Welcome back</p>
                                            <h2 className="text-xl font-bold text-foreground">Financial Overview</h2>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Net Worth</p>
                                            <p className="text-xl font-bold text-foreground">$47,250</p>
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                                            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Income</p>
                                            <p className="text-lg font-bold text-foreground mt-1">$8,450</p>
                                            <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">+12% vs last month</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                                            <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Expenses</p>
                                            <p className="text-lg font-bold text-foreground mt-1">$4,180</p>
                                            <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70">-8% vs last month</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/50">
                                            <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide">Savings</p>
                                            <p className="text-lg font-bold text-foreground mt-1">$4,270</p>
                                            <p className="text-[10px] text-teal-600/70 dark:text-teal-400/70">51% savings rate</p>
                                        </div>
                                    </div>

                                    {/* Chart Area */}
                                    <div className="rounded-xl border border-border/50 bg-background/50 p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-semibold text-foreground">Monthly Trend</span>
                                            <div className="flex gap-3 text-[10px]">
                                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Income</span>
                                                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500"></span> Expenses</span>
                                            </div>
                                        </div>
                                        <div className="h-32 flex items-end justify-between gap-2">
                                            {[
                                                { income: 70, expense: 45 },
                                                { income: 65, expense: 50 },
                                                { income: 80, expense: 40 },
                                                { income: 75, expense: 55 },
                                                { income: 85, expense: 45 },
                                                { income: 90, expense: 50 },
                                            ].map((data, i) => (
                                                <div key={i} className="flex-1 flex items-end gap-0.5">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        whileInView={{ height: `${data.income}%` }}
                                                        transition={{ duration: 0.6, delay: i * 0.1 }}
                                                        className="flex-1 bg-emerald-500/80 rounded-t"
                                                    />
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        whileInView={{ height: `${data.expense}%` }}
                                                        transition={{ duration: 0.6, delay: i * 0.1 + 0.05 }}
                                                        className="flex-1 bg-blue-500/80 rounded-t"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-2 text-[9px] text-muted-foreground">
                                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => (
                                                <span key={m} className="flex-1 text-center">{m}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Budget Progress */}
                                    <div className="space-y-3">
                                        <span className="text-sm font-semibold text-foreground">Budget Status</span>
                                        {[
                                            { name: 'Housing', spent: 1200, total: 1500, color: 'bg-emerald-500' },
                                            { name: 'Food & Dining', spent: 380, total: 500, color: 'bg-teal-500' },
                                            { name: 'Transportation', spent: 150, total: 300, color: 'bg-cyan-500' },
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex justify-between text-[11px]">
                                                    <span className="text-muted-foreground">{item.name}</span>
                                                    <span className="font-medium text-foreground">${item.spent} / ${item.total}</span>
                                                </div>
                                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${(item.spent / item.total) * 100}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                                        className={`h-full ${item.color} rounded-full`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Floating notification card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20, y: 20 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.8 }}
                                className="absolute -bottom-4 -left-4 md:-left-8 bg-card border border-border/50 rounded-xl p-3 shadow-lg backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">Savings Goal Hit!</p>
                                        <p className="text-[10px] text-muted-foreground">Emergency fund complete</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

