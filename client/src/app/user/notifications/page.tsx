import HeaderBox from "@/components/common/HeaderBox";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockNotifications } from "@/db";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const NotificationsPage = () => {
  // In real app, get from auth state
  const currentUserId = 1;

  // Filter and sort user notifications
  const userNotifications = mockNotifications
    .filter((n) => n.userId === currentUserId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <HeaderBox
          title="All Notifications"
          subtext={`${unreadCount} unread ${
            unreadCount === 1 ? "notification" : "notifications"
          }`}
        />
        {unreadCount > 0 && (
          <Button variant="outline" className="w-full sm:w-auto">
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {userNotifications.length > 0 ? (
        <div className="space-y-3">
          {userNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={cn(
                "cursor-pointer hover:shadow-md transition-all",
                !notification.isRead &&
                  "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20"
              )}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0",
                      !notification.isRead
                        ? "bg-emerald-100 dark:bg-emerald-900"
                        : "bg-gray-100 dark:bg-gray-800"
                    )}
                  >
                    <Bell
                      className={cn(
                        "h-5 w-5",
                        !notification.isRead
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-gray-600 dark:text-gray-400"
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3
                            className={cn(
                              "text-base sm:text-lg",
                              !notification.isRead && "font-semibold"
                            )}
                          >
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(notification.createdAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>

                    {notification.link && (
                      <Button
                        variant="link"
                        className="h-auto p-0 text-emerald-600 dark:text-emerald-400"
                      >
                        View details →
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
            <p className="text-sm text-muted-foreground text-center">
              We'll notify you when something important happens
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;
