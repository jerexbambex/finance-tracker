import { type ReactNode } from 'react';

function Specimen({ children }: { children: ReactNode }) {
    return (
        <div aria-hidden="true" className="rounded-xl border border-border bg-card px-4 py-3 shadow-xs transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md motion-reduce:transform-none">
            {children}
        </div>
    );
}

const steps = [
    {
        title: 'Add your accounts',
        body: 'Bank, cash, savings, cards. Give each one a name, a currency and its current balance.',
        specimen: (
            <Specimen>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-foreground">Main checking</p>
                        <p className="text-xs text-muted-foreground">Bank account, USD</p>
                    </div>
                    <p className="text-sm font-medium text-foreground tabular-nums">$ 1,805.00</p>
                </div>
            </Specimen>
        ),
    },
    {
        title: 'Record what moves',
        body: 'Type transactions in as they happen, import a CSV from your bank, or set recurring ones to post on their own.',
        specimen: (
            <Specimen>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-sm text-foreground">Groceries</p>
                        <p className="text-xs text-muted-foreground">Today, Food & dining</p>
                    </div>
                    <p className="text-sm font-medium text-foreground tabular-nums">−$ 62.00</p>
                </div>
            </Specimen>
        ),
    },
    {
        title: 'Set limits and targets',
        body: 'Give each category a monthly budget and each goal an amount. Penniepal tracks both against what you actually spend.',
        specimen: (
            <Specimen>
                <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm text-foreground">Food & dining</p>
                    <p className="text-xs text-muted-foreground tabular-nums">$ 125.60 left of $ 400.00</p>
                </div>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full w-[69%] origin-left rounded-full bg-chart-1 transition-transform duration-500 ease-out group-hover:scale-x-110 motion-reduce:transform-none" />
                </div>
            </Specimen>
        ),
    },
];

export default function HowItWorks() {
    return (
        <section id="getting-started" className="scroll-mt-16 border-b border-border bg-muted/60 dark:bg-muted/30">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
                <div className="grid gap-6 lg:grid-cols-12">
                    <h2 className="font-display text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-[2.75rem] lg:col-span-7">
                        Set up in an evening. Useful from the first entry.
                    </h2>
                    <p className="max-w-md text-[0.95rem] leading-relaxed text-muted-foreground lg:col-span-5 lg:pt-3">
                        There is nothing to connect and nothing to configure. You start with one account and one number, and build from there.
                    </p>
                </div>

                <ol className="mt-14 border-t border-border">
                    {steps.map((step, index) => (
                        <li
                            key={step.title}
                            className="group grid grid-cols-[3rem_1fr] items-center gap-x-4 gap-y-5 border-b border-border py-8 sm:grid-cols-[5rem_1fr] lg:grid-cols-[5rem_1fr_20rem] lg:gap-x-10"
                        >
                            <span className="self-start font-display text-4xl leading-none font-semibold text-primary tabular-nums sm:text-5xl" aria-hidden="true">
                                {index + 1}
                            </span>
                            <div>
                                <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">{step.title}</h3>
                                <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-muted-foreground">{step.body}</p>
                            </div>
                            <div className="col-start-2 lg:col-start-3">{step.specimen}</div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
