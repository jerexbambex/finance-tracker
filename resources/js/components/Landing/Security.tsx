import { Link } from '@inertiajs/react';

const facts = [
    {
        title: 'We never ask for your bank login',
        body: 'Penniepal does not connect to your bank. You enter or import your own records, so there are no banking credentials for anyone to lose.',
    },
    {
        title: 'Two-factor sign-in',
        body: 'Add an authenticator app to your account and keep recovery codes for the day you lose your phone.',
    },
    {
        title: 'Take everything with you',
        body: 'Export every account, transaction, budget and goal as a single file whenever you like, and restore it later.',
    },
    {
        title: 'Leave whenever you want',
        body: 'Delete your account from settings and your data goes with it.',
    },
];

export default function Security() {
    return (
        <section id="privacy" className="scroll-mt-16 border-b border-border">
            <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-12">
                <div className="lg:col-span-4">
                    <h2 className="font-display text-3xl leading-tight font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
                        Your records stay yours.
                    </h2>
                    <p className="mt-4 max-w-sm text-[0.95rem] leading-relaxed text-muted-foreground">
                        The details are in the{' '}
                        <Link href="/privacy-policy" className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
                            privacy policy
                        </Link>
                        .
                    </p>
                </div>

                <dl className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
                    {facts.map((fact) => (
                        <div key={fact.title} className="border-t border-border py-6">
                            <dt className="font-display text-lg font-semibold tracking-tight text-foreground">{fact.title}</dt>
                            <dd className="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">{fact.body}</dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
