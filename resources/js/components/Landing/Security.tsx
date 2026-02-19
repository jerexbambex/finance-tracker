import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Percent, DollarSign, PiggyBank, BarChart3 } from 'lucide-react';

function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            const duration = 2000;
            const steps = 60;
            const increment = end / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(current));
                }
            }, duration / steps);

            return () => clearInterval(timer);
        }
    }, [isInView, end]);

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}

export default function Security() {
    return (
        <section id="security" className="py-24 bg-slate-950 text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-600/20 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-600/15 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm font-semibold text-emerald-400 uppercase tracking-wider"
                    >
                        Real Results
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-bold tracking-tight"
                    >
                        Numbers that speak{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
                            for themselves
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-400 max-w-2xl mx-auto"
                    >
                        Our users don't just track money—they transform their financial lives.
                    </motion.p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {[
                        { value: 75, suffix: '%', label: 'Savings improvement', icon: TrendingUp, color: 'text-emerald-400' },
                        { value: 42, suffix: '%', label: 'Debt reduction', icon: TrendingDown, color: 'text-teal-400' },
                        { value: 12, prefix: '$', suffix: 'M+', label: 'Assets tracked', icon: DollarSign, color: 'text-cyan-400' },
                        { value: 4.9, suffix: '/5', label: 'User rating', icon: BarChart3, color: 'text-blue-400' }
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
                        >
                            <stat.icon className={`h-6 w-6 ${stat.color} mx-auto mb-3`} />
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                                <AnimatedCounter end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                            </div>
                            <p className="text-sm text-slate-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="relative max-w-4xl mx-auto"
                >
                    {/* Glow */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 blur-3xl rounded-3xl opacity-50" />

                    {/* Dashboard Card */}
                    <div className="relative rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl overflow-hidden">
                        {/* Terminal Header */}
                        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                                <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                                <div className="h-2.5 w-2.5 rounded-full bg-slate-600" />
                            </div>
                            <span className="text-xs text-slate-500 ml-2 font-mono">financial-analytics.dashboard</span>
                        </div>

                        {/* Dashboard Content */}
                        <div className="p-6 space-y-6">
                            {/* Header Row */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase tracking-wider">Total Net Worth</p>
                                    <p className="text-3xl font-bold text-white mt-1">$124,850.00</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                                        <span className="text-xs text-emerald-400">+18.4% this year</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium">Monthly</div>
                                    <div className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 text-xs font-medium">Yearly</div>
                                </div>
                            </div>

                            {/* Chart Area - Income vs Expense Bar graph */}
                            <div className="h-48 rounded-xl bg-slate-800/50 border border-white/5 p-4 relative overflow-hidden">
                                {/* Grid lines */}
                                <div className="absolute inset-4 flex flex-col justify-between">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="h-px bg-white/5" />
                                    ))}
                                </div>
                                
                                {/* Legend */}
                                <div className="absolute top-2 right-4 flex gap-4 text-[10px]">
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-sm bg-emerald-400" />
                                        <span className="text-slate-400">Income</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="h-2 w-2 rounded-sm bg-red-400" />
                                        <span className="text-slate-400">Expense</span>
                                    </div>
                                </div>
                                
                                {/* Bar chart - Income vs Expense */}
                                <div className="absolute bottom-8 left-4 right-4 flex items-end justify-between gap-3 h-[calc(100%-3rem)]">
                                    {[
                                        { income: 70, expense: 45 },
                                        { income: 65, expense: 50 },
                                        { income: 80, expense: 40 },
                                        { income: 75, expense: 55 },
                                        { income: 85, expense: 45 },
                                        { income: 90, expense: 50 },
                                        { income: 88, expense: 48 },
                                        { income: 92, expense: 52 },
                                        { income: 95, expense: 50 },
                                        { income: 90, expense: 55 },
                                        { income: 98, expense: 48 },
                                        { income: 95, expense: 45 }
                                    ].map((data, i) => (
                                        <div key={i} className="flex items-end gap-1 h-full" style={{ width: '6%' }}>
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                whileInView={{ height: `${data.income}%`, opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6, delay: i * 0.08, ease: "easeOut" }}
                                                className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm shadow-lg shadow-emerald-500/20"
                                            />
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                whileInView={{ height: `${data.expense}%`, opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6, delay: i * 0.08 + 0.05, ease: "easeOut" }}
                                                className="flex-1 bg-gradient-to-t from-red-600 to-red-400 rounded-t-sm shadow-lg shadow-red-500/20"
                                            />
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Month labels */}
                                <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[9px] text-slate-500 font-medium">
                                    {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((m, i) => (
                                        <span key={i} className="flex-1 text-center">{m}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <PiggyBank className="h-4 w-4 text-emerald-400" />
                                        <span className="text-xs text-slate-400">Savings</span>
                                    </div>
                                    <p className="text-lg font-bold text-white">$32,450</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BarChart3 className="h-4 w-4 text-teal-400" />
                                        <span className="text-xs text-slate-400">Investments</span>
                                    </div>
                                    <p className="text-lg font-bold text-white">$67,200</p>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Percent className="h-4 w-4 text-cyan-400" />
                                        <span className="text-xs text-slate-400">Save Rate</span>
                                    </div>
                                    <p className="text-lg font-bold text-white">48%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
