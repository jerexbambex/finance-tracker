import { motion, useInView } from 'framer-motion';
import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    CheckCircle2,
    Clock,
    Target,
    TrendingDown,
    Wallet,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function AnimatedCounter({ end, suffix = '', prefix = '' }: { end: number; suffix?: string; prefix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) {
            return;
        }

        const duration = 1800;
        const steps = 60;
        const increment = end / steps;
        let current = 0;

        const timer = window.setInterval(() => {
            current += increment;

            if (current >= end) {
                setCount(end);
                window.clearInterval(timer);
                return;
            }

            setCount(end % 1 === 0 ? Math.floor(current) : Number(current.toFixed(1)));
        }, duration / steps);

        return () => window.clearInterval(timer);
    }, [isInView, end]);

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    );
}

const liveMetrics = [
    { value: 50, prefix: '$', suffix: 'M+', label: 'tracked across accounts', icon: Wallet, tone: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { value: 42, suffix: '%', label: 'average debt reduction', icon: TrendingDown, tone: 'text-teal-300', bg: 'bg-teal-400/10' },
    { value: 12, suffix: 'K+', label: 'active budgeters', icon: BarChart3, tone: 'text-lime-300', bg: 'bg-lime-400/10' },
    { value: 4.9, suffix: '/5', label: 'user confidence score', icon: CheckCircle2, tone: 'text-amber-300', bg: 'bg-amber-400/10' },
];

const resultTabs = [
    {
        name: 'Savings',
        metric: '$8,420',
        label: 'average yearly savings surfaced',
        change: '+28% savings rate',
        quote: 'I finally saw where the leaks were and moved the money into goals before it disappeared.',
        points: 'M42 164 C92 148 126 138 174 118 C224 96 276 90 330 64 C380 42 430 44 486 28',
        color: '#10b981',
        fill: 'rgba(16, 185, 129, 0.22)',
    },
    {
        name: 'Debt',
        metric: '42%',
        label: 'less revolving debt after 6 months',
        change: '-$6,180 balance',
        quote: 'The debt trend made minimum payments impossible to ignore.',
        points: 'M42 60 C94 70 136 86 178 104 C220 122 272 124 326 142 C380 158 424 162 486 174',
        color: '#2dd4bf',
        fill: 'rgba(45, 212, 191, 0.2)',
    },
    {
        name: 'Goals',
        metric: '3.4x',
        label: 'more goals funded on schedule',
        change: '+$1,240 funded',
        quote: 'The progress bars made my emergency fund feel achievable instead of abstract.',
        points: 'M42 158 C88 154 122 134 168 132 C214 130 252 100 302 92 C360 82 416 54 486 44',
        color: '#f59e0b',
        fill: 'rgba(245, 158, 11, 0.18)',
    },
];

const recentWins = [
    { label: 'Emergency fund completed', meta: 'Goal reached 17 days early', value: '+$5,000', icon: Target, tone: 'text-emerald-300' },
    { label: 'Dining budget recovered', meta: 'Spending down this month', value: '-38%', icon: ArrowDownRight, tone: 'text-teal-300' },
    { label: 'Subscriptions cleaned up', meta: 'Recurring charges reviewed', value: '$214', icon: Clock, tone: 'text-amber-300' },
];

function ResultChart({ points, color, fill }: { points: string; color: string; fill: string }) {
    return (
        <svg viewBox="0 0 528 220" className="h-56 w-full overflow-visible" role="img" aria-label="Selected result trend">
            <defs>
                <linearGradient id="results-chart-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={fill} />
                    <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
                </linearGradient>
            </defs>
            {[36, 78, 120, 162, 204].map((y) => (
                <line key={y} x1="42" x2="486" y1={y} y2={y} stroke="rgba(148, 163, 184, 0.16)" strokeDasharray="4 6" />
            ))}
            <path d={`${points} L486 210 L42 210 Z`} fill="url(#results-chart-fill)" />
            <motion.path
                key={points}
                d={points}
                fill="none"
                stroke={color}
                strokeLinecap="round"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
            />
            <motion.circle
                cx="486"
                cy={points.endsWith('28') ? '28' : points.endsWith('174') ? '174' : '44'}
                r="6"
                fill={color}
                animate={{ opacity: [0.45, 1, 0.45], scale: [0.9, 1.25, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, index) => (
                <text key={month} x={42 + index * 89} y="238" fill="rgb(148, 163, 184)" fontSize="12" textAnchor="middle">
                    {month}
                </text>
            ))}
        </svg>
    );
}

export default function Security() {
    const [selectedResult, setSelectedResult] = useState(resultTabs[0]);

    return (
        <section id="security" className="relative overflow-hidden bg-[#050806] py-24 text-white">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px]" />
                <div className="absolute left-1/2 top-24 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
            </div>

            <div className="container relative z-10 mx-auto max-w-7xl px-6">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-300"
                    >
                        Real Results
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.08 }}
                        className="text-3xl font-bold tracking-tight md:text-5xl"
                    >
                        Financial wins that feel live, not theoretical.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.16 }}
                        className="mx-auto mt-4 max-w-2xl text-slate-400"
                    >
                        A cleaner budget is not just a report. It is a stream of visible progress: money found, debt reduced, goals funded, and habits changed.
                    </motion.p>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {liveMetrics.map((metric, index) => {
                        const Icon = metric.icon;

                        return (
                            <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, y: 18 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.06 }}
                                whileHover={{ y: -4 }}
                                className="group rounded-lg border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/10 backdrop-blur transition duration-200 hover:border-emerald-300/30 hover:bg-white/[0.07]"
                            >
                                <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-lg ${metric.bg}`}>
                                    <Icon className={`h-5 w-5 ${metric.tone}`} />
                                </div>
                                <div className="font-mono text-3xl font-bold leading-none tracking-normal text-white">
                                    <AnimatedCounter end={metric.value} prefix={metric.prefix} suffix={metric.suffix} />
                                </div>
                                <p className="mt-2 text-sm text-slate-400">{metric.label}</p>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="overflow-hidden rounded-lg border border-white/10 bg-[#0a0f0c]/95 shadow-2xl shadow-emerald-950/20"
                >
                    <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-5 py-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
                            </span>
                            <span className="font-mono text-sm text-slate-300">live financial wins</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {resultTabs.map((tab) => (
                                <button
                                    key={tab.name}
                                    type="button"
                                    onClick={() => setSelectedResult(tab)}
                                    className={`h-9 rounded-md border px-3 text-sm font-medium transition ${
                                        selectedResult.name === tab.name
                                            ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-200'
                                            : 'border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.08] hover:text-white'
                                    }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
                            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div>
                                    <p className="text-sm text-slate-400">{selectedResult.label}</p>
                                    <div className="mt-2 flex items-end gap-3">
                                        <span className="font-mono text-4xl font-bold tracking-normal text-white">{selectedResult.metric}</span>
                                        <span className="mb-1 flex items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-300">
                                            <ArrowUpRight className="h-3 w-3" />
                                            {selectedResult.change}
                                        </span>
                                    </div>
                                </div>
                                <div className="rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-400">
                                    Updated today
                                </div>
                            </div>

                            <div className="rounded-lg border border-white/10 bg-[#050806]/70 p-5 transition duration-200 hover:border-emerald-300/30">
                                <ResultChart points={selectedResult.points} color={selectedResult.color} fill={selectedResult.fill} />
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="mb-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-sm text-slate-400">Member note</p>
                                <p className="mt-2 text-lg leading-relaxed text-white">"{selectedResult.quote}"</p>
                            </div>

                            <div className="space-y-3">
                                {recentWins.map((win) => {
                                    const Icon = win.icon;

                                    return (
                                        <motion.div
                                            key={win.label}
                                            whileHover={{ x: 4 }}
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 transition duration-200 hover:border-emerald-300/25 hover:bg-white/[0.07]"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06]">
                                                <Icon className={`h-5 w-5 ${win.tone}`} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-white">{win.label}</p>
                                                <p className="truncate text-xs text-slate-500">{win.meta}</p>
                                            </div>
                                            <span className={`font-mono text-sm font-bold ${win.tone}`}>{win.value}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
