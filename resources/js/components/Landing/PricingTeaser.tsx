import { Link } from '@inertiajs/react';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingTeaser() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid md:grid-cols-2 gap-12 items-center">

                    {/* Content */}
                    <div className="space-y-8 order-2 md:order-1">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Start for free. <br />
                            Upgrade when you grow.
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Budget App is free forever for personal use. Track unlimited manual accounts
                            and get basic insights without paying a dime.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Unlimited manual accounts",
                                "Basic budgeting goals",
                                "Monthly report",
                                "Mobile app access"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                    </div>
                                    <span className="font-medium text-foreground">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card */}
                    <div className="order-1 md:order-2 flex justify-center md:justify-end">
                        <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-10 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            {/* Pro Badge */}
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">
                                Most Popular
                            </div>

                            <div className="mb-8">
                                <div className="text-lg font-bold text-muted-foreground mb-2">Pro Plan</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-foreground">$9</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                                <div className="text-sm text-muted-foreground mt-2">Billed annually</div>
                            </div>

                            <Link
                                href="/register"
                                className="w-full h-12 rounded-xl bg-foreground text-background font-bold flex items-center justify-center hover:bg-foreground/90 transition-colors mb-8"
                            >
                                Start 14-Day Free Trial
                            </Link>

                            <div className="space-y-3 pt-6 border-t border-border">
                                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Everything in Free, plus:</div>
                                {[
                                    "Auto-sync 12,000+ banks",
                                    "AI Spend Forecasting",
                                    "Net Worth Tracking",
                                    "Custom Categories"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <Check className="h-4 w-4 text-blue-500" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
