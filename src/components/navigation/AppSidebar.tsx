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
  ChevronDown,
  Compass,
  Award,
  Briefcase,
  Flame,
  Layers,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
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
}

export interface NavSection {
  key: string;
  title: string;
  icon: React.ElementType;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    key: "OVERVIEW",
    title: "OVERVIEW",
    icon: LayoutDashboard,
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    key: "CAREER",
    title: "CAREER",
    icon: Briefcase,
    items: [
      { to: "/profile", label: "My Profile", icon: User },
      { to: "/career-snapshot", label: "Career Identity", icon: Trophy },
      { to: "/resume-builder", label: "Resume", icon: FileText },
    ],
  },
  {
    key: "PROGRESS",
    title: "PROGRESS",
    icon: TrendingUp,
    items: [
      { to: "/ai-progress", label: "Skill Progress", icon: Flame },
      { to: "/ai-career-roadmap", label: "Learning Roadmap", icon: Compass },
      { to: "/achievements", label: "Achievements", icon: Award },
    ],
  },
  {
    key: "PLATFORMS",
    title: "PLATFORMS",
    icon: Code2,
    items: [
      { to: "/analytics/github", label: "GitHub", icon: Github },
      { to: "/analytics/leetcode", label: "LeetCode", icon: Code2 },
      { to: "/analytics/gfg", label: "GeeksforGeeks", icon: BookOpen },
    ],
  },
  {
    key: "AITOOLS",
    title: "AI TOOLS",
    icon: Sparkles,
    items: [
      { to: "/ai-resume-generator", label: "AI Resume", icon: FileText },
      { to: "/ai-resume-analyzer", label: "Resume Analyzer", icon: FileSearch },
      { to: "/ai-career", label: "Career Recommendations", icon: Sparkles },
      { to: "/ai-skill-gaps", label: "Skill Gap Analysis", icon: Target },
    ],
  },
  {
    key: "PROJECTS",
    title: "PROJECTS",
    icon: FolderKanban,
    items: [
      { to: "/portfolio-editor", label: "My Projects", icon: FolderKanban },
    ],
  },
];

export const bottomNavItems: NavItem[] = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/assistant", label: "Help & Support", icon: HelpCircle },
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

  // Helper to check if a route is active
  const isRouteActive = (to: string) => {
    const currentPath = location.pathname;
    if (to === "/dashboard") {
      return currentPath === "/dashboard" || currentPath === "/";
    }
    return currentPath === to || currentPath.startsWith(`${to}/`);
  };

  // Keep track of expanded sections (multiple can be open at once)
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      OVERVIEW: true,
      CAREER: true,
      PROGRESS: true,
      PLATFORMS: true,
      AITOOLS: true,
      PROJECTS: true,
    };
    return initial;
  });

  // Automatically expand the section containing the active route on location change
  React.useEffect(() => {
    const currentPath = location.pathname;
    navSections.forEach((section) => {
      const hasActive = section.items.some((item) => {
        if (item.to === "/dashboard") return currentPath === "/dashboard" || currentPath === "/";
        return currentPath === item.to || currentPath.startsWith(`${item.to}/`);
      });
      if (hasActive) {
        setOpenSections((prev) => ({ ...prev, [section.key]: true }));
      }
    });
  }, [location.pathname]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
        {/* Independent Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-4 custom-scrollbar">
          {navSections.map((section) => {
            const SectionIcon = section.icon;
            const isOpen = openSections[section.key] ?? false;
            const hasActiveChild = section.items.some((item) => isRouteActive(item.to));

            return (
              <div key={section.key} className="space-y-1">
                {/* Section Header */}
                {collapsed ? (
                  /* Collapsed View Section Header / Icon Tooltip */
                  <Tooltip side="right" sideOffset={12}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => toggleSection(section.key)}
                        className={cn(
                          "w-full flex items-center justify-center py-2 rounded-lg transition-colors",
                          hasActiveChild ? "text-brand font-semibold bg-brand/10" : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                        )}
                      >
                        <SectionIcon className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-foreground text-background font-semibold text-xs shadow-md py-1.5 px-3">
                      {section.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  /* Expanded View Accordion Header Button */
                  <button
                    type="button"
                    onClick={() => toggleSection(section.key)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wider uppercase transition-colors outline-none focus-visible:ring-1 focus-visible:ring-brand",
                      hasActiveChild
                        ? "text-brand"
                        : "text-muted-foreground/80 hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <SectionIcon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 transition-transform duration-300 ease-out",
                        isOpen ? "rotate-180 text-brand" : "rotate-0 text-muted-foreground/70"
                      )}
                    />
                  </button>
                )}

                {/* Collapsible Animated Child Navigation Links */}
                {!collapsed && (
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div
                        className={cn(
                          "pl-2 space-y-0.5 transition-transform duration-300 ease-out",
                          isOpen ? "translate-y-0" : "-translate-y-1"
                        )}
                      >
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const active = isRouteActive(item.to);

                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              className={cn(
                                "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-brand",
                                active
                                  ? "bg-brand/12 text-brand font-semibold shadow-2xs dark:bg-brand/20"
                                  : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                              )}
                            >
                              {active && (
                                <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand shadow-xs" />
                              )}
                              <Icon
                                className={cn(
                                  "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                                  active ? "text-brand" : "text-muted-foreground group-hover:text-foreground"
                                )}
                              />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Pinned Section: Settings, Help & Sidebar Toggle */}
        <div className="shrink-0 p-3 border-t border-border/50 bg-background/50 space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.to);

            const content = (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ease-in-out",
                  active
                    ? "bg-brand/12 text-brand font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-105",
                    active ? "text-brand" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.to} side="right" sideOffset={12}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-foreground text-background font-semibold text-xs shadow-md py-1.5 px-3">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <React.Fragment key={item.to}>{content}</React.Fragment>;
          })}

          {/* Sidebar Collapse Toggle Button */}
          <div className="pt-2 flex items-center justify-between border-t border-border/40">
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
        </div>
      </aside>
    </TooltipProvider>
  );
}
