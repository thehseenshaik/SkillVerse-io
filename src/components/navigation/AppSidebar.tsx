import * as React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  FileText,
  Code2,
  BarChart3,
  Sparkles,
  Settings,
  HelpCircle,
  User,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import skillverseLogo from "@/assets/skillverse-logo.png";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
}

export const primaryNavItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resume", label: "Resume", icon: FileText },
  { to: "/practice", label: "Practice", icon: Code2 },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/copilot", label: "Copilot", icon: Sparkles },
];

export const bottomNavItems: NavItem[] = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/copilot", label: "Help & Support", icon: HelpCircle },
  { to: "/profile", label: "Profile", icon: User },
];

type SidebarMode = "auto" | "manual";
type ManualState = "expanded" | "collapsed";

interface SidebarContextType {
  collapsed: boolean;
  sidebarMode: SidebarMode;
  isHovered: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCollapsed: () => void;
  resetToAutoMode: () => void;
  onSidebarMouseEnter: () => void;
  onSidebarMouseLeave: () => void;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleMobile: () => void;
}

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Permanently default to Auto Hover Mode
  const [sidebarMode, setSidebarMode] = React.useState<SidebarMode>("auto");
  const [manualState, setManualState] = React.useState<ManualState>("expanded");

  const [isHovered, setIsHovered] = React.useState<boolean>(false);
  const hoverLeaveTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);

  // Clear legacy localStorage overrides
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("skillverse_sidebar_mode");
      localStorage.removeItem("skillverse_sidebar_manual_state");
      localStorage.removeItem("skillverse_sidebar_collapsed");
    }
  }, []);

  // Calculate effective collapsed state
  const collapsed = React.useMemo(() => {
    if (sidebarMode === "manual") {
      return manualState === "collapsed";
    }
    return !isHovered;
  }, [sidebarMode, manualState, isHovered]);

  const onSidebarMouseEnter = React.useCallback(() => {
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
      hoverLeaveTimerRef.current = null;
    }
    setIsHovered(true);
  }, []);

  const onSidebarMouseLeave = React.useCallback(() => {
    if (hoverLeaveTimerRef.current) {
      clearTimeout(hoverLeaveTimerRef.current);
    }
    // 200ms grace close delay to prevent flickering
    hoverLeaveTimerRef.current = setTimeout(() => {
      setIsHovered(false);
      hoverLeaveTimerRef.current = null;
    }, 200);
  }, []);

  const toggleCollapsed = React.useCallback(() => {
    if (sidebarMode === "auto") {
      setSidebarMode("manual");
      setManualState(collapsed ? "expanded" : "collapsed");
    } else {
      if (manualState === "collapsed") {
        setManualState("expanded");
      } else {
        setSidebarMode("auto");
      }
    }
  }, [sidebarMode, manualState, collapsed]);

  const resetToAutoMode = React.useCallback(() => {
    setSidebarMode("auto");
    setIsHovered(false);
  }, []);

  const setCollapsedDummy = React.useCallback(
    (action: React.SetStateAction<boolean>) => {
      const nextCollapsed = typeof action === "function" ? action(collapsed) : action;
      setSidebarMode("manual");
      setManualState(nextCollapsed ? "collapsed" : "expanded");
    },
    [collapsed]
  );

  const toggleMobile = React.useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const value = React.useMemo(
    () => ({
      collapsed,
      sidebarMode,
      isHovered,
      setCollapsed: setCollapsedDummy,
      toggleCollapsed,
      resetToAutoMode,
      onSidebarMouseEnter,
      onSidebarMouseLeave,
      mobileOpen,
      setMobileOpen,
      toggleMobile,
    }),
    [
      collapsed,
      sidebarMode,
      isHovered,
      setCollapsedDummy,
      toggleCollapsed,
      resetToAutoMode,
      onSidebarMouseEnter,
      onSidebarMouseLeave,
      mobileOpen,
      setMobileOpen,
      toggleMobile,
    ]
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
  const {
    collapsed,
    sidebarMode,
    toggleCollapsed,
    resetToAutoMode,
    onSidebarMouseEnter,
    onSidebarMouseLeave,
  } = useSidebarState();

  const location = useLocation();

  // Helper to check active route
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
        onMouseEnter={onSidebarMouseEnter}
        onMouseMove={onSidebarMouseEnter}
        onMouseLeave={onSidebarMouseLeave}
        className={cn(
          "fixed left-0 top-14 bottom-0 z-30 hidden md:flex flex-col bg-background/95 backdrop-blur-md border-r border-border/60 transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none",
          collapsed ? "w-[68px]" : "w-[250px]"
        )}
      >


        {/* Primary 5 Authenticated Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1.5 custom-scrollbar">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(item.to);

            const linkContent = (
              <Link
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200 ease-in-out outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  active
                    ? "bg-brand/12 text-brand font-semibold shadow-2xs dark:bg-brand/20"
                    : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground",
                  collapsed && "justify-center px-0"
                )}
              >
                {active && !collapsed && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand shadow-xs" />
                )}
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
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="bg-foreground text-background font-semibold text-xs shadow-md py-1.5 px-3">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <React.Fragment key={item.to}>{linkContent}</React.Fragment>;
          })}
        </div>

        {/* Bottom Pinned Navigation Section: Settings, Help & Profile */}
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

          {/* Sidebar Mode Status & Manual Toggle Button */}
          <div className="pt-2 flex items-center justify-between border-t border-border/40">
            {!collapsed && (
              <div className="flex items-center gap-2 px-2 text-[11px] text-muted-foreground truncate">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="truncate font-medium">
                  {sidebarMode === "manual" ? "Pinned Mode" : "Auto Hover Active"}
                </span>
                {sidebarMode === "manual" && (
                  <button
                    type="button"
                    onClick={resetToAutoMode}
                    className="text-[10px] text-brand hover:underline font-semibold ml-1 cursor-pointer"
                  >
                    Reset Auto
                  </button>
                )}
              </div>
            )}

            <Tooltip side={collapsed ? "right" : "top"} sideOffset={10}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  aria-label={sidebarMode === "auto" ? "Pin sidebar" : "Reset auto hover"}
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
                {sidebarMode === "auto" ? "Pin sidebar mode" : "Reset auto hover mode"}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
