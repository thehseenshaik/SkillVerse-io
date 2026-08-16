import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  User,
  Trophy,
  TrendingUp,
  Github,
  Code2,
  BookOpen,
  FolderKanban,
  FileText,
  Sparkles,
  FileSearch,
  Target,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Briefcase,
  Layers,
  Flame,
  ChevronDown,
  Building2,
  CheckCircle2,
  Activity,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/profile", label: "My Profile", icon: User },
      { to: "/career-snapshot", label: "Career Hub", icon: Trophy },
      { to: "/ai-progress", label: "Skill Progress", icon: TrendingUp },
    ],
  },
  {
    title: "DEVELOPMENT",
    items: [
      { to: "/analytics/github", label: "GitHub", icon: Github },
      { to: "/analytics/leetcode", label: "LeetCode", icon: Code2 },
      { to: "/analytics/gfg", label: "GeeksforGeeks", icon: BookOpen },
      { to: "/portfolio-editor", label: "Projects", icon: FolderKanban },
    ],
  },
  {
    title: "AI TOOLS",
    items: [
      { to: "/ai-resume-generator", label: "AI Resume", icon: FileText },
      { to: "/ai-career", label: "Career Recommendations", icon: Sparkles },
      { to: "/ai-resume-analyzer", label: "Resume Analyzer", icon: FileSearch },
      { to: "/ai-skill-gaps", label: "Skill Gap Analysis", icon: Target },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      { to: "/settings", label: "Settings", icon: Settings },
      { to: "/assistant", label: "Help & Support", icon: HelpCircle },
    ],
  },
];

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobile: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

const SIDEBAR_STORAGE_KEY = "skillverse_sidebar_collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = React.useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved !== null) {
        return saved === "true";
      }
    }
    return false;
  });

  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);

  const setCollapsed = React.useCallback(
    (action: React.SetStateAction<boolean>) => {
      setCollapsedState((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        if (typeof window !== "undefined") {
          localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
          document.cookie = `sidebar_state=${next}; path=/; max-age=${
            60 * 60 * 24 * 30
          }`;
        }
        return next;
      });
    },
    []
  );

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => !prev);
  }, [setCollapsed]);

  const toggleMobile = React.useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const value = React.useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed,
      mobileOpen,
      setMobileOpen,
      toggleMobile,
    }),
    [collapsed, setCollapsed, toggleCollapsed, mobileOpen, toggleMobile]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebarState() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarState must be used within a SidebarProvider");
  }
  return context;
}

export function AppSidebar() {
  const { collapsed, toggleCollapsed } = useSidebarState();
  const location = useLocation();

  // Active route checking helper
  const isRouteActive = (to: string) => {
    const currentPath = location.pathname;
    if (to === "/dashboard") {
      return currentPath === "/dashboard" || currentPath === "/";
    }
    return currentPath === to || currentPath.startsWith(`${to}/`);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        aria-label="Main Navigation Sidebar"
        className={cn(
          "fixed left-0 top-14 bottom-0 z-30 hidden md:flex flex-col bg-background/95 backdrop-blur-md border-r border-border/60 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none",
          collapsed ? "w-[68px]" : "w-[250px]"
        )}
      >
        {/* Navigation items list */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-6 custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {/* Section title header */}
              {collapsed ? (
                <div className="h-px bg-border/50 my-2 mx-1 transition-all duration-300" />
              ) : (
                <div className="px-3 pb-1 text-[11px] font-bold tracking-wider text-muted-foreground/70 uppercase transition-opacity duration-200">
                  {section.title}
                </div>
              )}

              {/* Items in section */}
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isRouteActive(item.to);

                const linkContent = (
                  <Link
                    to={item.to}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-brand",
                      active
                        ? "bg-brand/12 text-brand font-semibold shadow-2xs dark:bg-brand/20"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                    )}
                  >
                    {/* Active highlight bar indicator on left edge */}
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand shadow-sm" />
                    )}

                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                        active ? "text-brand" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />

                    {/* Smooth fading text label */}
                    <span
                      className={cn(
                        "truncate transition-all duration-300 ease-out whitespace-nowrap",
                        collapsed
                          ? "opacity-0 max-w-0 pointer-events-none translate-x-[-8px]"
                          : "opacity-100 max-w-[170px] translate-x-0"
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Optional badge */}
                    {item.badge && !collapsed && (
                      <span className="ml-auto rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-brand">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.to} side="right" sideOffset={12}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-foreground text-background font-medium text-xs shadow-md border border-border/20 py-1.5 px-3"
                      >
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-[10px] text-muted-foreground/80 font-normal">
                          {section.title}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return <React.Fragment key={item.to}>{linkContent}</React.Fragment>;
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Collapse Toggle Button */}
        <div className="shrink-0 p-3 border-t border-border/50 bg-background/50 flex items-center justify-between gap-2">
          {!collapsed && (
            <div className="flex items-center gap-2 px-2 text-[11px] text-muted-foreground truncate">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate font-medium">SkillVerse OS</span>
            </div>
          )}

          <Tooltip side={collapsed ? "right" : "top"} sideOffset={10}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={toggleCollapsed}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-all hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-brand",
                  collapsed && "mx-auto"
                )}
              >
                <ChevronLeft
                  className={cn(
                    "h-4 w-4 transition-transform duration-300 ease-out",
                    collapsed && "rotate-180 text-brand"
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? "right" : "top"} className="text-xs">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
