import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronDown,
  Github,
  Linkedin,
  LogOut,
  Mail,
  Menu,
  Settings as SettingsIcon,
  Shield,
  Twitter,
  User,
  X,
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
import { useState } from "react";

const publicNav = [
  { to: "/features", label: "Features" },
  { to: "/career-score", label: "Career Score" },
] as const;

const authedNav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/resume", label: "Resume" },
  { to: "/practice", label: "Practice" },
  { to: "/assistant", label: "Copilot" },
] as const;

function Wordmark() {
  return <span className="text-xl font-bold text-foreground">SkillVerse</span>;
}

export function SiteNav() {
  const { user, isAuthenticated, hydrated, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onSignOut = async () => {
    await signOut();
    navigate({ to: "/", replace: true });
    setMobileMenuOpen(false);
  };

  const homeTarget = hydrated && isAuthenticated ? "/dashboard" : "/";
  const items = hydrated && isAuthenticated ? authedNav : publicNav;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
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

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((n) => (
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

        <div className="flex items-center gap-2">
          {hydrated && isAuthenticated ? (
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="hidden md:inline-flex h-9 items-center gap-2 rounded-full border border-border bg-background pl-1 pr-3 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-foreground to-foreground/70 text-background">
                      <User className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    <span className="hidden max-w-[100px] truncate sm:inline">
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
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <SettingsIcon className="h-4 w-4" /> Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 text-brand focus:text-brand"
                        >
                          <Shield className="h-4 w-4" /> Admin console
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={onSignOut}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
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

      {/* Mobile menu sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-[300px] sm:w-[350px]">
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
          <nav className="mt-8 flex flex-col gap-2">
            {items.map((n) => (
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
          </nav>
          {hydrated && isAuthenticated && (
            <div className="mt-8 border-t border-border pt-6">
              <div className="mb-4 px-4">
                <div className="text-sm font-semibold">
                  {user?.name ?? "Account"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.email ?? ""}
                </div>
              </div>
              <nav className="flex flex-col gap-1">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <SettingsIcon className="h-4 w-4" /> Settings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-brand transition-colors hover:bg-secondary"
                  >
                    <Shield className="h-4 w-4" /> Admin console
                  </Link>
                )}
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-destructive transition-colors hover:bg-secondary"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </nav>
            </div>
          )}
          {!hydrated || !isAuthenticated ? (
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
          ) : null}
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

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <SiteNav />
      <main className="flex-1 pt-14">{children}</main>
      <SiteFooter />
    </div>
  );
}
