import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        quote: "I've tried Mint, YNAB, and Personal Capital. Budget App is the only one I actually stuck with.",
        author: "Alex Rivera",
        role: "Software Engineer",
        tag: "Saved 45hrs/yr"
    },
    {
        quote: "Finally hit my emergency fund goal after 3 months. The visual progress tracking kept me motivated.",
        author: "Sarah Chen",
        role: "Product Designer",
        tag: "Goal Achieved"
    },
    {
        quote: "My wife and I can finally see our shared expenses without awkward money conversations.",
        author: "James Wilson",
        role: "Small Business Owner",
        tag: "Family Harmony"
    },
    {
        quote: "As a freelancer with irregular income, this is the first tool that actually helps me plan ahead.",
        author: "Maria Garcia",
        role: "Freelance Writer",
        tag: "Income Smoothed"
    },
    {
        quote: "Reduced my dining out spending by 40% just by seeing the numbers clearly. No judgment, just data.",
        author: "David Kim",
        role: "Marketing Manager",
        tag: "$480/mo Saved"
    },
    {
        quote: "The automatic categorization is scary accurate. Saves me so much time compared to manual entry.",
        author: "Emily Thompson",
        role: "Teacher",
        tag: "99% Accurate"
    }
];

const companies = ["TechFlow", "Nvidia", "Stripe", "Airbnb", "Vercel"];

export default function Testimonials() {
    return (
        <section className="py-24 bg-background overflow-hidden border-b border-border/40">
            <div className="container mx-auto px-6 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-16 space-y-6">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        Trusted by <span className="text-primary">smart savers</span> worldwide
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Join thousands who have stopped stressing about money and started building wealth.
                    </p>
                    
                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-8 pt-4">
                        <div className="text-center">
                            <div className="text-3xl font-black text-foreground">$50M+</div>
                            <div className="text-sm text-muted-foreground">Assets Tracked</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-foreground">4.9/5</div>
                            <div className="flex gap-0.5 text-amber-500 justify-center mt-1">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-foreground">12K+</div>
                            <div className="text-sm text-muted-foreground">Active Users</div>
                        </div>
                    </div>
                </div>

                {/* Testimonial Grid - 3 columns on desktop, 2 on tablet, 1 on mobile */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {testimonials.map((t, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                        >
                            <p className="text-foreground mb-6 leading-relaxed">"{t.quote}"</p>
                            <div className="flex justify-between items-end border-t border-border/50 pt-4">
                                <div>
                                    <div className="font-bold text-foreground text-sm">{t.author}</div>
                                    <div className="text-xs text-muted-foreground">{t.role}</div>
                                </div>
                                <div className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                    {t.tag}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Companies */}
                <div className="mt-16 text-center space-y-4">
                    <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Used by people at</p>
                    <div className="flex flex-wrap justify-center gap-8 opacity-50">
                        {companies.map((c, i) => (
                            <span key={i} className="text-lg font-bold">{c}</span>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
