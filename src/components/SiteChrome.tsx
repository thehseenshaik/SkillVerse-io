import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  Github,
  HelpCircle,
  Linkedin,
  LogOut,
  Mail,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  Twitter,
  User,
  X,
  Check,
  CheckCheck,
  Link2,
  CheckCircle2,
  FileText,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import skillverseLogo from "@/assets/skillverse-logo.png";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import {
  AppSidebar,
  SidebarProvider,
  primaryNavItems,
  bottomNavItems,
  useSidebarState,
} from "@/components/navigation/AppSidebar";
import {
  NotificationProvider,
  useNotifications,
} from "@/lib/notification-context";
import { NotificationType } from "@/lib/services/notification-service";
import { cn } from "@/lib/utils";

const publicNav = [
  { to: "/features", label: "Features" },
  { to: "/career-score", label: "Career Score" },
] as const;

function Wordmark() {
  return <span className="text-xl font-bold text-foreground">SkillVerse</span>;
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "connection":
      return <Link2 className="h-3.5 w-3.5 text-emerald-500" />;
    case "problem":
      return <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />;
    case "resume":
      return <FileText className="h-3.5 w-3.5 text-purple-500" />;
    case "profile":
      return <User className="h-3.5 w-3.5 text-amber-500" />;
    case "sync":
      return <RefreshCw className="h-3.5 w-3.5 text-cyan-500" />;
    case "sync_failure":
      return <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />;
    case "ai":
    default:
      return <Sparkles className="h-3.5 w-3.5 text-brand" />;
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

function NotificationBellDropdown() {
  const { notifications, unreadCount, hasUnread, isNewArrival, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={150}>
        <Tooltip side="bottom">
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Notifications"
              >
                <Bell
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isNewArrival && "animate-bounce text-brand"
                  )}
                />
                {hasUnread && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-brand-foreground ring-2 ring-background">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Notifications {hasUnread && `(${unreadCount} unread)`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0 sm:w-90 rounded-2xl border border-border/70 bg-background/95 backdrop-blur-xl shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-foreground">Notifications</span>
            {hasUnread && (
              <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-bold text-brand">
                {unreadCount} new
              </span>
            )}
          </div>
          {hasUnread && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="text-[11px] font-semibold text-brand hover:underline cursor-pointer flex items-center gap-1"
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>

        {/* List Body */}
        <div className="max-h-[340px] overflow-y-auto divide-y divide-border/40 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="mx-auto h-6 w-6 text-muted-foreground/50 mb-2" />
              <p className="text-xs font-semibold text-foreground">You're all caught up</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">No notifications right now.</p>
            </div>
          ) : (
            notifications.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                className={cn(
                  "group flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-secondary/60",
                  !item.read && "bg-brand/5 dark:bg-brand/10"
                )}
              >
                <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-secondary/80 border border-border/50">
                  {getNotificationIcon(item.type)}
                </div>
                <div className="flex-1 space-y-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-xs font-semibold truncate text-foreground",
                        !item.read && "font-bold text-brand"
                      )}
                    >
                      {item.title}
                    </p>
                    {!item.read && <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.message}
                  </p>
                  <span className="text-[10px] text-muted-foreground/70 block pt-0.5">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 p-2 text-center bg-muted/20 rounded-b-2xl">
          <Link
            to="/notifications"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline py-1"
          >
            <span>View all notifications</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteNav() {
  const { user, isAuthenticated, hydrated, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { collapsed, toggleCollapsed } = useSidebarState();

  const onSignOut = async () => {
    await signOut();
    navigate({ to: "/", replace: true });
    setMobileMenuOpen(false);
  };

  const isAppView = hydrated && isAuthenticated;
  const homeTarget = isAppView ? "/dashboard" : "/";

  // Initials for avatar fallback
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "SV";

  return (
    <header className="fixed top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="flex h-14 w-full items-center justify-between px-4 md:px-6">
        {/* Left Side Navigation Items */}
        <div className="flex items-center gap-3">
          {/* Sidebar Toggle Button (Only on authenticated app desktop view) */}
          {isAppView && (
            <TooltipProvider delayDuration={150}>
              <Tooltip side="bottom">
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleCollapsed}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    {collapsed ? (
                      <PanelLeftOpen className="h-4 w-4 text-brand" />
                    ) : (
                      <PanelLeftClose className="h-4 w-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {collapsed ? "Expand sidebar" : "Collapse sidebar"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Logo & Wordmark */}
          <Link to={homeTarget} className="group flex items-center gap-2">
            <img
              src={skillverseLogo}
              alt="SkillVerse"
              width={26}
              height={26}
              className="h-6 w-6 object-contain transition-transform group-hover:scale-105"
            />
            <Wordmark />
          </Link>

          {/* Public Top Links if Unauthenticated */}
          {!isAppView && (
            <nav className="hidden items-center gap-1 md:flex ml-4">
              {publicNav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{
                    className:
                      "rounded-md px-3 py-1.5 text-[13px] font-semibold text-foreground bg-secondary",
                  }}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Right Side Utility & User Controls */}
        <div className="flex items-center gap-2">
          {isAppView ? (
            <TooltipProvider delayDuration={150}>
              {/* Notification Bell & Dropdown */}
              <NotificationBellDropdown />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Mobile Menu Hamburger (Mobile Only) */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </Button>

              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-border/80 bg-background p-1 pl-1.5 pr-2.5 text-[13px] font-medium text-foreground transition-all hover:bg-secondary hover:border-border cursor-pointer"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-strong text-[11px] font-bold text-brand-foreground shadow-xs">
                      {userInitials}
                    </span>
                    <span className="hidden max-w-[100px] truncate sm:inline font-semibold text-xs">
                      {user?.name?.split(" ")[0] ?? "Account"}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
                    <span className="text-[13px] font-semibold">
                      {user?.name ?? "Account"}
                    </span>
                    <span className="truncate text-[11px] font-normal text-muted-foreground">
                      {user?.email ?? ""}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                      <SettingsIcon className="h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 text-brand focus:text-brand cursor-pointer"
                        >
                          <Shield className="h-4 w-4" /> Admin console
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={onSignOut}
                    className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <ThemeToggle />
              <Link
                to="/login"
                className="hidden h-9 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-md bg-foreground px-3.5 text-[13px] font-semibold text-background shadow-elegant transition-opacity hover:opacity-90"
              >
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer Sheet Navigation */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <img
                src={skillverseLogo}
                alt="SkillVerse"
                width={24}
                height={24}
                className="h-6 w-6 object-contain"
              />
              <Wordmark />
            </SheetTitle>
          </SheetHeader>

          {isAppView ? (
            <div className="mt-6 space-y-6">
              <div className="space-y-1">
                <div className="px-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Navigation
                </div>
                {primaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      activeProps={{
                        className:
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-brand bg-brand/10",
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="space-y-1 border-t border-border pt-4">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-border pt-4">
                <div className="mb-3 px-2">
                  <div className="text-sm font-semibold">{user?.name ?? "Account"}</div>
                  <div className="text-xs text-muted-foreground">{user?.email ?? ""}</div>
                </div>
                <button
                  onClick={onSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-secondary transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-col gap-2">
              {publicNav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{
                    className:
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] font-semibold text-foreground bg-secondary",
                  }}
                >
                  {n.label}
                </Link>
              ))}
              <div className="mt-8 border-t border-border pt-6">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mb-3 block w-full rounded-lg border border-border px-4 py-3 text-center text-sm font-medium transition-colors hover:bg-secondary"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full rounded-lg bg-foreground px-4 py-3 text-center text-sm font-semibold text-background transition-opacity hover:opacity-90"
                >
                  Get started
                </Link>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/60 bg-background/80 py-6 text-center text-xs text-muted-foreground mt-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 sm:flex-row">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <img
            src={skillverseLogo}
            alt="SkillVerse"
            width={18}
            height={18}
            className="h-4 w-4 object-contain"
          />
          <span>SkillVerse</span>
          <span className="text-muted-foreground font-normal">
            · Your career identity hub.
          </span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>© {new Date().getFullYear()} SkillVerse</span>
          <span>·</span>
          <a href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </a>
          <span>·</span>
          <a href="#" className="hover:text-foreground transition-colors">
            Terms
          </a>
          <span>·</span>
          <Link to="/copilot" className="hover:text-foreground transition-colors">
            Help
          </Link>
        </div>
      </div>
    </footer>
  );
}

function PageShellContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrated } = useAuth();
  const { collapsed } = useSidebarState();

  const isAppView = hydrated && isAuthenticated;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground overflow-x-hidden">
      <SiteNav />
      {isAppView && <AppSidebar />}
      <main
        className={cn(
          "flex-1 pt-14 transition-[margin] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isAppView
            ? collapsed
              ? "md:ml-[68px]"
              : "md:ml-[250px]"
            : "ml-0"
        )}
      >
        <div className="w-full h-full">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <NotificationProvider>
        <PageShellContent>{children}</PageShellContent>
      </NotificationProvider>
    </SidebarProvider>
  );
}
