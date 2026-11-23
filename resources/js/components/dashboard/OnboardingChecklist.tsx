import { Link, router } from '@inertiajs/react';
import { Check, X } from 'lucide-react';
import { useState } from 'react';

import { KravioCard } from '@/components/dashboard/KravioCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Step {
    id: string;
    title: string;
    description: string;
    done: boolean;
    href: string | null;
    action: string | null;
    secondary?: { href: string; action: string };
}

export interface Onboarding {
    steps: Step[];
    completed: number;
    total: number;
}

interface Props {
    onboarding: Onboarding;
    baseCurrency: string;
    currencies: Record<string, { symbol: string; label: string }>;
}

export function OnboardingChecklist({ onboarding, baseCurrency, currencies }: Props) {
    const [currency, setCurrency] = useState(baseCurrency);
    const [saving, setSaving] = useState(false);
    const nextStepId = onboarding.steps.find((s) => !s.done)?.id;
    const percent = Math.round((onboarding.completed / onboarding.total) * 100);

    const confirmCurrency = () =>
        router.post(
            '/onboarding/currency',
            { base_currency: currency },
            { preserveScroll: true, onStart: () => setSaving(true), onFinish: () => setSaving(false) },
        );

    const dismiss = () => router.post('/onboarding/dismiss', {}, { preserveScroll: true });

    return (
        <KravioCard innerClassName="p-5 sm:p-6" aria-labelledby="onboarding-title">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 id="onboarding-title" className="text-base font-semibold tracking-tight">
                        Get set up
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {onboarding.completed} of {onboarding.total} done — a few minutes now makes every number below meaningful.
                    </p>
                </div>
                <Button variant="ghost" size="sm" onClick={dismiss} className="h-7 gap-1 text-xs text-muted-foreground">
                    <X className="h-3.5 w-3.5" /> Hide
                </Button>
            </div>

            <div
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Setup progress"
            >
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>

            <ol className="mt-4 divide-y divide-border/50">
                {onboarding.steps.map((step, i) => {
                    const isNext = step.id === nextStepId;
                    return (
                        <li key={step.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3 min-w-0">
                                <span
                                    className={cn(
                                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold',
                                        step.done
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : isNext
                                              ? 'border-primary text-primary'
                                              : 'border-border text-muted-foreground',
                                    )}
                                    aria-hidden
                                >
                                    {step.done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                                </span>
                                <div className="min-w-0">
                                    <p className={cn('text-sm font-medium', step.done && 'text-muted-foreground line-through')}>
                                        {step.title}
                                        <span className="sr-only">{step.done ? ' (done)' : ''}</span>
                                    </p>
                                    {!step.done && <p className="text-xs text-muted-foreground">{step.description}</p>}
                                </div>
                            </div>

                            {!step.done && step.id === 'currency' && (
                                <div className="flex items-center gap-2 pl-9 sm:pl-0">
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger className="h-8 w-48 text-xs" aria-label="Main currency">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(currencies).map(([code, c]) => (
                                                <SelectItem key={code} value={code} className="text-xs">
                                                    {c.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button size="sm" className="h-8 text-xs" onClick={confirmCurrency} disabled={saving}>
                                        {saving ? 'Saving…' : 'Confirm'}
                                    </Button>
                                </div>
                            )}

                            {!step.done && step.href && (
                                <div className="flex items-center gap-2 pl-9 sm:pl-0">
                                    {step.secondary && (
                                        <Button asChild size="sm" variant="ghost" className="h-8 text-xs">
                                            <Link href={step.secondary.href}>{step.secondary.action}</Link>
                                        </Button>
                                    )}
                                    <Button asChild size="sm" variant={isNext ? 'default' : 'outline'} className="h-8 text-xs">
                                        <Link href={step.href}>{step.action}</Link>
                                    </Button>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ol>
        </KravioCard>
    );
}
