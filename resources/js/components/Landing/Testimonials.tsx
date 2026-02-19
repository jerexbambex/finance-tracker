import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        quote: "I used to spend 4 hours a month on my finances. Now it takes 15 minutes. The automation is flawless.",
        author: "Alex Rivera",
        role: "Software Architect",
        tag: "Saved 45hrs/yr"
    },
    {
        quote: "Finally, a finance app that looks and feels like modern software. No clutter, just clarity.",
        author: "Sarah Chen",
        role: "Product Designer",
        tag: "Net Worth +22%"
    },
    {
        quote: "The ability to customize categories and rules is exactly what I needed. It adapts to my life, not the other way around.",
        author: "James Wilson",
        role: "Freelance Developer",
        tag: "Debt Free in 8mo"
    }
];

const companies = ["TechFlow", "Nvidia", "Stripe", "Airbnb", "Vercel"];

export default function Testimonials() {
    return (
        <section className="py-24 bg-background overflow-hidden border-b border-border/40">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-16 items-center">

                    {/* Left: Headline & Trust Stats */}
                    <div className="space-y-10">
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                Trusted by <span className="text-primary">smart savers</span> worldwide.
                            </h2>
                            <p className="text-xl text-muted-foreground max-w-md">
                                Join thousands of users who have stopped stressing about money and started building wealth.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                                <div className="text-4xl font-black text-foreground mb-1">$50M+</div>
                                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Assets Tracked</div>
                            </div>
                            <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                                <div className="text-4xl font-black text-foreground mb-1">4.9/5</div>
                                <div className="flex gap-0.5 text-amber-500 mb-1">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                                </div>
                                <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">App Store Rating</div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Used by people at</p>
                            <div className="flex flex-wrap gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                {companies.map((c, i) => (
                                    <span key={i} className="text-lg font-bold">{c}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Testimonial Cards */}
                    <div className="space-y-6 relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-600/20 blur-3xl opacity-20 rounded-full" />

                        {testimonials.map((t, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                viewport={{ once: true }}
                                className="relative p-8 rounded-3xl bg-card border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                            >
                                <p className="text-lg text-foreground mb-6 leading-relaxed font-medium">"{t.quote}"</p>
                                <div className="flex justify-between items-center border-t border-border/50 pt-6">
                                    <div>
                                        <div className="font-bold text-foreground">{t.author}</div>
                                        <div className="text-sm text-muted-foreground">{t.role}</div>
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                        {t.tag}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}
