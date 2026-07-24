import { Head } from '@inertiajs/react';
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import Footer from '@/components/Landing/Footer';
import Navbar from '@/components/Landing/Navbar';

type Status = 'ok' | 'degraded' | 'down';

interface Component {
    name: string;
    key: string;
    status: Status;
    latency_ms: number | null;
    message: string;
}

interface Props {
    components: Component[];
    overall: Status;
    checkedAt: string;
}

const STATUS_META: Record<Status, { label: string; icon: typeof CheckCircle2; text: string; bg: string; ring: string; dot: string }> = {
    ok: {
        label: 'Operational',
        icon: CheckCircle2,
        text: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        ring: 'border-emerald-200 dark:border-emerald-500/20',
        dot: 'bg-emerald-500',
    },
    degraded: {
        label: 'Degraded',
        icon: AlertTriangle,
        text: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        ring: 'border-amber-200 dark:border-amber-500/20',
        dot: 'bg-amber-500',
    },
    down: {
        label: 'Outage',
        icon: XCircle,
        text: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-500/10',
        ring: 'border-red-200 dark:border-red-500/20',
        dot: 'bg-red-500',
    },
};

const OVERALL_HEADLINE: Record<Status, string> = {
    ok: 'All systems operational',
    degraded: 'Some systems degraded',
    down: 'We are experiencing an outage',
};

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

    const overall = STATUS_META[data.overall];
    const OverallIcon = overall.icon;

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
                        <div className="text-center mb-12 space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                                <Activity className="w-4 h-4" />
                                <span>System Status</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{OVERALL_HEADLINE[data.overall]}</h1>
                        </div>

                        {/* Overall banner */}
                        <div className={`flex items-center gap-4 rounded-2xl border p-6 mb-8 ${overall.bg} ${overall.ring}`}>
                            <OverallIcon className={`w-8 h-8 shrink-0 ${overall.text}`} />
                            <div className="flex-1">
                                <p className={`font-semibold ${overall.text}`}>{overall.label}</p>
                                <p className="text-sm text-muted-foreground">
                                    Last checked {new Date(data.checkedAt).toLocaleTimeString()}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => void refresh()}
                                disabled={refreshing}
                                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        {/* Component list */}
                        <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl divide-y divide-border/50 shadow-xl overflow-hidden">
                            {data.components.map((c) => {
                                const meta = STATUS_META[c.status];
                                const Icon = meta.icon;
                                return (
                                    <div key={c.key} className="flex items-center gap-4 p-5">
                                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground">{c.name}</p>
                                            <p className="text-sm text-muted-foreground truncate">{c.message}</p>
                                        </div>
                                        {c.latency_ms !== null && (
                                            <span className="text-xs font-mono text-muted-foreground/70 tabular-nums">{c.latency_ms} ms</span>
                                        )}
                                        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${meta.text}`}>
                                            <Icon className="w-4 h-4" />
                                            {meta.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-center text-sm text-muted-foreground/70 mt-8">
                            Machine-readable status available at{' '}
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
