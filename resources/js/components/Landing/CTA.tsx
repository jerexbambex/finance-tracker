import { Link, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';

import { type SharedData } from '@/types';

const included = ['Unlimited accounts and transactions', 'Budgets, goals and bill reminders', 'Reports, exports and CSV import', 'All ten supported currencies'];

export default function CTA() {
    const { auth, canRegister = true } = usePage<SharedData & { canRegister?: boolean }>().props;
    const user = auth?.user;

    return (
        <section id="pricing" className="scroll-mt-16">
            <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
                {/* Deep ink-green in both themes: the one inverted block on the page. */}
                <div className="relative overflow-hidden rounded-3xl bg-[oklch(0.24_0.05_165)] px-6 py-12 text-white ring-1 ring-white/10 sm:px-12 sm:py-16">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_70%)] bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgba(255,255,255,0.07)_31px,rgba(255,255,255,0.07)_32px)]"
                    />

                    <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end">
                        <div className="lg:col-span-7">
                            <h2 className="font-display text-4xl leading-[1.05] font-semibold tracking-[-0.03em] text-balance sm:text-6xl">
                                Free, with everything included.
                            </h2>
                            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
                                No trial clock and no card on file. Start with one account today and add the rest when you have a minute.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                {user ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-base font-medium text-[oklch(0.24_0.05_165)] transition active:scale-[0.98] hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                    >
                                        Open dashboard
                                    </Link>
                                ) : (
                                    <>
                                        {canRegister && (
                                            <Link
                                                href="/register"
                                                className="inline-flex h-12 items-center rounded-xl bg-white px-6 text-base font-medium text-[oklch(0.24_0.05_165)] transition active:scale-[0.98] hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                            >
                                                Create free account
                                            </Link>
                                        )}
                                        <Link
                                            href="/login"
                                            className="inline-flex h-12 items-center rounded-xl border border-white/25 px-6 text-base font-medium text-white transition active:scale-[0.98] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                                        >
                                            Log in
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        <ul className="space-y-3 lg:col-span-5 lg:border-l lg:border-white/15 lg:pl-10">
                            {included.map((item) => (
                                <li key={item} className="flex items-start gap-3 text-[0.95rem] text-white/90">
                                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" strokeWidth={2.5} aria-hidden="true" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}
