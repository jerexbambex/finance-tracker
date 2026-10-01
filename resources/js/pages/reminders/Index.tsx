import { Head, Link, router } from '@inertiajs/react';
import { Bell, Check, Pencil, Plus, Trash2, Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatCurrency } from '@/lib/formatCurrency';
import { KravioCard } from '@/components/dashboard/KravioCard';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  amount?: number;
  currency?: string;
  due_date: string;
  is_recurring: boolean;
  frequency?: string;
  is_completed: boolean;
  category?: { id: string; name: string; color?: string };
}

interface Props {
  reminders: {
    overdue?: Reminder[];
    today?: Reminder[];
    soon?: Reminder[];
    upcoming?: Reminder[];
    completed?: Reminder[];
  };
}

export default function Index({ reminders }: Props) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleComplete = (id: string) => {
    router.post(`/reminders/${id}/complete`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      router.delete(`/reminders/${id}`);
    }
  };

  const totalRemindersCount = Object.values(reminders).reduce((sum, list) => sum + (list?.length ?? 0), 0);

  const ReminderRow = ({ reminder, status }: { reminder: Reminder; status: 'overdue' | 'today' | 'soon' | 'upcoming' | 'completed' }) => (
    <div className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/40 hover:bg-muted/30 transition-all bg-card">
      <div className="flex items-start gap-3 min-w-0">
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          status === 'overdue'
            ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
            : status === 'today'
            ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
            : status === 'completed'
            ? 'bg-emerald-500/10 text-emerald-600'
            : 'bg-primary/10 text-primary'
        }`}>
          {status === 'overdue' ? <AlertTriangle className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-semibold text-foreground truncate">{reminder.title}</h3>
            {reminder.is_recurring && (
              <span className="rounded bg-secondary px-1.5 py-0.2 text-[9px] font-semibold uppercase text-secondary-foreground">
                {reminder.frequency}
              </span>
            )}
            {reminder.category && (
              <span className="rounded-md bg-muted/60 px-1.5 py-0.2 text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: reminder.category.color || '#94a3b8' }} />
                {reminder.category.name}
              </span>
            )}
          </div>

          {reminder.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{reminder.description}</p>
          )}

          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Due: {formatDate(reminder.due_date)}
            </span>
            {reminder.amount && (
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(reminder.amount, reminder.currency)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 self-end sm:self-center">
        {!reminder.is_completed && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs px-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={() => handleComplete(reminder.id)}
            title="Mark as paid / done"
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            Paid
          </Button>
        )}
        <Link href={`/reminders/${reminder.id}/edit`}>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        </Link>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
          onClick={() => handleDelete(reminder.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <Head title="Reminders" />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {/* ── Kravio Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 animate-rise">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Bill Reminders & Deadlines</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Keep track of recurring dues, upcoming invoices, and critical payment milestones.
            </p>
          </div>

          <Link href="/reminders/create">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              New Reminder
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Overdue */}
          {reminders.overdue && reminders.overdue.length > 0 && (
            <KravioCard pattern className="animate-rise [animation-delay:80ms] border-rose-500/30" innerClassName="p-4 sm:p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-rose-500/20 text-rose-600">
                <AlertTriangle className="h-4 w-4" />
                <h2 className="text-xs font-bold uppercase tracking-wider">Overdue ({reminders.overdue.length})</h2>
              </div>
              <div className="mt-3 space-y-2">
                {reminders.overdue.map((r) => (
                  <ReminderRow key={r.id} reminder={r} status="overdue" />
                ))}
              </div>
            </KravioCard>
          )}

          {/* Today */}
          {reminders.today && reminders.today.length > 0 && (
            <KravioCard pattern className="animate-rise [animation-delay:120ms] border-amber-500/30" innerClassName="p-4 sm:p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-amber-500/20 text-amber-600">
                <Clock className="h-4 w-4" />
                <h2 className="text-xs font-bold uppercase tracking-wider">Due Today ({reminders.today.length})</h2>
              </div>
              <div className="mt-3 space-y-2">
                {reminders.today.map((r) => (
                  <ReminderRow key={r.id} reminder={r} status="today" />
                ))}
              </div>
            </KravioCard>
          )}

          {/* Due Soon (Next 7 days) */}
          {reminders.soon && reminders.soon.length > 0 && (
            <KravioCard pattern className="animate-rise [animation-delay:160ms]" innerClassName="p-4 sm:p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border/40 text-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <h2 className="text-xs font-semibold uppercase tracking-wider">Due Soon · Next 7 Days ({reminders.soon.length})</h2>
              </div>
              <div className="mt-3 space-y-2">
                {reminders.soon.map((r) => (
                  <ReminderRow key={r.id} reminder={r} status="soon" />
                ))}
              </div>
            </KravioCard>
          )}

          {/* Upcoming */}
          {reminders.upcoming && reminders.upcoming.length > 0 && (
            <KravioCard pattern className="animate-rise [animation-delay:200ms]" innerClassName="p-4 sm:p-5">
              <div className="flex items-center gap-2 pb-3 border-b border-border/40 text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-xs font-semibold uppercase tracking-wider">Upcoming ({reminders.upcoming.length})</h2>
              </div>
              <div className="mt-3 space-y-2">
                {reminders.upcoming.map((r) => (
                  <ReminderRow key={r.id} reminder={r} status="upcoming" />
                ))}
              </div>
            </KravioCard>
          )}

          {totalRemindersCount === 0 && (
            <KravioCard pattern className="text-center py-12">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
              <h3 className="text-sm font-semibold text-foreground">No active bill reminders</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Set up automated reminders for recurring bills, credit card statements, and rent payments.
              </p>
              <div className="mt-4">
                <Link href="/reminders/create">
                  <Button size="sm">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Create Reminder
                  </Button>
                </Link>
              </div>
            </KravioCard>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
