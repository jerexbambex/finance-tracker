import { motion } from 'framer-motion';
import {
    Wallet,
    Brain,
    PieChart,
    Target,
    Activity,
    Shield
} from 'lucide-react';

const features = [
    {
        icon: Wallet,
        title: "Smart Expense Tracking",
        desc: "Automatically categorize transactions with 99% accuracy using AI.",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-950/50"
    },
    {
        icon: Brain,
        title: "AI Budget Suggestions",
        desc: "Get personalized recommendations based on your spending habits.",
        color: "text-teal-600 dark:text-teal-400",
        bg: "bg-teal-50 dark:bg-teal-950/50"
    },
    {
        icon: PieChart,
        title: "Category Analytics",
        desc: "Deep insights into where your money goes with visual breakdowns.",
        color: "text-cyan-600 dark:text-cyan-400",
        bg: "bg-cyan-50 dark:bg-cyan-950/50"
    },
    {
        icon: Target,
        title: "Savings Goals",
        desc: "Set targets and track progress towards your financial milestones.",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-950/50"
    },
    {
        icon: Activity,
        title: "Real-time Overview",
        desc: "See your complete financial picture updated in real-time.",
        color: "text-indigo-600 dark:text-indigo-400",
        bg: "bg-indigo-50 dark:bg-indigo-950/50"
    },
    {
        icon: Shield,
        title: "Secure & Private",
        desc: "Bank-level AES-256 encryption keeps your data safe.",
        color: "text-slate-600 dark:text-slate-400",
        bg: "bg-slate-100 dark:bg-slate-900/50"
    }
];

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

                {/* Feature Grid - 2x3 or 3x2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                        >
                            {/* Icon */}
                            <div className={`h-12 w-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`h-6 w-6 ${feature.color}`} strokeWidth={1.5} />
                            </div>

                            {/* Content */}
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {feature.desc}
                            </p>

                            {/* Subtle hover indicator */}
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
