import { motion } from 'framer-motion';
import { XCircle, GitMerge, ZapOff, CheckCircle2 } from 'lucide-react';

const painPoints = [
    {
        icon: GitMerge,
        title: "Disconnected Data",
        desc: "Your bank, credit cards, and investments live in separate apps. You have no single source of truth.",
        delay: 0
    },
    {
        icon: XCircle,
        title: "Manual Overload",
        desc: "Spreadsheets break. Manual entry feels like a second job. You eventually stop updating them.",
        delay: 0.1
    },
    {
        icon: ZapOff,
        title: "Zero Intelligence",
        desc: "Banking apps tell you what you spent, not what you can afford. They look backward, not forward.",
        delay: 0.2
    }
];

export default function PainPoints() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                        Why most budgeting apps <span className="text-red-500/80">fail you.</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Managing money shouldn't feel like a chore. If you're tired of broken spreadsheets
                        and disconnected apps, you're not alone.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {painPoints.map((point, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: point.delay, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="bg-muted/30 border border-border p-8 rounded-3xl"
                        >
                            <div className="h-12 w-12 rounded-xl bg-background border border-border flex items-center justify-center mb-6 shadow-sm text-muted-foreground">
                                <point.icon className="h-6 w-6" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-foreground">{point.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{point.desc}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium text-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Budget App fixes this automatically</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
