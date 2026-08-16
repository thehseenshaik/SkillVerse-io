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
  Building2,
  Check,
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
  navSections,
  bottomNavItems,
  useSidebarState,
} from "@/components/navigation/AppSidebar";
import { cn } from "@/lib/utils";

const publicNav = [
  { to: "/features", label: "Features" },
  { to: "/career-score", label: "Career Score" },
] as const;

function Wordmark() {
  return <span className="text-xl font-bold text-foreground">SkillVerse</span>;
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

          {/* Workspace Dropdown */}
          {isAppView && (
            <>
              <div className="hidden sm:block h-4 w-px bg-border/60" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:flex items-center gap-1.5 rounded-lg border border-border/40 bg-secondary/50 px-2.5 py-1 text-xs transition-colors hover:bg-secondary hover:border-border">
                    <Building2 className="h-3.5 w-3.5 text-brand" />
                    <span className="font-semibold text-foreground">
                      SkillVerse Workspace
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Workspaces
                  </DropdownMenuLabel>
                  <DropdownMenuItem className="flex items-center justify-between font-medium">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-brand" />
                      SkillVerse Workspace
                    </span>
                    <Check className="h-4 w-4 text-brand" />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs text-muted-foreground cursor-pointer">
                    + Create New Workspace
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

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
        <div className="flex items-center gap-1.5 md:gap-2">
          {isAppView ? (
            <TooltipProvider delayDuration={150}>
              {/* Help Button */}
              <Tooltip side="bottom">
                <TooltipTrigger asChild>
                  <Link
                    to="/assistant"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Help & Support"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Help & Copilot Support
                </TooltipContent>
              </Tooltip>

              {/* Notifications Button */}
              <Tooltip side="bottom">
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand ring-2 ring-background" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Notifications
                </TooltipContent>
              </Tooltip>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Mobile Drawer Hamburger */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-full border border-border/80 bg-background p-1 pl-1.5 pr-2.5 text-[13px] font-medium text-foreground transition-all hover:bg-secondary hover:border-border"
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
              {navSections.map((section) => (
                <div key={section.key} className="space-y-1">
                  <div className="px-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase flex items-center gap-1.5">
                    <section.icon className="h-3.5 w-3.5 text-brand" />
                    {section.title}
                  </div>
                  {section.items.map((item) => {
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
              ))}

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

const footerLinks = [
  { to: "/features", label: "Features" },
  { to: "/career-score", label: "Career Score" },
  { to: "/practice", label: "Practice" },
  { to: "/resume", label: "Resume" },
] as const;

const footerSocials = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Mail, href: "mailto:hello@skillverse.app", label: "Email" },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative mt-20 border-t border-border/60 bg-background/60">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent" />
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-center md:justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={skillverseLogo}
              alt="SkillVerse"
              width={22}
              height={22}
              className="h-[22px] w-[22px] object-contain"
            />
            <span className="text-[13px] font-semibold tracking-tight text-foreground">
              SkillVerse
            </span>
            <span className="ml-1 hidden text-[11px] text-muted-foreground sm:inline">
              — Career OS for students
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {footerLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            {footerSocials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noreferrer"
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Icon className="h-[15px] w-[15px]" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center justify-between gap-2 border-t border-border/50 pt-4 text-[11px] text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} SkillVerse Labs · All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Security
            </a>
          </div>
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
      <PageShellContent>{children}</PageShellContent>
    </SidebarProvider>
  );
}
