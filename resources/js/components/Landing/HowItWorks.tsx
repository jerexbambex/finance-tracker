import { motion } from 'framer-motion';
import { UserPlus, Building2, LayoutDashboard, Bot } from 'lucide-react';

const steps = [
    {
        icon: UserPlus,
        number: 1,
        title: "Create Account",
        desc: "Sign up in seconds. No credit card, no lengthy forms.",
        accent: "primary",
        iconColor: "text-primary",
        borderHover: "group-hover:border-primary/50",
        shadowHover: "group-hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]",
        badgeBg: "bg-primary",
    },
    {
        icon: Building2,
        number: 2,
        title: "Connect Assets",
        desc: "Securely link bank accounts or import via CSV instantly.",
        accent: "blue",
        iconColor: "text-blue-500",
        borderHover: "group-hover:border-blue-500/50",
        shadowHover: "group-hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]",
        badgeBg: "bg-blue-500",
    },
    {
        icon: LayoutDashboard,
        number: 3,
        title: "See Your Picture",
        desc: "Instant dashboard — budgets, spending, and net worth in one view.",
        accent: "emerald",
        iconColor: "text-emerald-500",
        borderHover: "group-hover:border-emerald-500/50",
        shadowHover: "group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]",
        badgeBg: "bg-emerald-500",
    },
    {
        icon: Bot,
        number: 4,
        title: "Chat with AI",
        desc: "Ask anything. Set budgets, log transactions, get insights — in plain English.",
        accent: "violet",
        iconColor: "text-violet-500",
        borderHover: "group-hover:border-violet-500/50",
        shadowHover: "group-hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]",
        badgeBg: "bg-violet-500",
        featured: true,
    },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-32 bg-background border-y border-border/40 relative">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:100px_100px]" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-24 space-y-4">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-border bg-background shadow-sm text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                        Simple Onboarding
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                        From chaos to clarity <br /> in{' '}
                        <span className="text-primary italic">minutes.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative">
                    {/* Connecting line (desktop) */}
                    <div className="hidden lg:block absolute top-[20%] left-[12%] right-[12%] h-px -z-10 border-t border-dashed border-border" />

                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: idx * 0.15 }}
                            className={`relative flex flex-col items-center text-center group ${step.featured ? 'lg:-mt-4' : ''}`}
                        >
                            {step.featured && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                                    <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/50 whitespace-nowrap">
                                        ✦ New
                                    </span>
                                </div>
                            )}

                            <div className={`h-32 w-32 rounded-[2rem] bg-background border-2 border-border shadow-2xl flex items-center justify-center mb-10 relative z-10 transition-all duration-300 group-hover:scale-110 ${step.borderHover} ${step.shadowHover} ${step.featured ? 'border-violet-200/60 dark:border-violet-800/40' : ''}`}>
                                <step.icon className={`h-12 w-12 ${step.iconColor}`} strokeWidth={1} />
                                <div className={`absolute -top-4 -right-4 h-10 w-10 rounded-full ${step.badgeBg} text-white flex items-center justify-center font-bold text-lg shadow-lg border-4 border-background`}>
                                    {step.number}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                            <p className={`text-lg leading-relaxed max-w-xs ${step.featured ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
