import { motion } from 'framer-motion';
import { Layers, CreditCard, PiggyBank, FileText, BarChart3, Bot } from 'lucide-react';

const workspaceItems = [
    {
        icon: PiggyBank,
        title: "Budgeting",
        desc: "Zero-based budgeting with smart category limits.",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        border: "hover:border-emerald-500/30",
        glow: "",
    },
    {
        icon: CreditCard,
        title: "Expenses",
        desc: "Auto-synced transactions, auto-categorized.",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950/40",
        border: "hover:border-blue-500/30",
        glow: "",
    },
    {
        icon: BarChart3,
        title: "Investments",
        desc: "Portfolio tracking across all your accounts.",
        color: "text-teal-600 dark:text-teal-400",
        bg: "bg-teal-50 dark:bg-teal-950/40",
        border: "hover:border-teal-500/30",
        glow: "",
    },
    {
        icon: Layers,
        title: "Planning",
        desc: "Retirement forecasting and scenario modeling.",
        color: "text-cyan-600 dark:text-cyan-400",
        bg: "bg-cyan-50 dark:bg-cyan-950/40",
        border: "hover:border-cyan-500/30",
        glow: "",
    },
    {
        icon: FileText,
        title: "Reports",
        desc: "Tax-ready exports and monthly summaries.",
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-950/40",
        border: "hover:border-indigo-500/30",
        glow: "",
    },
    {
        icon: Bot,
        title: "AI Chat",
        desc: "Ask anything. Create budgets, log transactions, get insights — all in plain English.",
        color: "text-violet-600 dark:text-violet-400",
        bg: "bg-violet-50 dark:bg-violet-950/40",
        border: "hover:border-violet-500/40",
        glow: "hover:shadow-violet-500/10",
        featured: true,
    },
];

export default function UnifiedWorkspace() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] -z-10 rounded-full" />

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-16 space-y-4">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm font-semibold text-primary uppercase tracking-wider"
                    >
                        All-in-one
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-3xl md:text-5xl font-black tracking-tight text-foreground"
                    >
                        One unified{' '}
                        <span className="text-primary">financial workspace.</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        Stop switching between spreadsheet tabs and bank apps.
                        Bring your entire financial life into one secure dashboard.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {workspaceItems.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08, duration: 0.5 }}
                            viewport={{ once: true }}
                            className={`group relative flex items-start gap-5 p-6 rounded-2xl bg-card border transition-all duration-300 cursor-default
                                ${item.featured
                                    ? `border-violet-500/25 bg-gradient-to-br from-violet-500/5 via-card to-card hover:border-violet-500/50 hover:shadow-xl ${item.glow}`
                                    : `border-border/50 ${item.border} hover:shadow-lg hover:shadow-primary/5`
                                }`}
                        >
                            {/* Icon */}
                            <div className={`h-12 w-12 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} strokeWidth={1.5} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-base text-foreground">{item.title}</h3>
                                    {item.featured && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/50">
                                            NEW
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground leading-snug">{item.desc}</p>
                            </div>

                            {/* Hover accent */}
                            <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent ${item.featured ? 'via-violet-500/60' : 'via-primary/40'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl`} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
