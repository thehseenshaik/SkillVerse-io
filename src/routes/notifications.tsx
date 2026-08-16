import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Link2,
  CheckCircle2,
  FileText,
  User,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useNotifications } from "@/lib/notification-context";
import { SkillVerseNotification, NotificationType } from "@/lib/services/notification-service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — SkillVerse" },
      {
        name: "description",
        content:
          "Stay updated on your platform connections, practice completions, and career progress.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <NotificationsPage />
    </AuthGate>
  ),
});

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "connection":
      return <Link2 className="h-4 w-4 text-emerald-500" />;
    case "problem":
      return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    case "resume":
      return <FileText className="h-4 w-4 text-purple-500" />;
    case "profile":
      return <User className="h-4 w-4 text-amber-500" />;
    case "sync":
      return <RefreshCw className="h-4 w-4 text-cyan-500" />;
    case "sync_failure":
      return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    case "ai":
    default:
      return <Sparkles className="h-4 w-4 text-brand" />;
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 45) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function groupNotificationsByTime(items: SkillVerseNotification[]) {
  const today: SkillVerseNotification[] = [];
  const yesterday: SkillVerseNotification[] = [];
  const older: SkillVerseNotification[] = [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  items.forEach((item) => {
    const time = new Date(item.createdAt).getTime();
    if (time >= todayStart) {
      today.push(item);
    } else if (time >= yesterdayStart) {
      yesterday.push(item);
    } else {
      older.push(item);
    }
  });

  return { today, yesterday, older };
}

function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const { today, yesterday, older } = useMemo(
    () => groupNotificationsByTime(filteredNotifications),
    [filteredNotifications]
  );

  return (
    <PageShell>
      <div className="min-h-screen bg-background text-foreground pb-20">
        {/* Hero Header */}
        <section className="relative overflow-hidden bg-hero border-b border-border/60">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-20 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px] animate-pulse-glow" />
          </div>

          <div className="mx-auto max-w-5xl px-6 pt-12 pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand backdrop-blur shadow-2xs">
                  <Bell className="h-3.5 w-3.5" />
                  NOTIFICATION CENTER
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Notifications
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Stay updated on your platform connections, practice completions and career progress.
                </p>
              </div>

              {unreadCount > 0 && (
                <Button
                  onClick={() => markAllAsRead()}
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-2 font-medium border-border/80 hover:border-brand/40 shadow-xs"
                >
                  <CheckCheck className="h-4 w-4 text-brand" />
                  Mark all as read ({unreadCount})
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Content Area */}
        <main className="mx-auto max-w-5xl px-6 pt-8 space-y-6">
          {/* Filter Tabs */}
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                  filter === "all"
                    ? "bg-brand text-brand-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter("unread")}
                className={cn(
                  "rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                  filter === "unread"
                    ? "bg-brand text-brand-foreground shadow-xs"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="rounded-full bg-brand-foreground/20 px-1.5 py-0.2 text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Empty State */}
          {filteredNotifications.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-12 text-center shadow-xs">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-muted-foreground">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">You're all caught up</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
                {filter === "unread"
                  ? "You have no unread notifications."
                  : "No notifications yet. Connect platforms or practice problems to get started!"}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <Link
                  to="/practice"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-brand-foreground hover:opacity-90 shadow-2xs"
                >
                  Practice Problems <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Today */}
              {today.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                    Today
                  </h3>
                  <div className="space-y-2">
                    {today.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        onRead={() => markAsRead(item.id)}
                        onDelete={() => deleteNotification(item.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Yesterday */}
              {yesterday.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                    Yesterday
                  </h3>
                  <div className="space-y-2">
                    {yesterday.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        onRead={() => markAsRead(item.id)}
                        onDelete={() => deleteNotification(item.id)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Older */}
              {older.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                    Older
                  </h3>
                  <div className="space-y-2">
                    {older.map((item) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        onRead={() => markAsRead(item.id)}
                        onDelete={() => deleteNotification(item.id)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </main>
      </div>
    </PageShell>
  );
}

function NotificationRow({
  item,
  onRead,
  onDelete,
}: {
  item: SkillVerseNotification;
  onRead: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onRead}
      className={cn(
        "group relative flex items-start gap-4 rounded-xl border p-4 transition-all duration-200 cursor-pointer",
        !item.read
          ? "border-brand/30 bg-brand/5 shadow-2xs dark:bg-brand/10"
          : "border-border/60 bg-card hover:bg-secondary/40"
      )}
    >
      <div className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-background border border-border/60 shadow-2xs">
        {getNotificationIcon(item.type)}
      </div>

      <div className="flex-1 space-y-1 pr-6">
        <div className="flex items-center gap-2">
          <h4
            className={cn(
              "text-sm font-semibold tracking-tight text-foreground",
              !item.read && "font-bold text-brand"
            )}
          >
            {item.title}
          </h4>
          {!item.read && (
            <span className="h-2 w-2 rounded-full bg-brand shrink-0" />
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
        <span className="inline-block text-[11px] text-muted-foreground/70 pt-1">
          {formatRelativeTime(item.createdAt)}
        </span>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete notification"
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-secondary"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
