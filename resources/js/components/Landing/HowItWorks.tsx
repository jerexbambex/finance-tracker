import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, FileUp, LayoutDashboard, Plus, ReceiptText, Target, Wallet } from 'lucide-react';

const onboardingSteps = [
    {
        eyebrow: 'Step 01',
        title: 'Create your workspace',
        description: 'Start with a secure account and a clean financial home. No credit card, no long setup wizard.',
        icon: LayoutDashboard,
        detail: 'Secure profile created',
    },
    {
        eyebrow: 'Step 02',
        title: 'Add accounts and activity',
        description: 'Add your cash, checking, credit, or savings accounts, then import transactions when you are ready.',
        icon: Wallet,
        detail: 'Accounts and imports ready',
    },
    {
        eyebrow: 'Step 03',
        title: 'Turn data into decisions',
        description: 'Set budgets, track goals, review reminders, and see your dashboard update around the choices that matter.',
        icon: Target,
        detail: 'Budgets and goals live',
    },
];

const setupChecklist = [
    { label: 'Account created', meta: 'Profile and preferences saved', done: true },
    { label: 'Checking account added', meta: '$8,420.50 starting balance', done: true },
    { label: 'CSV transactions imported', meta: '128 rows categorized', done: true },
    { label: 'Monthly budgets set', meta: 'Groceries, dining, bills', done: false },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="relative overflow-hidden border-y border-border/40 bg-background py-24">
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] bg-[size:72px_72px]" />
            <div className="absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

            <div className="container mx-auto max-w-7xl px-6">
                <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-5 inline-flex items-center rounded-full border border-border bg-card px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground shadow-sm"
                        >
                            Simple Onboarding
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.06 }}
                            className="max-w-xl text-4xl font-black tracking-tight text-foreground md:text-5xl"
                        >
                            From first account to useful dashboard in minutes.
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0, y: 14 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.12 }}
                            className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground"
                        >
                            Onboarding should feel like making progress, not filling out forms. Budget App guides users through the few details needed to make the dashboard useful right away.
                        </motion.p>

                        <div className="mt-8 space-y-4">
                            {onboardingSteps.map((step, index) => {
                                const Icon = step.icon;

                                return (
                                    <motion.div
                                        key={step.title}
                                        initial={{ opacity: 0, x: -16 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.08 + 0.18 }}
                                        className="group flex gap-4 rounded-lg border border-border/70 bg-card p-4 transition duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                                    >
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition duration-200 group-hover:scale-105">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-bold uppercase tracking-wider text-primary">{step.eyebrow}</span>
                                                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{step.detail}</span>
                                            </div>
                                            <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 28, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.12 }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 blur-2xl" />
                        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-black/10">
                            <div className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-4">
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Setup progress</p>
                                    <p className="text-xs text-muted-foreground">4 steps to a useful dashboard</p>
                                </div>
                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">75% complete</span>
                            </div>

                            <div className="p-5">
                                <div className="mb-5 h-2 overflow-hidden rounded-full bg-secondary">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '75%' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.9, delay: 0.35 }}
                                        className="h-full rounded-full bg-primary"
                                    />
                                </div>

                                <div className="space-y-3">
                                    {setupChecklist.map((item, index) => (
                                        <motion.div
                                            key={item.label}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.08 + 0.24 }}
                                            className="flex items-center gap-3 rounded-lg border border-border/70 bg-background p-3 transition duration-200 hover:border-primary/25 hover:bg-muted/30"
                                        >
                                            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.done ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                                                {item.done ? <CheckCircle2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                                                <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
                                            </div>
                                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border border-border/70 bg-background p-4">
                                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                                            <ReceiptText className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm font-semibold text-foreground">Smart categories</p>
                                        <p className="mt-1 text-xs text-muted-foreground">Transactions become readable patterns.</p>
                                    </div>
                                    <div className="rounded-lg border border-border/70 bg-background p-4">
                                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                                            <FileUp className="h-5 w-5" />
                                        </div>
                                        <p className="text-sm font-semibold text-foreground">Import friendly</p>
                                        <p className="mt-1 text-xs text-muted-foreground">Start with CSV data when manual setup is faster.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
