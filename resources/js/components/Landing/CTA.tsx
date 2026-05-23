import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, MessageSquare, Sparkles } from 'lucide-react';

import { SharedData } from '@/types';

const avatarColors = [
    'bg-emerald-400',
    'bg-blue-400',
    'bg-violet-400',
    'bg-teal-400',
    'bg-indigo-400',
];

export default function CTA() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    return (
        <section className="py-24 bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto px-6 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-3xl border border-border/60 bg-card overflow-hidden shadow-2xl"
                >
                    {/* Background layers */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-primary/8 blur-[80px] pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

                    <div className="relative z-10 px-8 py-16 md:px-16 text-center space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/8 px-4 py-2 text-sm font-medium text-violet-600 dark:text-violet-400">
                            <Sparkles className="h-4 w-4" />
                            <span>AI Finance Assistant included — free</span>
                        </div>

                        {/* Headline */}
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Why are you still using{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">
                                spreadsheets?
                            </span>
                        </h2>

                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            Start for free. No credit card. Ask the AI to set your first budget in under 30 seconds.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="h-13 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center gap-2 text-base"
                                >
                                    Go to Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/register"
                                        className="h-13 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center gap-2 text-base"
                                    >
                                        Get Started Free
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="h-13 px-8 py-3.5 rounded-xl border border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold transition-all flex items-center gap-2 text-base"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Try AI Chat
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Social proof */}
                        <div className="flex items-center justify-center gap-3">
                            <div className="flex -space-x-2">
                                {avatarColors.map((color, i) => (
                                    <div
                                        key={i}
                                        className={`h-8 w-8 rounded-full ${color} border-2 border-card flex items-center justify-center`}
                                    >
                                        <span className="text-[10px] font-bold text-white">
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Joined by <span className="font-semibold text-foreground">12,000+</span> people managing money smarter
                            </p>
                        </div>

                        {/* AI proof strip */}
                        <div className="pt-4 border-t border-border/40">
                            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Bot className="h-4 w-4 text-violet-500" />
                                    GPT-4 & Claude powered
                                </span>
                                <span className="hidden sm:block h-1 w-1 rounded-full bg-border" />
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="h-4 w-4 text-emerald-500" />
                                    Natural language budgeting
                                </span>
                                <span className="hidden sm:block h-1 w-1 rounded-full bg-border" />
                                <span>No credit card required</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
