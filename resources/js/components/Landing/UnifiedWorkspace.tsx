import { motion } from 'framer-motion';
import { Layers, CreditCard, PiggyBank, FileText, BarChart3 } from 'lucide-react';

const workspaceItems = [
    {
        icon: PiggyBank,
        title: "Budgeting",
        desc: "Zero-based budgeting"
    },
    {
        icon: CreditCard,
        title: "Expenses",
        desc: "Auto-synced transactions"
    },
    {
        icon: BarChart3,
        title: "Investments",
        desc: "Portfolio tracking"
    },
    {
        icon: Layers,
        title: "Planning",
        desc: "Retirement forecasting"
    },
    {
        icon: FileText,
        title: "Reports",
        desc: "Tax-ready exports"
    }
];

export default function UnifiedWorkspace() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 blur-[100px] -z-10 rounded-full" />

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
                        One unified <span className="text-primary">financial workspace.</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Stop switching between spreadsheet tabs and bank apps.
                        Bring your entire financial life into one secure dashboard.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {workspaceItems.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="flex flex-col items-center text-center p-8 rounded-3xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group cursor-default"
                        >
                            <div className="h-16 w-16 rounded-2xl bg-secondary/50 group-hover:bg-primary/10 flex items-center justify-center text-foreground group-hover:text-primary transition-all duration-300 mb-6 group-hover:-translate-y-1">
                                <item.icon className="h-7 w-7" strokeWidth={1.5} />
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-foreground">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-snug">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
