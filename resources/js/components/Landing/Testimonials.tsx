import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const stats = [
    {
        value: '$50M+',
        label: 'Assets Tracked',
        visual: (
            <div className="flex items-end gap-0.5 h-8">
                {[30, 45, 38, 55, 48, 62, 58, 72, 68, 85].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ duration: 0.5, delay: i * 0.04 }}
                        viewport={{ once: true }}
                        className="flex-1 rounded-sm bg-emerald-500/60"
                    />
                ))}
            </div>
        ),
    },
    {
        value: '12K+',
        label: 'Active Users',
        visual: (
            <div className="flex items-end gap-0.5 h-8">
                {[20, 30, 28, 40, 38, 52, 55, 65, 70, 80].map((h, i) => (
                    <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        transition={{ duration: 0.5, delay: i * 0.04 }}
                        viewport={{ once: true }}
                        className="flex-1 rounded-sm bg-blue-500/60"
                    />
                ))}
            </div>
        ),
    },
    {
        value: '4.9/5',
        label: 'User Rating',
        visual: (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: i * 0.08 }}
                        viewport={{ once: true }}
                    >
                        <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    </motion.div>
                ))}
            </div>
        ),
    },
    {
        value: '73%',
        label: 'Less Time on Finances',
        visual: (
            <div className="relative h-8 flex items-center">
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '73%' }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        viewport={{ once: true }}
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400"
                    />
                </div>
                <span className="absolute right-0 text-[10px] font-bold text-violet-500">73%</span>
            </div>
        ),
    },
];

const featured = {
    quote: "I've tried Mint, YNAB, and Personal Capital. Budget App is the only one I actually stuck with. The AI chat alone is worth it — I just type 'set a food budget for May' and it's done.",
    author: "Alex Rivera",
    role: "Software Engineer",
    tag: "Saved 45hrs/yr",
    initials: "AR",
    color: "bg-emerald-500",
};

const testimonials = [
    {
        quote: "Finally hit my emergency fund goal after 3 months. The visual progress tracking kept me motivated.",
        author: "Sarah Chen",
        role: "Product Designer",
        tag: "Goal Achieved",
        initials: "SC",
        color: "bg-blue-500",
    },
    {
        quote: "My wife and I can finally see our shared expenses without awkward money conversations.",
        author: "James Wilson",
        role: "Small Business Owner",
        tag: "Family Harmony",
        initials: "JW",
        color: "bg-teal-500",
    },
    {
        quote: "As a freelancer with irregular income, this is the first tool that actually helps me plan ahead.",
        author: "Maria Garcia",
        role: "Freelance Writer",
        tag: "Income Smoothed",
        initials: "MG",
        color: "bg-violet-500",
    },
    {
        quote: "Reduced my dining out spending by 40% just by seeing the numbers clearly. No judgment, just data.",
        author: "David Kim",
        role: "Marketing Manager",
        tag: "$480/mo Saved",
        initials: "DK",
        color: "bg-indigo-500",
    },
];

const companies = ["Stripe", "Vercel", "Airbnb", "Notion", "Linear", "Figma"];

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 bg-muted/20 border-y border-border/40 overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm font-semibold text-primary uppercase tracking-wider"
                    >
                        Real Results
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black tracking-tight leading-tight"
                    >
                        Trusted by <span className="text-primary">smart savers</span> worldwide
                    </motion.h2>
                </div>

                {/* Stats Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-5 rounded-2xl bg-card border border-border/60 space-y-3 hover:border-primary/20 hover:shadow-md transition-all duration-300"
                        >
                            <div className="text-3xl font-black text-foreground tracking-tight">{stat.value}</div>
                            <div className="text-sm text-muted-foreground">{stat.label}</div>
                            {stat.visual}
                        </motion.div>
                    ))}
                </div>

                {/* Testimonials - asymmetric grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-16">

                    {/* Featured quote — spans 2 cols */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2 relative p-8 rounded-2xl bg-card border border-primary/20 shadow-lg overflow-hidden group hover:border-primary/40 hover:shadow-xl transition-all duration-300"
                    >
                        {/* Decorative quote mark */}
                        <Quote className="absolute top-6 right-6 h-20 w-20 text-primary/6 rotate-180" />

                        <div className="relative z-10 flex flex-col h-full gap-6">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                                ))}
                            </div>

                            <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed flex-1">
                                "{featured.quote}"
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-full ${featured.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                                        {featured.initials}
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground text-sm">{featured.author}</div>
                                        <div className="text-xs text-muted-foreground">{featured.role}</div>
                                    </div>
                                </div>
                                <span className="px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200/50 dark:border-emerald-800/50">
                                    {featured.tag}
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Smaller card — col 3, row 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col gap-4"
                    >
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                            ))}
                        </div>
                        <p className="text-foreground leading-relaxed flex-1">"{testimonials[0].quote}"</p>
                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                            <div className="flex items-center gap-2.5">
                                <div className={`h-8 w-8 rounded-full ${testimonials[0].color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                    {testimonials[0].initials}
                                </div>
                                <div>
                                    <div className="font-bold text-foreground text-xs">{testimonials[0].author}</div>
                                    <div className="text-[11px] text-muted-foreground">{testimonials[0].role}</div>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[11px] font-bold border border-primary/15">
                                {testimonials[0].tag}
                            </span>
                        </div>
                    </motion.div>

                    {/* Bottom row — 3 equal cards */}
                    {testimonials.slice(1).map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 + idx * 0.1 }}
                            className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col gap-4"
                        >
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                ))}
                            </div>
                            <p className="text-foreground leading-relaxed flex-1">"{t.quote}"</p>
                            <div className="flex items-center justify-between border-t border-border/50 pt-4">
                                <div className="flex items-center gap-2.5">
                                    <div className={`h-8 w-8 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                                        {t.initials}
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground text-xs">{t.author}</div>
                                        <div className="text-[11px] text-muted-foreground">{t.role}</div>
                                    </div>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-primary/8 text-primary text-[11px] font-bold border border-primary/15">
                                    {t.tag}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Companies */}
                <div className="text-center space-y-5">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Used by people at
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {companies.map((c, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06 }}
                                className="px-4 py-2 rounded-full border border-border/60 bg-card text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors duration-200 cursor-default"
                            >
                                {c}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
