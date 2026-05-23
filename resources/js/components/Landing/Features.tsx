import { motion } from 'framer-motion';
import {
    Wallet,
    PieChart,
    Target,
    Activity,
    Shield,
    Bot,
    ArrowRight,
    Zap,
    Lock,
} from 'lucide-react';

const smallFeatures = [
    {
        icon: Wallet,
        title: "Smart Expense Tracking",
        desc: "Auto-categorize transactions with AI accuracy.",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/50",
        border: "hover:border-emerald-500/30",
        visual: (
            <div className="mt-4 space-y-1.5">
                {[
                    { label: 'Groceries', amount: '-$84', color: 'bg-emerald-500' },
                    { label: 'Netflix', amount: '-$17', color: 'bg-blue-500' },
                    { label: 'Salary', amount: '+$4,200', color: 'bg-teal-500' },
                ].map((t) => (
                    <div key={t.label} className="flex items-center gap-2 text-[11px]">
                        <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${t.color}`} />
                        <span className="flex-1 text-muted-foreground">{t.label}</span>
                        <span className="font-medium text-foreground">{t.amount}</span>
                    </div>
                ))}
            </div>
        ),
    },
    {
        icon: PieChart,
        title: "Category Analytics",
        desc: "Visual breakdowns of where your money goes.",
        color: "text-cyan-600 dark:text-cyan-400",
        bg: "bg-cyan-50 dark:bg-cyan-950/50",
        border: "hover:border-cyan-500/30",
        visual: (
            <div className="mt-4 flex items-center gap-3">
                <div className="relative h-14 w-14 flex-shrink-0">
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="40 48" className="text-cyan-500" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="22 66" strokeDashoffset="-40" className="text-emerald-500" />
                        <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="16 72" strokeDashoffset="-62" className="text-blue-500" />
                    </svg>
                </div>
                <div className="space-y-1 text-[10px]">
                    <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />Housing 46%</div>
                    <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Food 25%</div>
                    <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />Other 29%</div>
                </div>
            </div>
        ),
    },
    {
        icon: Target,
        title: "Savings Goals",
        desc: "Set targets and track every milestone.",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950/50",
        border: "hover:border-blue-500/30",
        visual: (
            <div className="mt-4 space-y-2">
                {[
                    { label: 'Emergency Fund', pct: 82 },
                    { label: 'Vacation', pct: 45 },
                ].map((g) => (
                    <div key={g.label} className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">{g.label}</span>
                            <span className="font-medium text-foreground">{g.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${g.pct}%` }}
                                transition={{ duration: 0.9 }}
                                viewport={{ once: true }}
                                className="h-full bg-blue-500 rounded-full"
                            />
                        </div>
                    </div>
                ))}
            </div>
        ),
    },
    {
        icon: Activity,
        title: "Real-time Overview",
        desc: "Complete financial picture, always current.",
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-950/50",
        border: "hover:border-indigo-500/30",
        visual: (
            <div className="mt-4 h-10 flex items-end gap-0.5">
                {[30, 45, 38, 60, 52, 70, 65, 80, 72, 90].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05 }}
                        viewport={{ once: true }}
                        className="flex-1 rounded-sm bg-indigo-400/60 dark:bg-indigo-500/50"
                    />
                ))}
            </div>
        ),
    },
    {
        icon: Shield,
        title: "Secure & Private",
        desc: "AES-256 encryption. Your data stays yours.",
        color: "text-slate-600 dark:text-slate-400",
        bg: "bg-slate-100 dark:bg-slate-900/50",
        border: "hover:border-slate-500/30",
        visual: (
            <div className="mt-4 flex items-center gap-2">
                {[Lock, Shield, Zap].map((Icon, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                        <span className="text-[9px] text-muted-foreground text-center leading-tight">
                            {['Encrypted', 'Private', 'Fast'][i]}
                        </span>
                    </div>
                ))}
            </div>
        ),
    },
];

