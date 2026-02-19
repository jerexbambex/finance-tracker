import { motion } from 'framer-motion';
import { Cloud, Database, Globe, Server } from 'lucide-react';

export default function Integrations() {
    return (
        <section className="py-24 bg-background">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                            Connects with your ecosystem.
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Don't replace your banking stack—enhance it. We integrate securely with your existing accounts and tools.
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="p-2 bg-secondary rounded-lg text-primary mt-1">
                                    <Globe className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Bank Sync</h3>
                                    <p className="text-muted-foreground">Connect securely with 12,000+ banks and credit cards worldwide.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-2 bg-secondary rounded-lg text-primary mt-1">
                                    <Database className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">One-Click Imports</h3>
                                    <p className="text-muted-foreground">Migrate from Mint, YNAB, or Excel in seconds.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="p-2 bg-secondary rounded-lg text-primary mt-1">
                                    <Server className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Export Anytime</h3>
                                    <p className="text-muted-foreground">Your data belongs to you. Export to CSV, PDF, or JSON whenever you want.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-8 rounded-3xl border border-border">
                        {/* Abstract Integration Visual */}
                        <div className="grid grid-cols-3 gap-4">
                            {[...Array(9)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="aspect-square bg-card rounded-xl border border-border flex items-center justify-center shadow-sm"
                                >
                                    <div className={`h-8 w-8 rounded-full ${i % 2 === 0 ? 'bg-primary/20' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                </motion.div>
                            ))}
                        </div>
                        <div className="text-center mt-8 p-4 bg-primary/10 rounded-xl border border-primary/20">
                            <code className="text-sm font-mono text-primary">npm install @budget-app/sdk</code>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
