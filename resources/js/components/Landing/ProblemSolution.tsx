import { X, Check } from 'lucide-react';

export default function ProblemSolution() {
    return (
        <section className="py-24 bg-muted/30">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
                        Stop managing money in the dark.
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Most people fail at budgeting because the tools they use are broken.
                        Upgrade to a system designed for clarity.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                    {/* The Old Way */}
                    <div className="bg-background/50 border border-red-500/10 rounded-3xl p-8 md:p-10 relative overflow-hidden group hover:border-red-500/20 transition-all">
                        <div className="absolute top-0 right-0 bg-red-500/10 text-red-600 px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">
                            The Old Way
                        </div>
                        <h3 className="text-2xl font-bold mb-6 text-foreground/80">Manual Chaos</h3>
                        <ul className="space-y-4">
                            {[
                                "Spreadsheets break constantly",
                                "Forgetting to log expenses",
                                "Scattered bank logins",
                                "No real-time visibility",
                                "Stress at the end of the month"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-muted-foreground">
                                    <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* The New Way */}
                    <div className="bg-card border border-primary/20 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-primary/5 group hover:border-primary/40 transition-all">
                        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-xl text-xs font-bold uppercase tracking-wider">
                            The Budget App Way
                        </div>
                        <h3 className="text-2xl font-bold mb-6 text-primary">Intelligent Control</h3>
                        <ul className="space-y-4">
                            {[
                                "Automated bank syncing",
                                "Smart auto-categorization",
                                "One dashboard for everything",
                                "Real-time alerts & insights",
                                "Total peace of mind"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 text-foreground font-medium">
                                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Check className="h-3.5 w-3.5 text-primary" strokeWidth={3} />
                                    </div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
