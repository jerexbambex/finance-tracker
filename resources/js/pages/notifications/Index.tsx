import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, AlertTriangle, Target, TrendingUp, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    links: any[];
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
        return <Badge variant="destructive" className="text-xs">Over Budget</Badge>;
      }
      return <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">Warning</Badge>;
    }
    if (type.includes("Goal")) {
      return <Badge variant="outline" className="text-xs border-green-500 text-green-600">Achieved</Badge>;
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

      <div className="py-6 sm:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground text-sm mt-1">
                {unreadCount > 0 
                  ? `${unreadCount} unread`
                  : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" size="sm">
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>

          {notifications.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border rounded-lg bg-card">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No notifications yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                We'll notify you about budget alerts and goal achievements
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.data.map((notification) => (
                <div
                  key={notification.id}
                  className={`group flex items-start gap-3 p-4 rounded-lg border transition-colors hover:bg-accent/50 ${
                    !notification.read_at ? "bg-accent/30 border-primary/20" : "bg-card"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p className={`text-sm ${!notification.read_at ? "font-medium" : ""}`}>
                        {notification.data.message}
                      </p>
                      {getNotificationBadge(notification.type, notification.data.percentage)}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatTime(notification.created_at)}</span>
                      {notification.data.category && (
                        <>
                          <span>•</span>
                          <span>{notification.data.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {!notification.read_at && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {notifications.last_page > 1 && (
            <div className="flex justify-center gap-1 mt-6">
              {notifications.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.url || "#"}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    link.active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
