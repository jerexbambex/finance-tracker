import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";
import { router } from "@inertiajs/react";

interface Notification {
  id: string;
  type: string;
  data: {
    message: string;
    category?: string;
    percentage?: number;
    name?: string;
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

  return (
    <AppLayout>
      <Head title="Notifications" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.data.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No notifications yet</p>
              </CardContent>
            </Card>
          ) : (
            notifications.data.map((notification) => (
              <Card
                key={notification.id}
                className={notification.read_at ? "opacity-60" : "border-primary"}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {notification.data.message}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read_at && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {notifications.last_page > 1 && (
          <div className="flex justify-center gap-2">
            {notifications.links.map((link, index) => (
              <Link
                key={index}
                href={link.url || "#"}
                className={`px-3 py-1 rounded ${
                  link.active
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary"
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
