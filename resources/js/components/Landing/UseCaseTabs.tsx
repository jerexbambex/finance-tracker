import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, TrendingUp, DollarSign, Users, Bot, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from '@inertiajs/react';

type TabType = 'personal' | 'freelance' | 'family';

const useCases: Record<TabType, {
    label: string;
    icon: React.ElementType;
    headline: string;
    subhead: string;
    features: { text: string; new?: boolean }[];
    visual: React.ReactNode;
    accent: string;
    accentBg: string;
    accentText: string;
}> = {
    personal: {
        label: 'Personal',
        icon: DollarSign,
        headline: 'Stop wondering where your money went.',
        subhead: 'Automatic tracking, smart budgets, and an AI that answers your money questions instantly.',
        features: [
            { text: 'Automatic transaction categorization' },
            { text: 'Budget alerts before you overspend' },
            { text: 'Savings goals with visual progress' },
            { text: 'AI chat for instant financial answers', new: true },
        ],
        accent: 'emerald',
        accentBg: 'bg-emerald-500/10',
        accentText: 'text-emerald-600 dark:text-emerald-400',
        visual: (
            <div className="space-y-4">
                {/* Budget status cards */}
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-foreground">May Budget</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">On Track ✓</span>
                </div>
                {[
                    { name: 'Housing', spent: 1200, total: 1500, color: 'bg-emerald-500' },
                    { name: 'Food & Dining', spent: 310, total: 500, color: 'bg-teal-500' },
                    { name: 'Transport', spent: 95, total: 200, color: 'bg-cyan-500' },
                    { name: 'Entertainment', spent: 175, total: 150, color: 'bg-red-500', over: true },
                ].map((item) => (
                    <div key={item.name} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{item.name}</span>
                            <span className={`font-medium ${item.over ? 'text-red-500' : 'text-foreground'}`}>
                                ${item.spent} / ${item.total}
                                {item.over && ' ⚠️'}
                            </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((item.spent / item.total) * 100, 100)}%` }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                                className={`h-full ${item.color} rounded-full`}
                            />
                        </div>
                    </div>
                ))}

                {/* AI tip */}
                <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/40">
                    <Bot className="h-4 w-4 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-violet-700 dark:text-violet-300 leading-snug">
                        <span className="font-semibold">AI:</span> You're over on Entertainment by $25. Cut 1 outing and you'll be back on track.
                    </p>
                </div>
            </div>
        ),
    },

    freelance: {
        label: 'Freelance',
        icon: TrendingUp,
        headline: 'Manage irregular income like a pro.',
        subhead: 'Handle variable income, separate client expenses, and plan for tax season without stress.',
        features: [
            { text: 'Variable income tracking by client' },
            { text: 'Business vs personal separation' },
            { text: 'Tax planning estimates' },
            { text: 'AI-generated monthly summaries', new: true },
        ],
        accent: 'blue',
        accentBg: 'bg-blue-500/10',
        accentText: 'text-blue-600 dark:text-blue-400',
        visual: (
            <div className="space-y-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-foreground">Income — Last 6 months</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">+$1.2K avg/mo</span>
                </div>

                {/* Bar chart */}
                <div className="h-28 flex items-end gap-2">
                    {[
                        { month: 'Dec', income: 3200, expense: 1800 },
                        { month: 'Jan', income: 4800, expense: 2100 },
                        { month: 'Feb', income: 2900, expense: 1600 },
                        { month: 'Mar', income: 6100, expense: 2400 },
                        { month: 'Apr', income: 3700, expense: 1900 },
                        { month: 'May', income: 5400, expense: 2200 },
                    ].map((d, i) => {
                        const max = 6100;
                        return (
                            <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5">
                                <div className="w-full flex items-end gap-0.5 h-24">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(d.income / max) * 100}%` }}
                                        transition={{ duration: 0.6, delay: i * 0.07 }}
                                        className="flex-1 bg-blue-500/80 rounded-t-sm"
                                    />
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(d.expense / max) * 100}%` }}
                                        transition={{ duration: 0.6, delay: i * 0.07 + 0.04 }}
                                        className="flex-1 bg-slate-400/50 rounded-t-sm"
                                    />
                                </div>
                                <span className="text-[9px] text-muted-foreground">{d.month}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-3 text-[11px]">
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-blue-500/80" />Income</span>
                    <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-slate-400/50" />Expenses</span>
                </div>

                {/* Tax estimate */}
                <div className="mt-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs font-semibold text-foreground">Q2 Tax Estimate</p>
                            <p className="text-[10px] text-muted-foreground">Set aside before June 15</p>
                        </div>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">$3,240</span>
                    </div>
                </div>
            </div>
        ),
    },

    family: {
        label: 'Family',
        icon: Users,
        headline: 'Get everyone on the same financial page.',
        subhead: 'Shared visibility, individual privacy, and family goals that actually get reached together.',
        features: [
            { text: 'Shared accounts with role control' },
            { text: 'Private accounts per member' },
            { text: 'Family savings goals' },
            { text: 'AI answers for the whole household', new: true },
        ],
        accent: 'violet',
        accentBg: 'bg-violet-500/10',
        accentText: 'text-violet-600 dark:text-violet-400',
        visual: (
            <div className="space-y-4">
                {/* Members */}
                <div className="flex items-center gap-3 mb-2">
                    {[
                        { name: 'James', color: 'bg-violet-500', role: 'Admin' },
                        { name: 'Sarah', color: 'bg-pink-500', role: 'Member' },
                        { name: 'Kids', color: 'bg-amber-500', role: 'View' },
                    ].map((m) => (
                        <div key={m.name} className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl bg-muted/50 border border-border/50">
                            <div className={`h-7 w-7 rounded-full ${m.color} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                {m.name[0]}
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold text-foreground">{m.name}</p>
                                <p className="text-[9px] text-muted-foreground">{m.role}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Family goals */}
                <p className="text-xs font-semibold text-foreground">Family Goals</p>
                {[
                    { name: '🏠 House Down Payment', pct: 68, color: 'bg-violet-500', amount: '$34K / $50K' },
                    { name: '🎓 College Fund', pct: 41, color: 'bg-pink-500', amount: '$8.2K / $20K' },
                    { name: '✈️ Family Vacation', pct: 85, color: 'bg-amber-500', amount: '$2,550 / $3K' },
                ].map((g) => (
                    <div key={g.name} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">{g.name}</span>
                            <span className="font-medium text-foreground">{g.amount}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${g.pct}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full ${g.color} rounded-full`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
};

const tabOrder: TabType[] = ['personal', 'freelance', 'family'];

export default function UseCaseTabs() {
    const [activeTab, setActiveTab] = useState<TabType>('personal');
    const active = useCases[activeTab];

    return (
        <section className="py-24 bg-muted/20 border-y border-border/40">
            <div className="container mx-auto px-6 max-w-6xl">

                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm font-semibold text-primary uppercase tracking-wider"
                    >
                        Built for you
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-bold tracking-tight"
                    >
                        Built for how you live
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground max-w-2xl mx-auto"
                    >
                        Whether managing solo, running freelance, or syncing a whole family.
                    </motion.p>
                </div>

                {/* Tab pills */}
                <div className="flex justify-center gap-2 mb-10">
                    {tabOrder.map((tab) => {
                        const Icon = useCases[tab].icon;
                        const isActive = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                                    isActive
                                        ? 'bg-foreground text-background shadow-md'
                                        : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                {useCases[tab].label}
                            </button>
                        );
                    })}
                </div>

                {/* Two-panel card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl border border-border/60 bg-card overflow-hidden shadow-lg"
                    >
                        {/* Left — content */}
                        <div className="p-8 md:p-10 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-border/50">
                            <div className={`inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-full text-xs font-semibold ${active.accentBg} ${active.accentText}`}>
                                <active.icon className="h-3.5 w-3.5" />
                                {active.label} Finance
                            </div>

                            <div>
                                <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-tight mb-3">
                                    {active.headline}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {active.subhead}
                                </p>
                            </div>

                            <ul className="space-y-3">
                                {active.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                                        <span className="text-foreground text-sm">{f.text}</span>
                                        {f.new && (
                                            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/50">
                                                NEW
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/register"
                                className="inline-flex items-center gap-2 self-start text-sm font-semibold text-primary hover:text-primary/80 transition-colors group mt-auto"
                            >
                                Get started free
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        {/* Right — visual mockup */}
                        <div className="p-8 md:p-10 bg-muted/30">
                            <div className="rounded-xl border border-border/50 bg-card p-5 shadow-sm h-full">
                                {active.visual}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}
