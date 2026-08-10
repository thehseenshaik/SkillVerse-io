import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Sparkles,
  Download,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Flame,
  Code2,
  Layers,
  Trophy,
  Compass,
  TrendingUp,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Send,
  Loader2,
  Briefcase,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { usePlatformStore } from "@/lib/platform-store";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";

import {
  analyzeAchievements,
  loadSnapshotHistory,
  saveSnapshotHistory,
  type StoryType,
  type PosterTemplateId,
  type Achievement,
  type StatItem,
  type UserRealData,
  type ShareHistoryEntry,
} from "@/lib/career-snapshot/achievement-engine";

import {
  generateLinkedInCaption,
  type CaptionTone,
  type CaptionLength,
} from "@/lib/career-snapshot/caption-generator";

import { PosterPreview } from "@/components/career-snapshot/PosterPreview";

export const Route = createFileRoute("/career-snapshot")({
  head: () => ({
    meta: [
      { title: "Career Snapshot Studio — SkillVerse" },
      {
        name: "description",
        content:
          "Transform your verified SkillVerse progress, coding achievements, and developer activity into a professional social poster and AI LinkedIn post.",
      },
      { property: "og:title", content: "Career Snapshot Studio — SkillVerse" },
    ],
  }),
  component: () => (
    <AuthGate>
      <CareerSnapshotStudioPage />
    </AuthGate>
  ),
});

const TEMPLATES: Array<{
  id: PosterTemplateId;
  name: string;
}> = [
  { id: "minimal", name: "Minimal" },
  { id: "developer", name: "Developer" },
  { id: "progress", name: "Progress" },
  { id: "achievement", name: "Achievement" },
  { id: "dark", name: "Dark (Glowing)" },
];

const STORY_TYPES: Array<{
  id: StoryType;
  label: string;
  icon: any;
}> = [
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "achievement", label: "Achievement", icon: Trophy },
  { id: "project", label: "Project", icon: Layers },
  { id: "career", label: "Career", icon: Briefcase },
  { id: "journey", label: "Journey", icon: Compass },
  { id: "opportunity", label: "Opportunities", icon: Sparkles },
];

