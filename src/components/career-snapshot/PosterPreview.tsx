import React, { forwardRef } from "react";
import {
  Sparkles,
  ShieldCheck,
  Flame,
  Code2,
  TrendingUp,
  Trophy,
  Layers,
  Compass,
} from "lucide-react";
import type {
  PosterTemplateId,
  Achievement,
  StatItem,
  UserRealData,
} from "@/lib/career-snapshot/achievement-engine";
import { cn } from "@/lib/utils";

interface PosterPreviewProps {
  templateId: PosterTemplateId;
  achievement: Achievement;
  data: UserRealData;
  visibleStats: StatItem[];
  customTagline?: string;
  showPublicLink?: boolean;
}

export const PosterPreview = forwardRef<HTMLDivElement, PosterPreviewProps>(
  (
    {
      templateId,
      achievement,
      data,
      visibleStats,
      customTagline,
      showPublicLink = true,
    },
    ref
  ) => {
    const name = data.name || "Sony";
    const headline = data.headline || "Full Stack Developer";
    const username = data.username || "sony";
    const tagline =
      customTagline ||
      achievement.tagline ||
      "Still learning. Still building. Still improving.";

    const isDark = templateId === "dark";

    return (
      <div
        ref={ref}
        id="career-snapshot-poster-node"
        className={cn(
          "relative mx-auto aspect-[4/5] w-full max-w-[430px] select-none overflow-hidden rounded-[32px] p-7 shadow-2xl transition-all duration-300 flex flex-col justify-between",
          // TEMPLATE 1: MINIMAL
          templateId === "minimal" &&
            "bg-[#FAF9F6] text-[#09090B] border border-[#E4E4E7] shadow-lg",

          // TEMPLATE 2: DEVELOPER
          templateId === "developer" &&
            "bg-[#F8FAFC] text-[#0F172A] border border-[#CBD5E1] font-sans shadow-lg",

          // TEMPLATE 3: PROGRESS
          templateId === "progress" &&
            "bg-gradient-to-b from-[#FFFFFF] via-[#FFF8F5] to-[#FFF1EC] text-[#18181B] border border-[#FDBA74]/50 shadow-xl",

          // TEMPLATE 4: ACHIEVEMENT
          templateId === "achievement" &&
            "bg-[#FFFFFF] text-[#09090B] border-2 border-brand/50 shadow-xl",

          // TEMPLATE 5: DARK (GLOWING RESUME-STYLE EFFECT)
          templateId === "dark" &&
            "bg-[#0B0F17] text-[#F8FAFC] border border-brand/40 shadow-glow ring-1 ring-brand/30"
        )}
      >
        {/* Background Ambient Glows & Accents */}
        {isDark && (
          <>
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-brand/25 blur-[90px] animate-pulse-glow" />
            <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-brand/20 blur-[90px]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent opacity-75" />
          </>
        )}

        {templateId === "progress" && (
          <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-brand/15 blur-3xl" />
        )}

        {templateId === "developer" && (
          <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:14px_14px]" />
        )}

        {templateId === "achievement" && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-brand via-[#FF7A59] to-brand" />
        )}

        {/* 1. TOP HEADER: DEVELOPER IDENTITY */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            {/* Developer Avatar + Info */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "h-12 w-12 rounded-2xl grid place-items-center font-black text-lg shadow-sm shrink-0 ring-2",
                  isDark
                    ? "bg-brand text-white ring-brand/40 shadow-glow"
                    : "bg-[#18181B] text-white ring-black/5"
                )}
              >
                {name.charAt(0).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3
                    className={cn(
                      "font-black text-base tracking-tight",
                      isDark ? "text-white" : "text-[#09090B]"
                    )}
                  >
                    {name}
                  </h3>
                  <ShieldCheck className="h-4 w-4 text-brand fill-brand/20 shrink-0" />
                </div>
                <p
                  className={cn(
                    "text-xs font-semibold truncate max-w-[200px]",
                    isDark ? "text-[#94A3B8]" : "text-[#52525B]"
                  )}
                >
                  {headline}
                </p>
              </div>
            </div>

            {/* SkillVerse Brand Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10.5px] font-black uppercase tracking-wider backdrop-blur",
                isDark
                  ? "bg-brand/15 text-brand border border-brand/30 shadow-2xs"
                  : "bg-black/5 text-[#18181B] border border-black/10"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
              <span>SkillVerse</span>
            </div>
          </div>

          <div
            className={cn(
              "h-px w-full",
              isDark ? "bg-white/10" : "bg-black/10"
            )}
          />
        </div>

        {/* 2. MAIN CENTER: HERO MILESTONE / STORY */}
        <div className="relative z-10 py-2 space-y-2.5">
          {/* Eyebrow Milestone Tag */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest",
                isDark
                  ? "bg-brand/20 text-brand border border-brand/30"
                  : "bg-brand/10 text-brand border border-brand/20"
              )}
            >
              <Sparkles className="h-3 w-3" />
              <span>
                {achievement.type === "journey"
                  ? "DEVELOPER JOURNEY"
                  : "VERIFIED MILESTONE"}
              </span>
            </span>
          </div>

          {/* Bold Main Headline */}
          <h1
            className={cn(
              "font-black tracking-tight leading-[1.12]",
              templateId === "progress"
                ? "text-3xl sm:text-[34px] text-gradient"
                : isDark
                ? "text-3xl sm:text-[34px] text-white"
                : "text-3xl sm:text-[34px] text-[#09090B]"
            )}
          >
            {achievement.title}
          </h1>

          <p
            className={cn(
              "text-xs leading-relaxed max-w-sm font-medium",
              isDark ? "text-[#94A3B8]" : "text-[#52525B]"
            )}
          >
            {achievement.subtitle}
          </p>
        </div>

        {/* 3. VERIFIED STATS GRID (2–4 stats) */}
        {visibleStats.length > 0 && (
          <div className="relative z-10 space-y-2">
            <div
              className={cn(
                "grid gap-2.5",
                visibleStats.length === 2
                  ? "grid-cols-2"
                  : visibleStats.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2"
              )}
            >
              {visibleStats.slice(0, 4).map((stat) => (
                <div
                  key={stat.id}
                  className={cn(
                    "rounded-2xl p-3 text-center transition-all space-y-0.5",
                    isDark
                      ? "bg-[#131B2A]/80 border border-brand/20 shadow-2xs backdrop-blur"
                      : templateId === "developer"
                      ? "bg-white border border-[#E2E8F0] shadow-2xs font-mono"
                      : templateId === "progress"
                      ? "bg-white/90 border border-[#FDBA74]/50 shadow-2xs"
                      : "bg-white border border-[#E4E4E7] shadow-2xs"
                  )}
                >
                  <span
                    className={cn(
                      "block text-xl font-black tabular-nums tracking-tight",
                      isDark ? "text-brand" : "text-[#09090B]"
                    )}
                  >
                    {stat.value}
                  </span>
                  <span
                    className={cn(
                      "block text-[10px] font-bold uppercase tracking-wider truncate",
                      isDark ? "text-[#94A3B8]" : "text-[#71717A]"
                    )}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. FOOTER: INSPIRATIONAL QUOTE & PROFILE URL */}
        <div className="relative z-10 space-y-3 pt-2">
          <div
            className={cn(
              "h-px w-full",
              isDark ? "bg-white/10" : "bg-black/10"
            )}
          />

          <div className="flex items-center justify-between gap-3 text-xs">
            {/* Tagline */}
            <p
              className={cn(
                "font-bold text-[11px] tracking-tight italic",
                isDark ? "text-[#CBD5E1]" : "text-[#3F3F46]"
              )}
            >
              "{tagline}"
            </p>

            {/* Public Link */}
            {showPublicLink && (
              <div className="inline-flex items-center gap-1 font-extrabold text-[10.5px] text-brand shrink-0">
                <span>skillverse.com/u/{username.toLowerCase()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PosterPreview.displayName = "PosterPreview";
