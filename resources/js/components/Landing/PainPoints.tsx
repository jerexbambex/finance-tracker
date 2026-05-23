import { motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

const pains = [
    {
        before: {
            label: 'Without Budget App',
            problem: 'Disconnected Data',
            desc: 'Your bank, credit cards, and investments live in 5 separate apps. No single source of truth.',
            visual: (
                <div className="grid grid-cols-3 gap-2 mt-4">
                    {['🏦 Bank', '💳 Card', '📊 Invest', '📝 YNAB', '📉 Mint', '🗂️ CSV'].map((app) => (
                        <div key={app} className="flex items-center justify-center text-[10px] font-medium text-muted-foreground border border-dashed border-border/70 rounded-lg py-2 px-1 text-center leading-tight">
                            {app}
                        </div>
                    ))}
                    <div className="col-span-3 flex items-center justify-center gap-1 mt-1">
                        <X className="h-3 w-3 text-red-400" />
                        <span className="text-[10px] text-red-400">No connection between them</span>
                    </div>
                </div>
            ),
        },
        after: 'One dashboard. Every account. Real-time.',
    },
    {
        before: {
            label: 'Without Budget App',
            problem: 'Manual Overload',
            desc: 'Spreadsheets break. Manual entry is a second job. You eventually stop updating them.',
            visual: (
                <div className="mt-4 space-y-2">
                    {[
                        { label: 'Row 237: #REF!', broken: true },
                        { label: 'Last updated: 3 weeks ago', broken: true },
                        { label: 'Formula broken on merge', broken: true },
                    ].map((row) => (
                        <div key={row.label} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/40">
                            <X className="h-3.5 w-3.5 text-red-400 flex-shrink-0" />
                            <span className="text-[11px] text-red-600 dark:text-red-400 font-mono">{row.label}</span>
                        </div>
                    ))}
                </div>
            ),
        },
        after: 'Transactions auto-categorized. Zero manual work.',
    },
    {
        before: {
            label: 'Without Budget App',
            problem: 'Zero Intelligence',
            desc: 'Banking apps show what you spent — not what you can afford. They look back, not forward.',
            visual: (
                <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/60 border border-border/50">
                        <span className="text-[11px] text-muted-foreground">Spent on coffee</span>
                        <span className="text-[11px] font-mono font-semibold text-foreground">$248</span>
                    </div>
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/60 border border-border/50">
                        <span className="text-[11px] text-muted-foreground">Dining out</span>
                        <span className="text-[11px] font-mono font-semibold text-foreground">$612</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                        <X className="h-3 w-3 text-red-400" />
                        <span className="text-[10px] text-red-400">No suggestions. No forward planning.</span>
                    </div>
                </div>
            ),
        },
        after: 'AI spots patterns, warns early, and suggests fixes.',
    },
];

export default function PainPoints() {
    return (
        <section className="py-24 bg-background overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-bold tracking-tight"
                    >
                        Why most budgeting apps{' '}
                        <span className="text-red-500/80">fail you.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        Managing money shouldn't feel like a second job.
                    </motion.p>
                </div>

                {/* Pain cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {pains.map((pain, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm"
                        >
                            {/* Before — problem */}
                            <div className="p-6 border-b border-border/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-red-500 bg-red-50 dark:bg-red-950/30 px-2.5 py-1 rounded-full border border-red-200/50 dark:border-red-900/40">
                                        <X className="h-3 w-3" />
                                        {pain.before.label}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-2">{pain.before.problem}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{pain.before.desc}</p>
                                {pain.before.visual}
                            </div>

                            {/* After — solution */}
                            <div className="px-6 py-4 bg-emerald-50/60 dark:bg-emerald-950/20">
                                <div className="flex items-start gap-2.5">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                        {pain.after}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Resolution badge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold text-sm border border-emerald-500/20">
                        <CheckCircle2 className="h-4 w-4" />
                        Budget App fixes all three — automatically
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
