import { Head } from '@inertiajs/react';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import Footer from '@/components/Landing/Footer';
import Navbar from '@/components/Landing/Navbar';

type Status = 'ok' | 'degraded' | 'down';
type DayStatus = Status | 'none';

interface Day {
    date: string;
    status: DayStatus;
}

interface Component {
    name: string;
    key: string;
    status: Status;
    latency_ms: number | null;
    message: string;
    uptime: number | null;
    days: Day[];
}

interface Props {
    components: Component[];
    overall: Status;
    checkedAt: string;
    window: { days: number; from: string; to: string };
}

const STATUS_META: Record<Status, { label: string; icon: typeof CheckCircle2; text: string }> = {
    ok: { label: 'Operational', icon: CheckCircle2, text: 'text-emerald-600 dark:text-emerald-400' },
    degraded: { label: 'Degraded', icon: AlertTriangle, text: 'text-amber-600 dark:text-amber-400' },
    down: { label: 'Outage', icon: XCircle, text: 'text-red-600 dark:text-red-400' },
};

// Overall banner styling + copy, mirroring the Resend "fully operational" panel.
const BANNER: Record<Status, { icon: typeof CheckCircle2; title: string; subtitle: string; bg: string; ring: string; text: string; sub: string }> = {
    ok: {
        icon: CheckCircle2,
        title: "We're fully operational",
        subtitle: "We're not aware of any issues affecting our systems.",
        bg: 'bg-emerald-600 dark:bg-emerald-600/90',
        ring: 'border-emerald-500/40',
        text: 'text-white',
        sub: 'text-emerald-50/90',
    },
    degraded: {
        icon: AlertTriangle,
        title: 'Some systems are degraded',
        subtitle: "We're aware of reduced performance on some components.",
        bg: 'bg-amber-500 dark:bg-amber-500/90',
        ring: 'border-amber-400/40',
        text: 'text-white',
        sub: 'text-amber-50/90',
    },
    down: {
        icon: XCircle,
        title: "We're experiencing an outage",
        subtitle: 'One or more systems are currently unavailable.',
        bg: 'bg-red-600 dark:bg-red-600/90',
        ring: 'border-red-500/40',
        text: 'text-white',
        sub: 'text-red-50/90',
    },
};

const BAR_COLOR: Record<DayStatus, string> = {
    ok: 'bg-emerald-500 hover:bg-emerald-400',
    degraded: 'bg-amber-500 hover:bg-amber-400',
    down: 'bg-red-500 hover:bg-red-400',
    none: 'bg-muted-foreground/15 hover:bg-muted-foreground/25',
};

const DAY_LABEL: Record<DayStatus, string> = {
    ok: 'Operational',
    degraded: 'Degraded',
    down: 'Outage',
    none: 'No data',
};

function monthYear(date: string): string {
    return new Date(date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

function UptimeBars({ days }: { days: Day[] }) {
    return (
        <div className="flex items-stretch gap-[2px] h-9">
            {days.map((d) => (
                <div
                    key={d.date}
                    title={`${new Date(d.date + 'T00:00:00').toLocaleDateString()} — ${DAY_LABEL[d.status]}`}
                    className={`flex-1 min-w-[2px] rounded-[2px] transition-colors ${BAR_COLOR[d.status]}`}
                />
            ))}
        </div>
    );
}

export default function StatusPage(initial: Props) {
    const [data, setData] = useState<Props>(initial);
    const [refreshing, setRefreshing] = useState(false);

    const refresh = useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await fetch('/status.json', { headers: { Accept: 'application/json' } });
            const json = (await res.json()) as Props;
            setData(json);
        } catch {
            // Keep last-known data on transient network errors.
        } finally {
            setRefreshing(false);
        }
    }, []);

    // Poll every 30s while the tab is visible.
    useEffect(() => {
        const id = setInterval(() => {
            if (document.visibilityState === 'visible') {
                void refresh();
            }
        }, 30_000);
        return () => clearInterval(id);
    }, [refresh]);

    const banner = BANNER[data.overall];
    const BannerIcon = banner.icon;
    const range = `${monthYear(data.window.from)} – ${monthYear(data.window.to)}`;

    return (
        <>
            <Head title="System Status - BudgetApp" />

            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-screen overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                </div>

                <Navbar />

                <main className="pt-32 pb-24 relative z-10">
                    <div className="container mx-auto px-6 max-w-3xl">
                        {/* Overall banner */}
                        <div className={`flex items-center gap-4 rounded-2xl border p-6 mb-6 shadow-lg ${banner.bg} ${banner.ring}`}>
                            <BannerIcon className={`w-7 h-7 shrink-0 ${banner.text}`} />
                            <div>
                                <p className={`text-lg font-semibold ${banner.text}`}>{banner.title}</p>
                                <p className={`text-sm ${banner.sub}`}>{banner.subtitle}</p>
                            </div>
                        </div>

                        {/* System status panel */}
                        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                                <h2 className="text-base font-semibold text-foreground">System status</h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground tabular-nums">{range}</span>
                                    <button
                                        type="button"
                                        onClick={() => void refresh()}
                                        disabled={refreshing}
                                        title="Refresh"
                                        className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-background/50 h-8 w-8 text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="divide-y divide-border/50">
                                {data.components.map((c) => {
                                    const meta = STATUS_META[c.status];
                                    const Icon = meta.icon;
                                    return (
                                        <div key={c.key} className="px-6 py-5">
                                            <div className="flex items-center justify-between mb-2.5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Icon className={`w-4 h-4 shrink-0 ${meta.text}`} />
                                                    <span className="font-medium text-foreground">{c.name}</span>
                                                    {c.latency_ms !== null && (
                                                        <span className="text-xs font-mono text-muted-foreground/60 tabular-nums">
                                                            {c.latency_ms} ms
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-sm text-muted-foreground tabular-nums shrink-0">
                                                    {c.uptime !== null ? `${c.uptime}% uptime` : 'No data yet'}
                                                </span>
                                            </div>
                                            <UptimeBars days={c.days} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <p className="text-center text-sm text-muted-foreground/70 mt-8">
                            Last checked {new Date(data.checkedAt).toLocaleTimeString()} · machine-readable status at{' '}
                            <a href="/status.json" className="underline hover:text-foreground">
                                /status.json
                            </a>
                        </p>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
