/**
 * Notifications Widget
 * Displays relevant notifications based on user activity
 */

import { Bell, CheckCircle2, AlertTriangle, Info, X, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "alert";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface NotificationsProps {
  notifications: Notification[];
  className?: string;
  onMarkAsRead?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onActionClick?: (notification: Notification) => void;
}

const typeIcons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
  alert: AlertTriangle,
};

const typeColors = {
  success: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  alert: "text-rose-500 bg-rose-500/10 border-rose-500/20",
};

export function Notifications({
  notifications,
  className,
  onMarkAsRead,
  onDismiss,
  onActionClick,
}: NotificationsProps) {
  if (notifications.length === 0) {
    return null;
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Card className={cn("p-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              notifications.forEach((n) => {
                if (!n.read) onMarkAsRead?.(n.id);
              });
            }}
          >
            Mark all as read
          </Button>
        )}
      </div>

      <ul className="space-y-3">
        {notifications.slice(0, 5).map((notification) => {
          const Icon = typeIcons[notification.type];
          const colorClass = typeColors[notification.type];

          return (
            <li
              key={notification.id}
              className={cn(
                "relative rounded-lg border p-4 transition-all",
                notification.read
                  ? "border-border/50 bg-muted/30 opacity-70"
                  : "border-brand/30 bg-brand/5",
                !notification.read && "shadow-sm"
              )}
            >
              <div className="flex gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border",
                    colorClass
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold">{notification.title}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 flex-shrink-0"
                      onClick={() => onDismiss?.(notification.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </span>

                    {notification.actionUrl && notification.actionLabel && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-xs"
                        onClick={() => onActionClick?.(notification)}
                      >
                        {notification.actionLabel}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead?.(notification.id)}
                  className="absolute right-2 top-2 text-[10px] text-muted-foreground hover:text-brand"
                >
                  Mark as read
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {notifications.length > 5 && (
        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm">
            View all {notifications.length} notifications
          </Button>
        </div>
      )}
    </Card>
  );
}
