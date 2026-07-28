import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, XCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

import Footer from '@/components/Landing/Footer';
import Navbar from '@/components/Landing/Navbar';

type IncidentStatus = 'degraded' | 'down';

interface Incident {
    component: string;
    name: string;
    status: IncidentStatus;
    started_at: string;
    ended_at: string;
    duration_minutes: number;
    ongoing: boolean;
}

interface Month {
    key: string;
    label: string;
    incidents: Incident[];
}

interface Props {
    months: Month[];
    window: { days: number; from: string; to: string };
}

const STATUS_META: Record<IncidentStatus, { label: string; icon: typeof AlertTriangle; text: string; bg: string; ring: string; dot: string }> = {
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

function dayNum(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { day: '2-digit' });
}

function weekday(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { weekday: 'short' });
}

function time(iso: string): string {
    return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function humanDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function IncidentRow({ incident }: { incident: Incident }) {
    const meta = STATUS_META[incident.status];
    const Icon = meta.icon;
    return (
        <div className="flex gap-4 py-5">
            {/* Date column */}
            <div className="w-12 shrink-0 text-center">
                <div className="text-lg font-semibold text-foreground leading-none">{dayNum(incident.started_at)}</div>
                <div className="text-xs text-muted-foreground mt-1">{weekday(incident.started_at)}</div>
            </div>

            {/* Body */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <Icon className={`w-4 h-4 shrink-0 ${meta.text}`} />
                    <span className="font-medium text-foreground">
                        {incident.name} {incident.status === 'down' ? 'outage' : 'degraded performance'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${meta.bg} ${meta.ring} ${meta.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                        {incident.ongoing ? 'Ongoing' : 'Resolved'}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    {time(incident.started_at)}
                    {' – '}
                    {incident.ongoing ? 'now' : time(incident.ended_at)}
                    <span className="text-muted-foreground/60"> · {humanDuration(incident.duration_minutes)} · auto-detected</span>
                </p>
            </div>
        </div>
    );
}

export default function StatusHistoryPage({ months }: Props) {
    return (
        <>
            <Head title="Incident History - BudgetApp" />

            <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-screen overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
                    <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
                </div>

                <Navbar />

                <main className="pt-32 pb-24 relative z-10">
                    <div className="container mx-auto px-6 max-w-3xl">
                        <div className="flex items-center justify-between mb-8">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">Incident history</h1>
                            <Link
                                href="/status"
                                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/50 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Current status
                            </Link>
                        </div>

                        <div className="space-y-8">
                            {months.map((month) => (
                                <div key={month.key}>
                                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">{month.label}</h2>
                                    <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-sm px-6 overflow-hidden">
                                        {month.incidents.length === 0 ? (
                                            <div className="flex items-center gap-2 py-5 text-sm text-muted-foreground">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                No incidents reported.
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-border/50">
                                                {month.incidents.map((incident, i) => (
                                                    <IncidentRow key={`${incident.component}-${incident.started_at}-${i}`} incident={incident} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        </>
    );
}
