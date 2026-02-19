import { Head } from '@inertiajs/react';
import { ShieldCheck, UserCircle, Database, Lock, Clock, Mail, Scale } from 'lucide-react';

import Footer from '@/components/Landing/Footer';
import Navbar from '@/components/Landing/Navbar';
import CookieConsent from '@/components/Landing/CookieConsent';

export default function PrivacyPolicy() {
    return (
        <>
            <Head title="Privacy Policy - BudgetApp" />

            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary relative overflow-hidden">
                {/* Background Ambient Effects */}
                <div className="absolute top-0 inset-x-0 h-screen overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 dark:bg-emerald-500/10 blur-[120px] rounded-full" />
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/5 blur-[120px] rounded-full" />
                </div>

                <Navbar />

                <main className="pt-32 pb-24 relative z-10">
                    <div className="container mx-auto px-6 max-w-4xl">

                        {/* Page Header */}
                        <div className="text-center mb-16 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium mb-4">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Legal Documentation</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                                Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-emerald-600">Policy</span>
                            </h1>
                            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                                We believe in complete transparency. Here's exactly how we collect, use, and protect your personal financial data.
                            </p>
                            <p className="text-sm font-medium text-muted-foreground/80">
                                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                        </div>

                        {/* Content Container (Glassmorphism) */}
                        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">

                            {/* Inner subtle glow */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full" />

                            <div className="space-y-16 relative z-10">

                                {/* Section 1 */}
                                <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                                    <div className="md:w-1/4 shrink-0">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                                            <UserCircle className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground">Information We Collect</h2>
                                    </div>
                                    <div className="md:w-3/4 space-y-4 text-muted-foreground">
                                        <p>
                                            When you use BudgetApp, we only collect what's necessary to provide you with a world-class financial experience. This includes:
                                        </p>
                                        <ul className="space-y-3 list-none pl-0">
                                            <li className="flex gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                                <span><strong className="text-foreground">Identity & Profile:</strong> Your name, email address, and authentication credentials.</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                                <span><strong className="text-foreground">Financial Data:</strong> Encrypted records of transactions, budgets, and account balances inputted by you.</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                                <span><strong className="text-foreground">Usage Analytics:</strong> Anonymous telemetry on how you navigate the app to help us improve performance.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </section>

                                <hr className="border-border/50" />

                                {/* Section 2 */}
                                <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                                    <div className="md:w-1/4 shrink-0">
                                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                                            <Database className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground">How We Use Data</h2>
                                    </div>
                                    <div className="md:w-3/4 space-y-4 text-muted-foreground">
                                        <p>
                                            Your data is your property. We only process it to make BudgetApp work for you:
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                            <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                                                <h4 className="text-foreground font-medium mb-2">Core Services</h4>
                                                <p className="text-sm">To calculate budgets, generate reports, and maintain your account.</p>
                                            </div>
                                            <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
                                                <h4 className="text-foreground font-medium mb-2">Security</h4>
                                                <p className="text-sm">To prevent fraud, unauthorized access, and protect your identity.</p>
                                            </div>
                                        </div>
                                        <p className="mt-4 text-emerald-700 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-500/10 inline-block px-3 py-1 rounded-md text-sm border border-emerald-200 dark:border-emerald-500/20">
                                            We never sell your personal or financial data to third parties.
                                        </p>
                                    </div>
                                </section>

                                <hr className="border-border/50" />

                                {/* Section 3 */}
                                <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                                    <div className="md:w-1/4 shrink-0">
                                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                                            <Lock className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground">Data Security</h2>
                                    </div>
                                    <div className="md:w-3/4 space-y-4 text-muted-foreground">
                                        <p>
                                            Security is baked into our DNA. We use bank-level encryption protocols to protect your information in transit and at rest.
                                        </p>
                                        <p>
                                            Access to your sensitive data is strictly limited to authenticated sessions. We employ rigorous internal access controls, regular security audits, and continuous monitoring to ensure your financial life remains entirely private.
                                        </p>
                                    </div>
                                </section>

                                <hr className="border-border/50" />

                                {/* Section 4 */}
                                <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                                    <div className="md:w-1/4 shrink-0">
                                        <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
                                            <Clock className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground">Data Retention</h2>
                                    </div>
                                    <div className="md:w-3/4 space-y-4 text-muted-foreground">
                                        <p>
                                            We keep your personal information only as long as you have an active account with us. If you choose to delete your account, your data will be permanently wiped from our primary servers within 30 days, adhering strictly to global data protection standards.
                                        </p>
                                    </div>
                                </section>

                                <hr className="border-border/50" />

                                {/* Section 5 */}
                                <section className="flex flex-col md:flex-row gap-6 md:gap-12">
                                    <div className="md:w-1/4 shrink-0">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                                            <Scale className="w-6 h-6" />
                                        </div>
                                        <h2 className="text-xl font-bold text-foreground">Your Rights</h2>
                                    </div>
                                    <div className="md:w-3/4 space-y-4 text-muted-foreground">
                                        <p>
                                            Depending on your location, you hold significant rights regarding your data:
                                        </p>
                                        <ul className="grid sm:grid-cols-2 gap-3 text-sm">
                                            <li className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-border/30"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" /> Right to Access</li>
                                            <li className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-border/30"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" /> Right to Erasure ("To be forgotten")</li>
                                            <li className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-border/30"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" /> Right to Rectification</li>
                                            <li className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-border/30"><div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" /> Right to Data Portability</li>
                                        </ul>
                                    </div>
                                </section>

                            </div>
                        </div>

                        {/* Contact Block */}
                        <div className="mt-12 text-center">
                            <h3 className="text-xl font-semibold text-foreground mb-4">Have privacy concerns?</h3>
                            <a
                                href="mailto:privacy@budgetapp.com"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border hover:border-emerald-500/50 hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground group shadow-sm"
                            >
                                <Mail className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                privacy@budgetapp.com
                            </a>
                        </div>

                    </div>
                </main>

                <CookieConsent />

                <Footer />
            </div>
        </>
    );
}
