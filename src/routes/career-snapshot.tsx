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
  Clock,
  Loader2,
  Briefcase,
  FileText,
  SlidersHorizontal,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { usePlatformStore } from "@/lib/platform-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
          "Transform your verified SkillVerse progress into a professional social poster and AI LinkedIn post.",
      },
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
  color: string;
}> = [
  { id: "minimal", name: "Minimal", color: "bg-amber-200 border-amber-400" },
  { id: "developer", name: "Developer", color: "bg-slate-300 border-slate-500" },
  { id: "progress", name: "Progress", color: "bg-orange-500 border-orange-600" },
  { id: "achievement", name: "Achievement", color: "bg-yellow-400 border-yellow-500" },
  { id: "dark", name: "Glowing Dark", color: "bg-slate-900 border-brand" },
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
  const { profile, completion = 0 } = useProfile();
  const { github, githubData, leetcodeData, gfgData } = usePlatformStore();
  const posterRef = useRef<HTMLDivElement>(null);

  const [activeRightTab, setActiveRightTab] = useState<"customize" | "caption">("customize");

  const [practiceSolvedCount] = useState<number>(() => {
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

    const languages =
      githubData?.languages && typeof githubData.languages === "object"
        ? Object.keys(githubData.languages)
        : [];

    const realStreak =
      gfgData?.potd?.currentStreak || (github?.connected ? 14 : Math.max(1, practiceSolvedCount));

    return {
      name: profile?.fullName || user?.name || "Sony",
      headline: profile?.headline || "Software Engineer",
      role: profile?.role || "Developer",
      location: profile?.location || "",
      username:
        (profile as any)?.username || user?.name?.toLowerCase().replace(/\s+/g, "") || "sony",
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
        Math.max(20, completion) * 0.3 +
          Math.min(100, githubReposCount * 10 + practiceSolvedCount * 5 + 30) * 0.7
      ),
      profileCompletion: completion || 75,
      hasAptitudeHistory: true,
    };
  }, [user, profile, completion, githubData, leetcodeData, gfgData, practiceSolvedCount, github]);

  const { bestAchievement, allAchievements, availableStats } = useMemo(() => {
    return analyzeAchievements(userData, shareHistory);
  }, [userData, shareHistory]);

  const [selectedStoryType, setSelectedStoryType] = useState<StoryType>(bestAchievement.type);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement>(bestAchievement);
  const [selectedTemplateId, setSelectedTemplateId] = useState<PosterTemplateId>(
    bestAchievement.recommendedTemplate || "progress"
  );

  const [selectedStatIds, setSelectedStatIds] = useState<string[]>(() => {
    return availableStats.slice(0, 3).map((s) => s.id);
  });

  const [captionTone, setCaptionTone] = useState<CaptionTone>("professional");
  const [captionLength] = useState<CaptionLength>("medium");
  const [includeProfileLink, setIncludeProfileLink] = useState<boolean>(true);
  const [captionText, setCaptionText] = useState<string>("");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState<boolean>(false);
  const [isExportingPoster, setIsExportingPoster] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [copiedCaption, setCopiedCaption] = useState<boolean>(false);

  useEffect(() => {
    const matching = allAchievements.find((a) => a.type === selectedStoryType);
    if (matching) {
      setCurrentAchievement(matching);
    } else {
      setCurrentAchievement({
        id: `custom_${selectedStoryType}`,
        type: selectedStoryType,
        title:
          selectedStoryType === "opportunity"
            ? "Open to Engineering Opportunities"
            : selectedStoryType === "project"
            ? `${userData.projectsCount || 1} Projects Shipped`
            : selectedStoryType === "progress"
            ? `${userData.codingStreak || 7} Day Streak`
            : "Developer Journey",
        subtitle: userData.headline,
        value: "SkillVerse",
        unit: "verified",
        iconName: "Sparkles",
        priority: 50,
        shareable: true,
        tagline: "Building and improving daily.",
        recommendedTemplate: selectedTemplateId,
        defaultStats: selectedStatIds,
      });
    }
  }, [selectedStoryType, allAchievements, userData, selectedTemplateId, selectedStatIds]);

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
    setTimeout(() => setIsGeneratingCaption(false), 150);
  }, [
    selectedStoryType,
    currentAchievement,
    captionTone,
    captionLength,
    selectedStatIds,
    includeProfileLink,
    userData,
    availableStats,
  ]);

  useEffect(() => {
    generateCaption();
  }, [generateCaption]);

  const toggleStat = (id: string) => {
    setSelectedStatIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) {
          toast.info("Keep at least 1 stat on poster");
          return prev;
        }
        return prev.filter((s) => s !== id);
      } else {
        if (prev.length >= 4) {
          toast.info("Maximum 4 stats on poster");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const visibleStatsList = useMemo(() => {
    return availableStats.filter((s) => selectedStatIds.includes(s.id));
  }, [availableStats, selectedStatIds]);

  const handleDownloadPoster = async () => {
    if (!posterRef.current) return;
    setIsExportingPoster(true);

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });

      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `SkillVerse-Poster-${userData.username}.png`;
      link.href = dataUrl;
      link.click();

      const newEntry: ShareHistoryEntry = {
        id: `snap_${Date.now()}`,
        achievementId: currentAchievement.id,
        storyType: selectedStoryType,
        storyTitle: currentAchievement.title,
        templateId: selectedTemplateId,
        createdAt: new Date().toISOString(),
        status: "downloaded",
      };
      const updated = [newEntry, ...shareHistory.slice(0, 7)];
      setShareHistory(updated);
      saveSnapshotHistory(updated);

      toast.success("Social Poster downloaded in HD! 🎨");
    } catch (err: any) {
      toast.error("Poster export failed. Please try again.");
    } finally {
      setIsExportingPoster(false);
    }
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(captionText);
      setCopiedCaption(true);
      toast.success("LinkedIn post caption copied!");
      setTimeout(() => setCopiedCaption(false), 2500);
    } catch {
      toast.error("Failed to copy caption.");
    }
  };

  const handlePublishLinkedIn = async () => {
    setIsPublishing(true);
    await handleCopyCaption();
    toast.info("Opening LinkedIn... Paste your copied caption into your new post!");
    setTimeout(() => {
      window.open("https://www.linkedin.com/feed/", "_blank");
      setIsPublishing(false);
    }, 800);
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-background text-foreground pb-20">
        {/* Simple Header */}
        <section className="border-b border-border/60 bg-hero/40">
          <div className="mx-auto max-w-6xl px-6 pt-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-brand transition-colors mb-2"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Profile
                </Link>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  Career Snapshot <span className="text-gradient">Studio</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Create a verified social poster & AI LinkedIn post in seconds.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={handleDownloadPoster}
                  disabled={isExportingPoster}
                  variant="outline"
                  className="rounded-xl text-xs font-bold gap-1.5 h-9 px-4 border-border"
                >
                  {isExportingPoster ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5 text-brand" />
                  )}
                  <span>Download PNG</span>
                </Button>

                <Button
                  onClick={handlePublishLinkedIn}
                  disabled={isPublishing}
                  className="bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white rounded-xl text-xs font-bold gap-1.5 h-9 px-4 shadow-sm"
                >
                  <FaLinkedin className="h-4 w-4" />
                  <span>Publish to LinkedIn</span>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Clean Studio Layout */}
        <main className="mx-auto max-w-6xl px-6 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: LIVE POSTER CANVAS (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="glass rounded-3xl p-6 sm:p-8 border border-border/70 shadow-elegant flex flex-col items-center justify-center relative overflow-hidden">
                <PosterPreview
                  ref={posterRef}
                  templateId={selectedTemplateId}
                  achievement={currentAchievement}
                  data={userData}
                  visibleStats={visibleStatsList}
                  showPublicLink={includeProfileLink}
                />
              </div>

              {/* Theme Quick Bar */}
              <div className="glass rounded-2xl p-3 border border-border/60 flex items-center justify-between gap-2 overflow-x-auto custom-scrollbar">
                <span className="text-xs font-bold text-muted-foreground shrink-0 pl-1">Theme:</span>
                <div className="flex items-center gap-2 shrink-0">
                  {TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => setSelectedTemplateId(tmpl.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        selectedTemplateId === tmpl.id
                          ? "bg-brand text-white border-brand shadow-xs scale-[1.02]"
                          : "bg-background text-foreground hover:bg-secondary border-border"
                      )}
                    >
                      <span className={cn("h-2.5 w-2.5 rounded-full border", tmpl.color)} />
                      <span>{tmpl.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: UNIFIED CUSTOMIZER & SHARE DECK (5 Cols - Perfect Height Match) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* CARD 1: MILESTONE FOCUS & STATS */}
              <Card className="p-5 rounded-3xl border border-border/70 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-brand flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> 1. Select Milestone Focus
                  </h3>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {selectedStatIds.length}/4 Stats On Poster
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STORY_TYPES.map((story) => {
                    const Icon = story.icon;
                    const isSelected = selectedStoryType === story.id;
                    return (
                      <button
                        key={story.id}
                        onClick={() => setSelectedStoryType(story.id)}
                        className={cn(
                          "inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                          isSelected
                            ? "bg-brand text-white border-brand shadow-2xs scale-[1.02]"
                            : "bg-background text-foreground hover:bg-secondary border-border/70"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="truncate">{story.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="h-px bg-border/40 my-2" />

                {/* Displayed Stats Chips */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground block">
                    Active Statistics on Poster:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableStats.map((stat) => {
                      const isChecked = selectedStatIds.includes(stat.id);
                      return (
                        <button
                          key={stat.id}
                          onClick={() => toggleStat(stat.id)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                            isChecked
                              ? "bg-brand/10 border-brand/40 text-brand font-bold"
                              : "bg-background border-border text-muted-foreground hover:text-foreground opacity-70"
                          )}
                        >
                          <span>{stat.label}</span>
                          <strong className="text-foreground">({stat.value})</strong>
                          {isChecked && <Check className="h-3 w-3 text-brand stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>

              {/* CARD 2: AI LINKEDIN POST CAPTION */}
              <Card className="p-5 rounded-3xl border border-border/70 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0A66C2] flex items-center gap-1.5">
                    <FaLinkedin className="h-3.5 w-3.5" /> 2. AI LinkedIn Post Text
                  </h3>

                  {/* Tone Switcher */}
                  <div className="flex items-center gap-1">
                    {(["professional", "personal", "technical"] as CaptionTone[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setCaptionTone(t)}
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-lg capitalize border transition-all cursor-pointer",
                          captionTone === t
                            ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                            : "bg-background text-muted-foreground border-border hover:text-foreground"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                    <button
                      onClick={generateCaption}
                      disabled={isGeneratingCaption}
                      className="p-1 text-brand hover:bg-brand/10 rounded-lg transition-colors ml-0.5 cursor-pointer"
                      title="Regenerate caption"
                    >
                      <RefreshCw className={cn("h-3.5 w-3.5", isGeneratingCaption && "animate-spin")} />
                    </button>
                  </div>
                </div>

                <Textarea
                  value={captionText}
                  onChange={(e) => setCaptionText(e.target.value)}
                  rows={5}
                  className="w-full text-xs rounded-2xl border-border bg-background p-3.5 leading-relaxed focus-visible:ring-brand"
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-muted-foreground font-medium select-none text-[11px]">
                    <input
                      type="checkbox"
                      checked={includeProfileLink}
                      onChange={(e) => setIncludeProfileLink(e.target.checked)}
                      className="rounded accent-brand h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>Attach Profile Link</span>
                  </label>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyCaption}
                    className="text-xs font-bold text-brand h-7 px-2.5 rounded-xl hover:bg-brand/10"
                  >
                    {copiedCaption ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copiedCaption ? "Copied!" : "Copy Post Text"}
                  </Button>
                </div>
              </Card>

              {/* CARD 3: SNAPSHOT HISTORY & VERIFIED IDENTITY DECK */}
              <div className="glass rounded-3xl p-4 border border-border/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-brand" />
                    Verified Snapshot History
                  </span>
                  <span className="text-[10px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-md border border-brand/20">
                    skillverse.com/u/{userData.username}
                  </span>
                </div>

                {shareHistory.length > 0 ? (
                  <div className="space-y-2">
                    {shareHistory.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-card border border-border/50 flex items-center justify-between text-xs hover:border-brand/40 transition-colors"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold truncate text-foreground block">{item.storyTitle}</span>
                          <span className="text-[10px] text-muted-foreground capitalize block">
                            {item.templateId} theme • {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md shrink-0">
                          {item.status || "Saved"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Your generated posters and captions will be logged here automatically.
                  </p>
                )}
              </div>

            </div>
          </div>
        </main>
      </div>
    </PageShell>
  );
}