const aiConvo = [
    { role: 'user', text: 'How much did I spend on food last month?' },
    { role: 'ai', text: 'You spent $412 on Food — $88 under your $500 budget. 🎉' },
    { role: 'user', text: 'Set a $600 food budget for June' },
    { role: 'ai', text: '✅ Food budget of $600 created for June 2026.' },
];

const quickActions = ['Show budget status', 'Add transaction', 'Monthly summary'];

export default function Features() {
    return (
        <section id="features" className="py-24 bg-background">
            <div className="container mx-auto px-6 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm font-semibold text-primary uppercase tracking-wider"
                    >
                        Features
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
                    >
                        One workspace with{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">
                            batteries included
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-muted-foreground max-w-2xl mx-auto"
                    >
                        Everything you need to manage money. Nothing you don't.
                    </motion.p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-[auto_auto_auto] gap-6">

                    {/* AI Finance Chat — hero card, 2 cols × 2 rows */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 md:row-span-2 group relative rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/8 via-card to-card overflow-hidden hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
                    >
                        {/* Background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-400/10 dark:bg-violet-600/10 blur-3xl rounded-full -z-0 pointer-events-none" />

                        <div className="relative z-10 p-8 h-full flex flex-col">
                            {/* Card header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Bot className="h-6 w-6 text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">AI Finance Assistant</h3>
                                        <p className="text-sm text-muted-foreground">Powered by GPT-4 & Claude</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Live
                                </span>
                            </div>

                            <p className="text-muted-foreground mb-6 max-w-md">
                                Ask anything about your finances in plain English. The AI reads your data, creates budgets, logs transactions, and surfaces insights — no spreadsheets needed.
                            </p>

                            {/* Quick action chips */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {quickActions.map((action) => (
                                    <span
                                        key={action}
                                        className="px-3 py-1.5 rounded-full bg-muted/60 border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:border-violet-500/30 hover:bg-violet-500/5 transition-colors cursor-default"
                                    >
                                        {action}
                                    </span>
                                ))}
                            </div>

                            {/* Chat mockup */}
                            <div className="flex-1 rounded-xl bg-background/60 border border-border/40 p-4 space-y-3 overflow-hidden">
                                {aiConvo.map((msg, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 8 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 + i * 0.15 }}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-2'}`}
                                    >
                                        {msg.role === 'ai' && (
                                            <div className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-900/40 flex-shrink-0 flex items-center justify-center mt-0.5">
                                                <Bot className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                                            </div>
                                        )}
                                        <div className={`text-sm px-3 py-2 rounded-xl leading-snug max-w-[80%] ${
                                            msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                : 'bg-muted text-foreground rounded-tl-sm'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Input row */}
                                <div className="flex items-center gap-2 pt-2 border-t border-border/30">
                                    <div className="flex-1 h-8 rounded-lg bg-muted/50 border border-border/30 flex items-center px-3">
                                        <span className="text-xs text-muted-foreground">Ask anything about your finances...</span>
                                    </div>
                                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                                        <ArrowRight className="h-3.5 w-3.5 text-primary-foreground" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom accent line */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>

                    {/* Small feature cards — col 3, rows 1–2 */}
                    {smallFeatures.slice(0, 2).map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 + idx * 0.1 }}
                            className={`group relative p-6 rounded-2xl bg-card border border-border/50 ${feature.border} hover:shadow-lg hover:shadow-primary/5 transition-all duration-300`}
                        >
                            <div className={`h-10 w-10 rounded-xl ${feature.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`h-5 w-5 ${feature.color}`} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-1">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                            {feature.visual}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                    ))}

                    {/* Bottom row — 3 cards across */}
                    {smallFeatures.slice(2).map((feature, idx) => (
                        <motion.div
                            key={idx + 2}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 + idx * 0.1 }}
                            className={`group relative p-6 rounded-2xl bg-card border border-border/50 ${feature.border} hover:shadow-lg hover:shadow-primary/5 transition-all duration-300`}
                        >
                            <div className={`h-10 w-10 rounded-xl ${feature.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`h-5 w-5 ${feature.color}`} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-1">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                            {feature.visual}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
