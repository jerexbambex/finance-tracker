import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, AlertTriangle, Target, TrendingUp } from "lucide-react";
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

  const getNotificationIcon = (type: string, percentage?: number) => {
    if (type.includes("Budget")) {
      if (percentage && percentage >= 100) {
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      }
      return <TrendingUp className="h-5 w-5 text-orange-500" />;
    }
    if (type.includes("Goal")) {
      return <Target className="h-5 w-5 text-green-500" />;
    }
    return <Bell className="h-5 w-5 text-muted-foreground" />;
  };

  const getNotificationColor = (type: string, percentage?: number) => {
    if (type.includes("Budget")) {
      if (percentage && percentage >= 100) return "border-l-4 border-l-destructive";
      return "border-l-4 border-l-orange-500";
    }
    if (type.includes("Goal")) return "border-l-4 border-l-green-500";
    return "";
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

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground mt-1">
              Stay updated on your budget and goals
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>

        {unreadCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="default">{unreadCount}</Badge>
            <span className="text-muted-foreground">unread notification{unreadCount > 1 ? "s" : ""}</span>
          </div>
        )}

        <div className="space-y-2">
          {notifications.data.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-1">No notifications yet</h3>
                <p className="text-muted-foreground text-sm">
                  We'll notify you about budget alerts and goal achievements
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.data.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all hover:shadow-md ${
                  !notification.read_at ? "bg-accent/50" : ""
                } ${getNotificationColor(notification.type, notification.data.percentage)}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type, notification.data.percentage)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read_at ? "font-medium" : ""}`}>
                        {notification.data.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read_at && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                        className="shrink-0"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {notifications.last_page > 1 && (
          <div className="flex justify-center gap-1">
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
    </AppLayout>
  );
}
