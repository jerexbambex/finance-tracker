import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Bot, Sparkles } from 'lucide-react';

const features = [
    { text: 'Unlimited accounts', new: false },
    { text: 'Budget tracking', new: false },
    { text: 'Goal planning', new: false },
    { text: 'AI Finance Chat', new: true },
    { text: 'Category insights', new: false },
    { text: 'Reports & analytics', new: false },
    { text: 'Recurring transactions', new: false },
    { text: 'Mobile access', new: false },
];

export default function PricingTeaser() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-6 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl border border-primary/20 bg-card overflow-hidden shadow-xl"
                >
                    {/* Background accent */}
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/4 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-primary/10 blur-[60px] pointer-events-none" />

                    <div className="relative z-10 p-8 md:p-12">
                        {/* Badge */}
                        <div className="flex justify-center mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                                <Sparkles className="h-4 w-4" />
                                Always free — no credit card
                            </div>
                        </div>

                        {/* Price */}
                        <div className="text-center mb-8">
                            <div className="text-6xl font-black text-foreground tracking-tight mb-1">$0</div>
                            <p className="text-muted-foreground">Every feature. Forever free.</p>
                        </div>

                        {/* Feature grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            {features.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06 }}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                                        item.new
                                            ? 'bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-800/40'
                                            : 'bg-muted/40'
                                    }`}
                                >
                                    {item.new ? (
                                        <Bot className="h-4 w-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                                    ) : (
                                        <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center flex-shrink-0">
                                            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                                        </div>
                                    )}
                                    <span className={`text-sm font-medium ${item.new ? 'text-violet-700 dark:text-violet-300' : 'text-foreground'}`}>
                                        {item.text}
                                    </span>
                                    {item.new && (
                                        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/50">
                                            NEW
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link
                                href="/register"
                                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 text-sm"
                            >
                                Get Started Free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/register"
                                className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold transition-all text-sm"
                            >
                                <Bot className="h-4 w-4" />
                                Try AI Chat
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