export function CareerSnapshotStudioPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, completion = 0 } = useProfile();
  const { github, githubData, leetcode, leetcodeData, gfg, gfgData } = usePlatformStore();
  const posterRef = useRef<HTMLDivElement>(null);

  // Solved DSA count from Practice page + platforms
  const [practiceSolvedCount, setPracticeSolvedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("skillverse_solved_practice_problems");
      return saved ? JSON.parse(saved).length : 0;
    } catch {
      return 0;
    }
  });

  const [shareHistory, setShareHistory] = useState<ShareHistoryEntry[]>(() =>
    loadSnapshotHistory()
  );

  // Build Real User Data Model
  const userData: UserRealData = useMemo(() => {
    const skillsList = profile?.skills
      ? profile.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const projectsList = Array.isArray(profile?.projects) ? profile.projects : [];
    const githubReposCount = Array.isArray(githubData?.repositories)
      ? githubData.repositories.length
      : 0;
    const githubStarsCount = Array.isArray(githubData?.repositories)
      ? githubData.repositories.reduce((acc, r) => acc + (r.stars || 0), 0)
      : 0;

    const languages = githubData?.languages && typeof githubData.languages === "object"
      ? Object.keys(githubData.languages)
      : [];

    const realStreak = gfgData?.potd?.currentStreak || (github?.connected ? 14 : Math.max(1, practiceSolvedCount));

    return {
      name: profile?.fullName || user?.name || "Sony",
      headline: profile?.headline || "Java Full Stack Developer",
      role: profile?.role || "Developer",
      location: profile?.location || "",
      username: (profile as any)?.username || user?.name?.toLowerCase().replace(/\s+/g, "") || "sony",
      skills: skillsList,
      projectsCount: projectsList.length,
      liveProjectsCount: projectsList.filter((p) => Boolean(p.link)).length,
      recentProjectName: projectsList[0]?.name,
      solvedDsaCount: practiceSolvedCount,
      leetcodeSolved: leetcodeData?.totalSolved || 0,
      gfgSolved: gfgData?.problems?.total || gfgData?.potd?.totalSolved || 0,
      codingStreak: realStreak,
      githubRepos: githubReposCount,
      githubStars: githubStarsCount,
      githubFollowers: githubData?.profile?.followers || 0,
      githubLanguages: languages,
      careerScore: Math.round(
        (Math.max(20, completion) * 0.3) +
        (Math.min(100, (githubReposCount * 10) + (practiceSolvedCount * 5) + 30) * 0.7)
      ),
      profileCompletion: completion || 75,
      hasAptitudeHistory: true,
    };
  }, [user, profile, completion, githubData, leetcodeData, gfgData, practiceSolvedCount, github]);

  // Run Achievement Engine
  const { bestAchievement, allAchievements, availableStats } = useMemo(() => {
    return analyzeAchievements(userData, shareHistory);
  }, [userData, shareHistory]);

  // Studio State Controls — automatically select the recommended milestone by default
  const [selectedStoryType, setSelectedStoryType] = useState<StoryType>(bestAchievement.type);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement>(bestAchievement);
  const [selectedTemplateId, setSelectedTemplateId] = useState<PosterTemplateId>(bestAchievement.recommendedTemplate || "progress");

  // Visible stats selection (2-3 stats)
  const [selectedStatIds, setSelectedStatIds] = useState<string[]>(() => {
    return availableStats.slice(0, 3).map((s) => s.id);
  });

  // Caption Generator State
  const [captionTone, setCaptionTone] = useState<CaptionTone>("professional");
  const [captionLength, setCaptionLength] = useState<CaptionLength>("medium");
  const [includeProfileLink, setIncludeProfileLink] = useState<boolean>(true);
  const [captionText, setCaptionText] = useState<string>("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState<boolean>(false);
  const [isExportingPoster, setIsExportingPoster] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);
  const [copiedProfileLink, setCopiedProfileLink] = useState<boolean>(false);

  // Sync current achievement when story type changes
  useEffect(() => {
    const matching = allAchievements.find((a) => a.type === selectedStoryType);
    if (matching) {
      setCurrentAchievement(matching);
    } else {
      setCurrentAchievement({
        id: `custom_${selectedStoryType}`,
        type: selectedStoryType,
        title: selectedStoryType === "opportunity"
          ? "Open to Engineering Opportunities"
          : selectedStoryType === "project"
          ? `${userData.projectsCount || 1} Projects Built & Shipped`
          : selectedStoryType === "progress"
          ? `${userData.codingStreak || 7} Day Coding Streak`
          : "Starting My Developer Journey",
        subtitle: userData.headline,
        value: "SkillVerse",
        unit: "verified",
        iconName: "Sparkles",
        priority: 50,
        shareable: true,
        tagline: "Still learning. Still building. Still improving.",
        recommendedTemplate: selectedTemplateId,
        defaultStats: selectedStatIds,
      });
    }
  }, [selectedStoryType, allAchievements, userData, selectedTemplateId, selectedStatIds]);

  // Generate initial caption
  const generateCaption = useCallback(() => {
    setIsGeneratingCaption(true);
    const publicUrl = `skillverse.com/u/${userData.username}`;
    const activeStats = availableStats.filter((s) => selectedStatIds.includes(s.id));

    const result = generateLinkedInCaption({
      storyType: selectedStoryType,
      achievement: currentAchievement,
      tone: captionTone,
      length: captionLength,
      selectedStats: activeStats,
      includeProfileLink,
      publicProfileUrl: publicUrl,
      data: userData,
    });

    setCaptionText(result.captionText);
    setTimeout(() => setIsGeneratingCaption(false), 200);
  }, [selectedStoryType, currentAchievement, captionTone, captionLength, selectedStatIds, includeProfileLink, userData, availableStats]);

  useEffect(() => {
    generateCaption();
  }, [generateCaption]);

  // Stat toggle handler
  const toggleStat = (id: string) => {
    setSelectedStatIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) {
          toast.info("Keep at least 1 stat visible on the poster");
          return prev;
        }
        return prev.filter((s) => s !== id);
      } else {
        if (prev.length >= 4) {
          toast.info("Maximum 4 stats recommended on the poster");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const visibleStatsList = useMemo(() => {
    return availableStats.filter((s) => selectedStatIds.includes(s.id));
  }, [availableStats, selectedStatIds]);

  // Download High-Resolution Poster (1080x1350 PNG)
  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setIsExportingPoster(true);

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 3, // Crisp 3x DPI for social media
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `SkillVerse-Snapshot-${userData.username}-${selectedTemplateId}.png`;
      link.href = dataUrl;
      link.click();

      // Record in Share History
      const newEntry: ShareHistoryEntry = {
        id: `snap_${Date.now()}`,
        achievementId: currentAchievement.id,
        storyType: selectedStoryType,
        storyTitle: currentAchievement.title,
        templateId: selectedTemplateId,
        selectedStatIds,
        caption: captionText,
        platform: "download",
        status: "Downloaded",
        createdAt: new Date().toISOString(),
      };
      const updated = saveSnapshotHistory(newEntry);
      setShareHistory(updated);

      toast.success("High-resolution poster downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsExportingPoster(false);
    }
  };

  // Copy Caption to Clipboard
  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captionText);
    setCopiedCaption(true);
    toast.success("Caption copied to clipboard!");
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  // Copy Public Profile Link
  const handleCopyProfileLink = () => {
    const url = `https://skillverse.com/u/${userData.username}`;
    navigator.clipboard.writeText(url);
    setCopiedProfileLink(true);
    toast.success("Profile link copied!");
    setTimeout(() => setCopiedProfileLink(false), 2000);
  };

  // Publish on LinkedIn
  const handlePublishLinkedIn = async () => {
    setIsPublishing(true);

    try {
      const res = await fetch("/api/linkedin/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          captionText,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("🎉 Successfully published to LinkedIn!");
        if (data.postUrl) {
          window.open(data.postUrl, "_blank");
        }
        const newEntry: ShareHistoryEntry = {
          id: `snap_${Date.now()}`,
          achievementId: currentAchievement.id,
          storyType: selectedStoryType,
          storyTitle: currentAchievement.title,
          templateId: selectedTemplateId,
          selectedStatIds,
          caption: captionText,
          platform: "linkedin",
          status: "Published",
          createdAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
          platformPostId: data.postId,
        };
        const updated = saveSnapshotHistory(newEntry);
        setShareHistory(updated);
      } else {
        toast.info("Opening LinkedIn composer with your caption ready!");
        navigator.clipboard.writeText(captionText);
        await handleDownloadPoster();
        const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(captionText)}`;
        window.open(shareUrl, "_blank");
      }
    } catch (err) {
      navigator.clipboard.writeText(captionText);
      await handleDownloadPoster();
      const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(captionText)}`;
      window.open(shareUrl, "_blank");
    } finally {
      setIsPublishing(false);
    }
  };

  // Reuse previous snapshot
  const handleReuseSnapshot = (entry: ShareHistoryEntry) => {
    setSelectedStoryType(entry.storyType);
    setSelectedTemplateId(entry.templateId);
    setSelectedStatIds(entry.selectedStatIds || []);
    setCaptionText(entry.caption);
    toast.success(`Loaded: ${entry.storyTitle}`);
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
        
        {/* Ambient Pulsing Glow Backgrounds */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-12 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-brand/12 blur-[130px] animate-pulse-glow" />
          <div className="absolute right-10 top-96 h-80 w-80 rounded-full bg-brand/10 blur-[110px]" />
        </div>

        {/* 1. HERO HEADER */}
        <section className="relative border-b border-border/60 bg-hero/50 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl px-6 pt-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
              <div className="space-y-1.5">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-brand transition-colors mb-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Profile</span>
                </Link>

                <div className="flex items-center gap-2.5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand backdrop-blur shadow-2xs">
                    <Sparkles className="h-3.5 w-3.5 text-brand" />
                    CAREER SNAPSHOT STUDIO
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">• Live 4:5 Studio</span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Share your <span className="text-gradient">verified developer journey</span>.
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
                  Transform your verified SkillVerse progress, coding achievements, and developer activity into a high-resolution social poster and AI-crafted LinkedIn post.
                </p>
              </div>

              {/* Quick Action Top Button */}
              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  onClick={handlePublishLinkedIn}
                  disabled={isPublishing}
                  className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white rounded-xl text-xs font-bold gap-2 h-9 px-4 shadow-sm cursor-pointer"
                >
                  <FaLinkedin className="h-4 w-4" />
                  {isPublishing ? "Publishing..." : "Publish to LinkedIn"}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. MAIN STUDIO WORKSPACE */}
        <main className="max-w-6xl mx-auto px-6 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: CONTROL DECK (5 cols) */}
            <div className="lg:col-span-5 space-y-6 animate-fade-up">

              {/* CARD 1: STORY FOCUS & THEME DESIGN */}
              <Card className="p-5 rounded-3xl border border-border/70 bg-card shadow-xs space-y-5">
                
                {/* Section A: Story Focus */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-brand" />
                      Story Focus
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Milestone Type
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STORY_TYPES.map((story) => {
                      const Icon = story.icon;
                      const isSelected = selectedStoryType === story.id;

                      return (
                        <button
                          key={story.id}
                          type="button"
                          onClick={() => setSelectedStoryType(story.id)}
                          className={cn(
                            "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border",
                            isSelected
                              ? "bg-brand text-brand-foreground border-brand shadow-2xs scale-[1.02]"
                              : "bg-secondary/40 text-foreground hover:bg-secondary border-border/60"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          <span className="truncate">{story.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-border/40" />

                {/* Section B: Theme Designs */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-brand" />
                      Poster Theme
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold capitalize">
                      {selectedTemplateId}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {TEMPLATES.map((tmpl) => {
                      const isSelected = selectedTemplateId === tmpl.id;
                      const themeColors: Record<PosterTemplateId, string> = {
                        minimal: "bg-amber-100 border-amber-300",
                        developer: "bg-slate-200 border-slate-400",
                        progress: "bg-orange-400 border-orange-500",
                        achievement: "bg-yellow-400 border-yellow-500",
                        dark: "bg-slate-900 border-brand",
                      };

                      return (
                        <button
                          key={tmpl.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(tmpl.id)}
                          className={cn(
                            "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border",
                            isSelected
                              ? "bg-foreground text-background border-foreground shadow-2xs ring-2 ring-brand/30 scale-[1.02]"
                              : "bg-secondary/50 text-foreground hover:bg-secondary border-border/50"
                          )}
                        >
                          <span className={cn("h-2.5 w-2.5 rounded-full border shadow-2xs", themeColors[tmpl.id])} />
                          <span>{tmpl.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </Card>

              {/* CARD 2: INCLUDED STATISTICS CHIPS */}
              <Card className="p-5 rounded-3xl border border-border/70 bg-card shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-brand" />
                    Included Statistics
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand/10 text-brand">
                    {selectedStatIds.length} / 4 active
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {availableStats.map((stat) => {
                    const isChecked = selectedStatIds.includes(stat.id);

                    return (
                      <button
                        key={stat.id}
                        type="button"
                        onClick={() => toggleStat(stat.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer border",
                          isChecked
                            ? "bg-brand/10 border-brand/40 text-brand font-bold shadow-2xs"
                            : "bg-secondary/40 border-border/50 text-muted-foreground hover:text-foreground opacity-75"
                        )}
                      >
                        <span>{stat.label}</span>
                        <strong className="text-foreground tabular-nums font-bold">({stat.value})</strong>
                        {isChecked && <Check className="h-3 w-3 text-brand stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* CARD 3: LINKEDIN CAPTION STUDIO */}
              <Card className="p-5 rounded-3xl border border-border/70 bg-card shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FaLinkedin className="h-3.5 w-3.5 text-[#0A66C2]" />
                    AI LinkedIn Caption Studio
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* Tone Pills */}
                    {(["professional", "personal", "technical"] as CaptionTone[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCaptionTone(t)}
                        className={cn(
                          "text-[10.5px] font-bold px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer border",
                          captionTone === t
                            ? "bg-brand text-brand-foreground border-brand shadow-2xs"
                            : "bg-secondary/40 text-muted-foreground hover:text-foreground border-border/50"
                        )}
                      >
                        {t}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={generateCaption}
                      disabled={isGeneratingCaption}
                      className="p-1 text-brand hover:opacity-80 cursor-pointer ml-0.5 rounded-lg hover:bg-brand/10 transition-colors"
                      title="Regenerate caption"
                    >
                      <RefreshCw className={cn("h-4 w-4", isGeneratingCaption && "animate-spin")} />
                    </button>
                  </div>
                </div>

                <Textarea
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  rows={7}
                  placeholder="AI generated LinkedIn post..."
                  className="w-full text-xs font-normal rounded-2xl border-border/70 bg-background p-3.5 leading-relaxed focus-visible:ring-brand"
                />

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
                    <input
                      type="checkbox"
                      checked={includeProfileLink}
                      onChange={(e) => setIncludeProfileLink(e.target.checked)}
                      className="rounded accent-brand h-4 w-4 cursor-pointer"
                    />
                    <span>Attach SkillVerse Profile Link</span>
                  </label>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCaption}
                    className="text-xs font-bold text-brand h-7 px-2.5 hover:bg-brand/10 rounded-xl"
                  >
                    {copiedCaption ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copiedCaption ? "Copied to Clipboard" : "Copy Caption"}
                  </Button>
                </div>
              </Card>

            </div>

            {/* RIGHT COLUMN: LIVE SHARP POSTER & ACTIONS (7 cols) */}
            <div className="lg:col-span-7 space-y-6 animate-fade-up">

              {/* POSTER VIEWPORT CANVAS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-brand flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      LIVE 4:5 POSTER CANVAS
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Preview
                    </span>
                  </div>

                  <span className="text-[10.5px] font-semibold text-muted-foreground">
                    1080 × 1350 High-DPI Output
                  </span>
                </div>

                {/* Studio Viewport Surface with Ambient Glow */}
                <div className="p-6 sm:p-8 rounded-3xl border border-border/70 bg-gradient-to-b from-card to-secondary/30 flex items-center justify-center relative overflow-hidden shadow-elegant">
                  <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
                  <PosterPreview
                    ref={posterRef}
                    templateId={selectedTemplateId}
                    achievement={currentAchievement}
                    data={userData}
                    visibleStats={visibleStatsList}
                    showPublicLink={includeProfileLink}
                  />
                </div>
              </div>

              {/* CONSOLIDATED ACTION TOOLBAR */}
              <Card className="p-4 rounded-3xl border border-border/70 bg-card shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDownloadPoster}
                    disabled={isExportingPoster}
                    className="text-xs font-bold h-9 px-4 rounded-xl gap-1.5 border-border hover:bg-secondary text-foreground"
                  >
                    {isExportingPoster ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5 text-brand" />}
                    Download PNG
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCaption}
                    className="text-xs font-bold h-9 px-3.5 rounded-xl gap-1.5 border-border hover:bg-secondary text-foreground"
                  >
                    {copiedCaption ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedCaption ? "Caption Copied" : "Copy Caption"}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyProfileLink}
                    className="text-xs font-semibold h-9 px-3 rounded-xl gap-1 text-muted-foreground hover:text-brand"
                  >
                    {copiedProfileLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <ExternalLink className="h-3.5 w-3.5" />}
                    {copiedProfileLink ? "Link Copied" : "Profile Link"}
                  </Button>
                </div>

                <Button
                  size="sm"
                  onClick={handlePublishLinkedIn}
                  disabled={isPublishing}
                  className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-2xs gap-1.5 cursor-pointer"
                >
                  <FaLinkedin className="h-4 w-4" />
                  {isPublishing ? "Publishing..." : "Publish to LinkedIn →"}
                </Button>
              </Card>

              {/* REVISE / PREVIOUS SNAPSHOTS HISTORY */}
              {shareHistory.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-brand" />
                      Snapshot History
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {shareHistory.length} saved
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {shareHistory.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl border border-border/70 bg-card shadow-2xs flex items-center justify-between gap-3 text-xs hover:border-brand/40 transition-all group"
                      >
                        <div className="min-w-0">
                          <span className="block font-bold text-foreground truncate group-hover:text-brand transition-colors">
                            {item.storyTitle}
                          </span>
                          <span className="block text-[10.5px] text-muted-foreground capitalize mt-0.5">
                            {item.templateId} theme • {item.status} • {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReuseSnapshot(item)}
                          className="text-[11px] font-bold text-brand h-7 px-2.5 hover:bg-brand/10 rounded-xl shrink-0"
                        >
                          Load
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        </main>

      </div>
    </PageShell>
  );
}
