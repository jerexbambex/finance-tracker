import { Link } from '@inertiajs/react';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingTeaser() {
    return (
        <section className="py-24 bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto px-6 max-w-5xl text-center">
                <div className="space-y-8">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                        Completely free. <br />
                        No credit card required.
                    </h2>
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Budget App is free to use with all features included. Start managing your money smarter today.
                    </p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 max-w-4xl mx-auto">
                        {[
                            "Unlimited accounts",
                            "Budget tracking",
                            "Goal planning",
                            "Transaction history",
                            "Category insights",
                            "Recurring transactions",
                            "Reports & analytics",
                            "Mobile access"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 justify-center md:justify-start">
                                <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                </div>
                                <span className="font-medium text-foreground">{item}</span>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8">
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Get Started Free
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
