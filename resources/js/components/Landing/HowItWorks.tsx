import { motion } from 'framer-motion';
import { UserPlus, Building2, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="py-32 bg-background border-y border-border/40 relative">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:100px_100px]" />

            <div className="container mx-auto px-6 max-w-7xl relative z-10">
                <div className="text-center mb-24 space-y-4">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-border bg-background shadow-sm text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                        Simple Onboarding
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground">
                        From chaos to clarity <br /> in <span className="text-primary italic">minutes.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[20%] left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-border to-transparent -z-10 border-t border-dashed border-border" />

                    {/* Step 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="relative flex flex-col items-center text-center group"
                    >
                        <div className="h-32 w-32 rounded-[2rem] bg-background border-2 border-border shadow-2xl flex items-center justify-center mb-10 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:border-primary/50 group-hover:shadow-[0_0_40px_-10px_rgba(37,99,235,0.3)]">
                            <UserPlus className="h-12 w-12 text-primary" strokeWidth={1} />
                            <div className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg border-4 border-background">
                                1
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Create Account</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed max-w-xs">
                            Sign up securely in seconds. No lengthy forms or credit card required.
                        </p>
                    </motion.div>

                    {/* Step 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="relative flex flex-col items-center text-center group"
                    >
                        <div className="h-32 w-32 rounded-[2rem] bg-background border-2 border-border shadow-2xl flex items-center justify-center mb-10 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:border-blue-500/50 group-hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]">
                            <Building2 className="h-12 w-12 text-blue-500" strokeWidth={1} />
                            <div className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-lg border-4 border-background">
                                2
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Connect Assets</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed max-w-xs">
                            Securely link your bank accounts or import data via CSV instantly.
                        </p>
                    </motion.div>

                    {/* Step 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="relative flex flex-col items-center text-center group"
                    >
                        <div className="h-32 w-32 rounded-[2rem] bg-background border-2 border-border shadow-2xl flex items-center justify-center mb-10 relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:border-emerald-500/50 group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
                            <TrendingUp className="h-12 w-12 text-emerald-500" strokeWidth={1} />
                            <div className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-lg border-4 border-background">
                                3
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">See Growth</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed max-w-xs">
                            Get instant insights and watch your net worth grow with smart budgeting.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
