import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SharedData } from '@/types';

export default function CTA() {
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user;

    return (
        <section className="py-24 bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto px-6 max-w-4xl text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                        Why are you still using{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-400">
                            spreadsheets?
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Start managing money the way it should be. Free forever, no credit card required.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {user ? (
                            <Link
                                href="/dashboard"
                                className="h-12 px-8 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                Go to Dashboard
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/register"
                                    className="h-12 px-8 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    Get Started Free
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="h-12 px-8 rounded-lg border border-border bg-background hover:bg-muted transition-all flex items-center gap-2"
                                >
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Join 12,000+ people managing their money smarter
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
