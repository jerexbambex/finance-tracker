import { motion, useInView } from 'framer-motion';
import { TrendingUp, TrendingDown, Percent, DollarSign, PiggyBank, BarChart3 } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

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

                            {/* Chart Area - Income vs Expense Line graph */}
                            <div className="h-48 rounded-xl bg-slate-800/50 border border-white/5 p-4 relative overflow-hidden">
                                <div className="w-full h-full">
                                    <svg className="w-full h-full" viewBox="0 0 360 140" preserveAspectRatio="xMidYMid meet">
                                        {/* Horizontal grid lines */}
                                        <line x1="30" y1="20" x2="350" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                        <line x1="30" y1="50" x2="350" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                        <line x1="30" y1="80" x2="350" y2="80" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                                        <line x1="30" y1="110" x2="350" y2="110" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                                        
                                        {/* Income line (green) - smooth curve */}
                                        <motion.path
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            whileInView={{ pathLength: 1, opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.2, ease: "easeInOut" }}
                                            d="M 30,85 Q 50,80 70,75 T 110,60 T 150,50 T 190,45 T 230,40 T 270,38 T 310,35 L 350,32"
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                        {/* Income dots */}
                                        {[
                                            { x: 30, y: 85 }, { x: 70, y: 75 }, { x: 110, y: 60 }, 
                                            { x: 150, y: 50 }, { x: 190, y: 45 }, { x: 230, y: 40 }, 
                                            { x: 270, y: 38 }, { x: 310, y: 35 }, { x: 350, y: 32 }
                                        ].map((point, i) => (
                                            <motion.circle
                                                key={`income-${i}`}
                                                initial={{ scale: 0, opacity: 0 }}
                                                whileInView={{ scale: 1, opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.3, delay: 1.2 + i * 0.08 }}
                                                cx={point.x}
                                                cy={point.y}
                                                r="3.5"
                                                fill="#10b981"
                                            />
                                        ))}
                                        
                                        {/* Expense line (red) - smooth curve */}
                                        <motion.path
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            whileInView={{ pathLength: 1, opacity: 1 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.15 }}
                                            d="M 30,95 Q 50,92 70,90 T 110,85 T 150,82 T 190,80 T 230,78 T 270,77 T 310,76 L 350,75"
                                            fill="none"
                                            stroke="#ef4444"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                        {/* Expense dots */}
                                        {[
                                            { x: 30, y: 95 }, { x: 70, y: 90 }, { x: 110, y: 85 }, 
                                            { x: 150, y: 82 }, { x: 190, y: 80 }, { x: 230, y: 78 }, 
                                            { x: 270, y: 77 }, { x: 310, y: 76 }, { x: 350, y: 75 }
                                        ].map((point, i) => (
                                            <motion.circle
                                                key={`expense-${i}`}
                                                initial={{ scale: 0, opacity: 0 }}
                                                whileInView={{ scale: 1, opacity: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.3, delay: 1.35 + i * 0.08 }}
                                                cx={point.x}
                                                cy={point.y}
                                                r="3.5"
                                                fill="#ef4444"
                                            />
                                        ))}
                                        
                                        {/* Month labels */}
                                        {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S'].map((month, i) => (
                                            <text
                                                key={month + i}
                                                x={30 + i * 40}
                                                y="130"
                                                fill="rgb(100, 116, 139)"
                                                fontSize="9"
                                                fontWeight="500"
                                                textAnchor="middle"
                                            >
                                                {month}
                                            </text>
                                        ))}
                                        
                                        {/* Legend */}
                                        <g transform="translate(260, 8)">
                                            <circle cx="0" cy="0" r="3" fill="#10b981" />
                                            <text x="8" y="3" fill="rgb(148, 163, 184)" fontSize="9" fontWeight="500">Income</text>
                                            <circle cx="50" cy="0" r="3" fill="#ef4444" />
                                            <text x="58" y="3" fill="rgb(148, 163, 184)" fontSize="9" fontWeight="500">Expense</text>
                                        </g>
                                    </svg>
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
