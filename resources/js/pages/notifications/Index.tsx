import { Head, Link, router } from "@inertiajs/react";
import { Bell, CheckCheck, Check, Sparkles, AlertTriangle, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { KravioCard } from "@/components/dashboard/KravioCard";

interface Notification {
  id: string;
  type: string;
  data: {
    message: string;
    category?: string;
    percentage?: number;
    name?: string;
    budget_id?: string;
    goal_id?: string;
  };
  read_at: string | null;
  created_at: string;
}

interface Props {
  notifications: {
    data: Notification[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
  };
  unreadCount: number;
}

export default function Index({ notifications, unreadCount }: Props) {
  const markAsRead = (id: string) => {
    router.post(`/notifications/${id}/read`);
  };

  const markAllAsRead = () => {
    router.post("/notifications/mark-all-read");
  };

  const getNotificationBadge = (type: string, percentage?: number) => {
    if (type.includes("Budget")) {
      if (percentage && percentage >= 100) {
        return <Badge variant="destructive" className="text-[10px] px-2 py-0">Over Budget</Badge>;
      }
      return <Badge className="text-[10px] px-2 py-0 bg-amber-500/10 text-amber-600 border border-amber-500/20">Warning</Badge>;
    }
    if (type.includes("Goal")) {
      return <Badge className="text-[10px] px-2 py-0 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">Achieved</Badge>;
    }
    return null;
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  return (
    <AppLayout>
      <Head title="Notifications" />

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
        {/* ── Kravio Header ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 animate-rise">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Notifications & Alerts</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm" className="h-8 text-xs font-medium">
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
              Mark All Read
            </Button>
          )}
        </div>

        {notifications.data.length === 0 ? (
          <KravioCard pattern className="text-center py-16">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground/60 mb-3" />
            <h3 className="text-sm font-semibold text-foreground">No notifications yet</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              We will notify you about budget alerts, savings milestones, and bill deadlines here.
            </p>
          </KravioCard>
        ) : (
          <div className="space-y-2.5">
            {notifications.data.map((notif) => {
              const isUnread = !notif.read_at;
              const isBudget = notif.type.includes("Budget");
              const isGoal = notif.type.includes("Goal");

              return (
                <KravioCard
                  key={notif.id}
                  pattern
                  className={`transition-all duration-150 ${isUnread ? 'border-primary/40' : 'opacity-80'}`}
                  innerClassName="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isBudget
                        ? 'bg-rose-500/10 text-rose-600'
                        : isGoal
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {isBudget ? <AlertTriangle className="h-4 w-4" /> : isGoal ? <Target className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-xs ${isUnread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {notif.data.message}
                        </p>
                        {getNotificationBadge(notif.type, notif.data.percentage)}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {formatTime(notif.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {notif.data.budget_id && (
                      <Link href="/budgets">
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                          View Budget
                        </Button>
                      </Link>
                    )}
                    {notif.data.goal_id && (
                      <Link href="/goals">
                        <Button variant="ghost" size="sm" className="h-7 text-xs px-2">
                          View Goal
                        </Button>
                      </Link>
                    )}
                    {isUnread && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => markAsRead(notif.id)}
                        title="Mark as read"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </KravioCard>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
