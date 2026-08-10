import { createFileRoute, Link as RouterLink, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { z } from "zod";
import {
  Loader2,
  Plus,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  GraduationCap,
  Users,
  BadgeCheck,
  RefreshCw,
  Edit,
  Save,
  X,
  Briefcase,
  Code,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  Link as LinkIcon,
  AtSign
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiLeetcode, SiCodeforces, SiCodechef, SiHackerrank } from "react-icons/si";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import {
  useProfile,
  type Experience,
  type ProjectItem,
} from "@/lib/profile-context";
import { EducationSection } from "@/components/profile/EducationSection";
import { UsernameManagerCard } from "@/components/profile/UsernameManagerCard";
import { usernameService } from "@/lib/services/username-service";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { usePlatformStore } from "@/lib/platform-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — SkillVerse" },
      {
        name: "description",
        content: "Your unified developer identity and career operating profile.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <ProfilePage />
    </AuthGate>
  ),
});

const basicsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "At least 3 characters")
    .max(30, "Max 30 characters")
    .regex(/^[a-z0-9_-]+$/, "Only lowercase letters, numbers, - and _")
    .optional()
    .or(z.literal("")),
  fullName: z
    .string()
    .trim()
    .min(2, "At least 2 characters")
    .max(80, "Keep it under 80 characters"),
  headline: z.string().trim().max(120, "Keep it under 120 characters"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(254, "Email too long"),
  phone: z.string().trim().max(30, "Keep it under 30 characters"),
  location: z.string().trim().max(120, "Keep it under 120 characters"),
  summary: z.string().trim().max(600, "Keep it under 600 characters"),
  skills: z.string().trim().max(400, "Keep it under 400 characters"),
  role: z.string().trim().max(50).optional(),
  gender: z.string().trim().max(30).optional(),
});

type PlatformKey = "github" | "leetcode" | "gfg" | "codeforces" | "codechef" | "hackerrank";

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    profile,
    update,
    setExperience,
    setProjects,
    completion = 0,
  } = useProfile();

  const { refreshConnections } = useIdentityHub();

  const [activeUsername, setActiveUsername] = useState<string>("");
  const [successUsername, setSuccessUsername] = useState<string | null>(null);

  const {
    github,
    leetcode,
    gfg,
    codeforces,
    codechef,
    hackerrank,
    validateGitHubUsername,
    connectGitHub,
    syncGitHub,
    validateLeetCodeUsername,
    connectLeetCode,
    syncLeetCode,
    validateGFGUsername,
    connectGFG,
    syncGFG,
    validateCodeforcesUsername,
    connectCodeforces,
    syncCodeforces,
    validateCodeChefUsername,
    connectCodeChef,
    syncCodeChef,
    validateHackerRankUsername,
    connectHackerRank,
    syncHackerRank,
    fetchDashboardData,
    clearError,
  } = usePlatformStore();

  // Core UX States: VIEW MODE (Default) vs EDIT MODE
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form Edit Draft State
  const [draft, setDraft] = useState({
    username: "",
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    skills: "",
    role: "",
    gender: "",
  });

  // Experience Modal & Editing State
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expCompany, setExpCompany] = useState("");
  const [expRole, setExpRole] = useState("");
  const [expStart, setExpStart] = useState("");
  const [expEnd, setExpEnd] = useState("");
  const [expSummary, setExpSummary] = useState("");

  // Project Modal & Editing State
  const [projModalOpen, setProjModalOpen] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [projName, setProjName] = useState("");
  const [projStack, setProjStack] = useState("");
  const [projLink, setProjLink] = useState("");
  const [projSummary, setProjSummary] = useState("");
  const [deleteProjConfirmId, setDeleteProjConfirmId] = useState<string | null>(null);

  // Platform Connect Modal State
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState<PlatformKey | null>(null);
  const [platformUsernameInput, setPlatformUsernameInput] = useState("");
  const [isConnectingPlatform, setIsConnectingPlatform] = useState(false);
  const [syncingPlatformKey, setSyncingPlatformKey] = useState<PlatformKey | null>(null);

  // Load User Data and Username into Profile state
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(user.id);
      usernameService.getUsernameByUserId(user.id).then((handle) => {
        if (handle) {
          setActiveUsername(handle);
        } else if (user.email) {
          setActiveUsername(user.email.split("@")[0].toLowerCase());
        }
      });
    }
  }, [user?.id, fetchDashboardData, user?.email]);

  // Sync Draft state when entering Edit Mode
  const enterEditMode = () => {
    setDraft({
      username: profile.username || activeUsername || "",
      fullName: profile.fullName || user?.name || "",
      headline: profile.headline || "",
      email: profile.email || user?.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      summary: profile.summary || "",
      skills: profile.skills || "",
      role: profile.role || "Student",
      gender: profile.gender || "",
    });
    setErrors({});
    setIsEditing(true);
  };

  const cancelEditMode = () => {
    setIsEditing(false);
    setErrors({});
  };

  const handleSaveProfile = async () => {
    setErrors({});
    const result = basicsSchema.safeParse(draft);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please review and fix the errors in the form.");
      return;
    }

    setIsSaving(true);
    try {
      let savedHandle = activeUsername;
      if (draft.username && user?.id) {
        const cleanHandle = draft.username.trim().toLowerCase().replace(/^@/, '');
        if (cleanHandle && cleanHandle !== activeUsername) {
          await usernameService.claimUsername(user.id, cleanHandle);
          setActiveUsername(cleanHandle);
          savedHandle = cleanHandle;
          setSuccessUsername(cleanHandle);
        }
      }

      await update({
        username: savedHandle,
        fullName: draft.fullName,
        headline: draft.headline,
        email: draft.email,
        phone: draft.phone,
        location: draft.location,
        summary: draft.summary,
        skills: draft.skills,
        role: draft.role,
        gender: draft.gender,
      });

      if (savedHandle && (!activeUsername || savedHandle !== activeUsername)) {
        setSuccessUsername(savedHandle);
        toast.success(`🎉 Username @${savedHandle} set successfully!`);
      } else {
        toast.success("Profile saved successfully");
      }
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Experience Actions
  const openAddExpModal = () => {
    setEditingExpId(null);
    setExpCompany("");
    setExpRole("");
    setExpStart("");
    setExpEnd("");
    setExpSummary("");
    setExpModalOpen(true);
  };

  const openEditExpModal = (exp: Experience) => {
    setEditingExpId(exp.id);
    setExpCompany(exp.company || "");
    setExpRole(exp.role || "");
    setExpStart(exp.start || "");
    setExpEnd(exp.end || "");
    setExpSummary(exp.summary || "");
    setExpModalOpen(true);
  };

  const handleSaveExperience = () => {
    if (!expCompany.trim() || !expRole.trim()) {
      toast.error("Company and Role are required");
      return;
    }

    const newItem: Experience = {
      id: editingExpId || crypto.randomUUID(),
      company: expCompany.trim(),
      role: expRole.trim(),
      start: expStart.trim(),
      end: expEnd.trim(),
      summary: expSummary.trim(),
    };

    const currentList = profile.experience || [];
    if (editingExpId) {
      setExperience(currentList.map((e) => (e.id === editingExpId ? newItem : e)));
      toast.success("Experience updated");
    } else {
      setExperience([newItem, ...currentList]);
      toast.success("Experience added");
    }
    setExpModalOpen(false);
  };

  const handleDeleteExperience = (id: string) => {
    setExperience((profile.experience || []).filter((e) => e.id !== id));
    toast.success("Experience removed");
  };

  // Project Actions
  const openAddProjectModal = () => {
    setEditingProjId(null);
    setProjName("");
    setProjStack("");
    setProjLink("");
    setProjSummary("");
    setProjModalOpen(true);
  };

  const openEditProjectModal = (proj: ProjectItem) => {
    setEditingProjId(proj.id);
    setProjName(proj.name || "");
    setProjStack(proj.stack || "");
    setProjLink(proj.link || "");
    setProjSummary(proj.summary || "");
    setProjModalOpen(true);
  };

  const handleSaveProject = () => {
    if (!projName.trim()) {
      toast.error("Project name is required");
      return;
    }

    const newItem: ProjectItem = {
      id: editingProjId || crypto.randomUUID(),
      name: projName.trim(),
      stack: projStack.trim() || "JavaScript, React",
      link: projLink.trim(),
      summary: projSummary.trim(),
    };

    const currentList = profile.projects || [];
    if (editingProjId) {
      setProjects(currentList.map((p) => (p.id === editingProjId ? newItem : p)));
      toast.success("Project updated");
    } else {
      setProjects([newItem, ...currentList]);
      toast.success("Project added");
    }
    setProjModalOpen(false);
  };

  const handleDeleteProject = (id: string) => {
    setProjects((profile.projects || []).filter((p) => p.id !== id));
    setDeleteProjConfirmId(null);
    toast.success("Project removed");
  };

  // Platform Connection Handlers
  const openConnectModal = (key: PlatformKey) => {
    setActivePlatform(key);
    setPlatformUsernameInput("");
    clearError();
    setConnectModalOpen(true);
  };

  const handleConnectSubmit = async () => {
    if (!activePlatform || !platformUsernameInput.trim() || !user?.id) return;
    setIsConnectingPlatform(true);

    try {
      const handle = platformUsernameInput.trim();
      switch (activePlatform) {
        case "github":
          await validateGitHubUsername(handle);
          await connectGitHub(user.id, handle);
          break;
        case "leetcode":
          await validateLeetCodeUsername(handle);
          await connectLeetCode(user.id, handle);
          break;
        case "gfg":
          await validateGFGUsername(handle);
          await connectGFG(user.id, handle);
          break;
        case "codeforces":
          await validateCodeforcesUsername(handle);
          await connectCodeforces(user.id, handle);
          break;
        case "codechef":
          await validateCodeChefUsername(handle);
          await connectCodeChef(user.id, handle);
          break;
        case "hackerrank":
          await validateHackerRankUsername(handle);
          await connectHackerRank(user.id, handle);
          break;
      }

      await refreshConnections();
      toast.success(`Successfully connected ${activePlatform.toUpperCase()}`);
      setConnectModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || `Failed to connect ${activePlatform}`);
    } finally {
      setIsConnectingPlatform(false);
    }
  };

  const handleSyncPlatform = async (key: PlatformKey) => {
    if (!user?.id) return;
    setSyncingPlatformKey(key);

    try {
      switch (key) {
        case "github":
          await syncGitHub(user.id);
          break;
        case "leetcode":
          await syncLeetCode(user.id);
          break;
        case "gfg":
          await syncGFG(user.id);
          break;
        case "codeforces":
          await syncCodeforces(user.id);
          break;
        case "codechef":
          await syncCodeChef(user.id);
          break;
        case "hackerrank":
          await syncHackerRank(user.id);
          break;
      }
      await refreshConnections();
      toast.success(`Synced ${key.toUpperCase()} data`);
    } catch (err) {
      toast.error(`Sync failed for ${key}. Please try again.`);
    } finally {
      setSyncingPlatformKey(null);
    }
  };

  // Platform Connection Map
  const platformsList = [
    { name: "GitHub", icon: FaGithub, key: "github" as PlatformKey, data: github, desc: "Connect GitHub to sync repositories, commits, and activity." },
    { name: "LeetCode", icon: SiLeetcode, key: "leetcode" as PlatformKey, data: leetcode, desc: "Connect LeetCode to sync solved problems and rating." },
    { name: "GeeksforGeeks", icon: SiCodeforces, key: "gfg" as PlatformKey, data: gfg, desc: "Connect GeeksforGeeks to sync coding score and streak." },
    { name: "Codeforces", icon: SiCodeforces, key: "codeforces" as PlatformKey, data: codeforces, desc: "Connect Codeforces to sync rating, rank, and contest activity." },
    { name: "CodeChef", icon: SiCodechef, key: "codechef" as PlatformKey, data: codechef, desc: "Connect CodeChef to sync rating, stars, and problem stats." },
    { name: "HackerRank", icon: SiHackerrank, key: "hackerrank" as PlatformKey, data: hackerrank, desc: "Connect HackerRank to sync domain badges and verified skills." },
  ];

  const connectedCount = useMemo(() => {
    return platformsList.filter((p) => p.data?.connected && p.data?.username).length;
  }, [github, leetcode, gfg, codeforces, codechef, hackerrank]);

  // Skill Chips Array
  const skillChips = useMemo(() => {
    if (!profile?.skills) return [];
    if (Array.isArray(profile.skills)) return profile.skills;
    if (typeof profile.skills === 'string') {
      return profile.skills.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [profile?.skills]);

  const firstName = (typeof profile?.fullName === 'string' && profile.fullName ? profile.fullName : (user?.name || "Developer")).split(" ")[0];

  // Smart Incomplete Section Finder (identifies single most important missing item)
  const missingSection = useMemo(() => {
    if (!profile?.education || !Array.isArray(profile.education) || profile.education.length === 0) {
      return { label: "Education is incomplete", id: "education" };
    }
    const hasSkills = Array.isArray(profile?.skills) ? profile.skills.length > 0 : (typeof profile?.skills === 'string' && profile.skills.trim().length > 0);
    if (!hasSkills) {
      return { label: "Skills are incomplete", id: "skills" };
    }
    if (!profile?.projects || !Array.isArray(profile.projects) || profile.projects.length === 0) {
      return { label: "Projects are incomplete", id: "projects" };
    }
    if (!profile?.summary || typeof profile.summary !== 'string' || profile.summary.trim().length === 0) {
      return { label: "Summary is incomplete", id: "basics" };
    }
    if (!profile?.location || typeof profile.location !== 'string' || profile.location.trim().length === 0) {
      return { label: "Location is incomplete", id: "basics" };
    }
    return null;
  }, [profile]);

  const appOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://skillverse-io.web.app';

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-hero pb-16">
        {/* Soft Ambient Backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-24 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-brand/12 blur-[130px] animate-pulse-glow" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-10 space-y-9 animate-fade-up">
          
          {/* Header Title Section */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand backdrop-blur shadow-2xs">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              YOUR PROFILE
            </div>
            <h1 className="mt-2.5 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Good to see you, <span className="text-gradient">{firstName}</span>.
            </h1>
            <p className="mt-1.5 text-sm sm:text-base text-muted-foreground font-normal">
              Your career identity, built once and ready for every opportunity.
            </p>
          </div>

          {/* CELEBRATORY USERNAME SET SUCCESS BANNER */}
          {successUsername && (
            <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-500/10 via-card to-brand/10 p-6 sm:p-7 shadow-lg animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Username Set Successfully!
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    Your public portfolio is live at <span className="text-gradient">@{successUsername}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">
                    {appOrigin}/u/{successUsername}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(`${appOrigin}/u/${successUsername}`);
                        toast.success("Portfolio link copied to clipboard!");
                      }
                    }}
                    variant="outline"
                    className="h-11 px-5 rounded-xl border-border/80 font-bold gap-2 hover:border-brand/40"
                  >
                    <LinkIcon className="h-4 w-4 text-brand" />
                    Copy Portfolio Link
                  </Button>
                  <Button
                    asChild
                    className="h-11 px-5 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold gap-2 shadow-xs shadow-brand/20"
                  >
                    <a href={`/u/${successUsername}`} target="_blank" rel="noopener noreferrer">
                      View Live Portfolio <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSuccessUsername(null)}
                    className="h-11 px-3 text-muted-foreground hover:text-foreground"
                    title="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 1. MAIN PROFILE CARD (VISUAL CENTERPIECE) */}
          <div className="glass group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-elegant transition-all hover:shadow-glow">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand/8 to-transparent" />

            <div className="relative flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
              
              {/* Left Column: Avatar + Bio + Contacts */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left min-w-0 flex-1">
                {/* Profile Photo */}
                <div className="relative shrink-0">
                  {user?.avatarUrl || (profile as any)?.photoURL ? (
                    <img
                      src={user?.avatarUrl || (profile as any)?.photoURL}
                      alt={profile.fullName || user?.name || "Profile"}
                      className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover ring-4 ring-background shadow-lg"
                    />
                  ) : (
                    <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-strong text-white ring-4 ring-background shadow-lg">
                      <User className="h-12 w-12 sm:h-14 sm:w-14" />
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-background bg-emerald-500 text-white shadow-sm" title="Active Verified Developer">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                </div>

                {/* Identity Information */}
                <div className="space-y-3 min-w-0">
                  <div>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                        {profile.fullName || user?.name || "Shaik Thehseen"}
                      </h2>
                      {(activeUsername || profile.username) && (
                        <a
                          href={`/u/${activeUsername || profile.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand/10 hover:bg-brand/15 text-brand border border-brand/20 font-mono text-xs font-bold transition-colors"
                          title="Open public portfolio"
                        >
                          @{activeUsername || profile.username}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-brand mt-0.5">
                      {profile.headline || "Java Full Stack Developer"}
                    </p>
                  </div>

                  {/* Compact Metadata Chips */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <GraduationCap className="h-3.5 w-3.5 text-brand" />
                      {profile.role || "Student"}
                    </span>
                    <span className="text-border">•</span>
                    {profile.location && (
                      <>
                        <span className="inline-flex items-center gap-1 font-medium">
                          <MapPin className="h-3.5 w-3.5 text-brand" />
                          {profile.location}
                        </span>
                        <span className="text-border">•</span>
                      </>
                    )}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Available
                    </span>
                  </div>

                  {/* Contact Info (Visually secondary) */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1 border-t border-border/40">
                    {(profile.email || user?.email) && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {profile.email || user?.email}
                      </span>
                    )}
                    {profile.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground/70" />
                        {profile.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Profile Strength + Actions */}
              <div className="flex flex-col items-center lg:items-end justify-between gap-5 shrink-0 w-full lg:w-72 border-t lg:border-t-0 border-border/50 pt-4 lg:pt-0">
                
                {/* Profile Strength Box */}
                <div className="w-full rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      PROFILE STRENGTH
                    </span>
                    <span className="text-lg font-black text-foreground tabular-nums">
                      {completion}%
                    </span>
                  </div>

                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>

                  {completion === 100 ? (
                    <div className="space-y-0.5 text-[10.5px] text-muted-foreground pt-0.5">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                        ✓ Career identity complete
                      </span>
                      <span className="block opacity-80">Ready for resume generation & Career Snapshot</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-muted-foreground font-medium">
                        {missingSection ? missingSection.label : "In progress"}
                      </span>
                      {missingSection && (
                        <a
                          href={`#${missingSection.id}`}
                          className="text-[10px] font-bold text-brand hover:underline"
                        >
                          Complete →
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons */}
                {!isEditing ? (
                  <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5 w-full">
                    {/* ONLY ONE CAREER SNAPSHOT ACTION ON THE ENTIRE PAGE */}
                    <Button
                      onClick={() => navigate({ to: "/career-snapshot" })}
                      variant="outline"
                      className="group inline-flex h-10 items-center gap-1.5 rounded-xl border-border bg-card px-4 text-xs font-semibold text-foreground shadow-2xs transition-all hover:bg-secondary hover:border-brand/50 hover:text-brand"
                      title="Create a visual snapshot of your latest career achievements"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-brand transition-transform group-hover:scale-110 group-hover:rotate-12" />
                      <span>✦ Share Progress</span>
                    </Button>

                    <Button
                      onClick={enterEditMode}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-xs font-bold text-brand-foreground shadow-2xs transition-all hover:opacity-90 hover:translate-x-0.5"
                    >
                      Edit Profile <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-end">
                    <Button
                      onClick={cancelEditMode}
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs"
                      disabled={isSaving}
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      size="sm"
                      className="bg-brand text-brand-foreground hover:opacity-90 rounded-xl text-xs font-semibold shadow-sm"
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                      Save Changes
                    </Button>
                  </div>
                )}

              </div>
            </div>

            {/* Subdued Profile Identity Footer */}
            <div className="mt-6 pt-4 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2 font-medium">
                <span className="font-extrabold text-brand tracking-wider uppercase text-[10px]">
                  SKILLVERSE IDENTITY
                </span>
                <span className="hidden sm:inline text-border">•</span>
                <span className="truncate">Your professional profile is ready to power your career tools.</span>
              </div>
              
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 shrink-0">
                {completion}% COMPLETE
              </span>
            </div>
          </div>

          {/* 2. DEVELOPER USERNAME & PUBLIC PORTFOLIO CARD */}
          <UsernameManagerCard onUsernameUpdated={(newHandle) => setProfile(prev => ({ ...prev, username: newHandle }))} />

          {/* EDIT MODE SECTION */}
          {isEditing && (
            <div className="glass rounded-3xl border border-brand/40 bg-card p-6 sm:p-8 shadow-elegant space-y-6 animate-fade-up">
              <div className="border-b border-border/50 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Edit Your Information</h3>
                  <p className="text-xs text-muted-foreground">Update your details below and click Save Changes to persist.</p>
                </div>
                <Badge className="bg-brand/10 text-brand border-brand/20 font-bold text-xs">
                  EDIT MODE
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-foreground flex items-center gap-1.5">
                      <AtSign className="h-3.5 w-3.5 text-brand" />
                      Public Developer Handle / Username
                    </Label>
                    <span className="text-[10.5px] font-mono text-muted-foreground">
                      https://skillverse-io.web.app/u/<strong>{draft.username || "username"}</strong>
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 font-mono font-bold text-muted-foreground select-none">
                      @
                    </span>
                    <Input
                      value={draft.username}
                      onChange={(e) => setDraft({ ...draft, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") })}
                      placeholder="your-unique-handle"
                      maxLength={30}
                      className="pl-8 bg-background text-xs font-mono font-bold"
                    />
                  </div>
                  {errors.username && <p className="text-[11px] text-destructive">{errors.username}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-foreground">Full Name *</Label>
                  <Input
                    value={draft.fullName}
                    onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                    placeholder="Shaik Thehseen"
                    className="bg-background text-xs"
                  />
                  {errors.fullName && <p className="text-[11px] text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-foreground">Headline</Label>
                  <Input
                    value={draft.headline}
                    onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
                    placeholder="Java Full Stack Developer"
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-foreground">Role / Status</Label>
                  <Input
                    value={draft.role}
                    onChange={(e) => setDraft({ ...draft, role: e.target.value })}
                    placeholder="Student"
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-foreground">Gender</Label>
                  <Input
                    value={draft.gender}
                    onChange={(e) => setDraft({ ...draft, gender: e.target.value })}
                    placeholder="e.g. Male / Female"
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-foreground">Email *</Label>
                  <Input
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    placeholder="thehseenshaik@gmail.com"
                    className="bg-background text-xs"
                  />
                  {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-foreground">Phone</Label>
                  <Input
                    value={draft.phone}
                    onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                    placeholder="+91 9398683053"
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="font-semibold text-foreground">Location</Label>
                  <Input
                    value={draft.location}
                    onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                    placeholder="Tadepalli, Andhra Pradesh"
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="font-semibold text-foreground">Core Skills (comma-separated)</Label>
                  <Input
                    value={draft.skills}
                    onChange={(e) => setDraft({ ...draft, skills: e.target.value })}
                    placeholder="Java, Spring Boot, Python, SQL, HTML, CSS, JavaScript"
                    className="bg-background text-xs"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="font-semibold text-foreground">Professional Summary</Label>
                  <Textarea
                    value={draft.summary}
                    onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                    rows={4}
                    placeholder="B.Tech CSE student and aspiring Java Full Stack Developer..."
                    className="bg-background text-xs leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 flex justify-end gap-2">
                <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={cancelEditMode}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-brand text-brand-foreground hover:opacity-90 rounded-xl text-xs font-semibold gap-1.5"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save Changes
                </Button>
              </div>
            </div>
          )}

          {/* VIEW MODE SECTIONS */}
          {!isEditing && (
            <div className="space-y-10">
              
              {/* 2. CAREER PROGRESS (HORIZONTAL VISUAL PROGRESS RAIL) */}
              <section id="career-progress" className="space-y-3 animate-fade-up">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-brand">
                    CAREER PROGRESS
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    A quick view of how your professional identity is coming together.
                  </p>
                </div>

                <Card className="rounded-3xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs space-y-6">
                  
                  {/* Horizontal Step Rail */}
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 relative">
                    {[
                      {
                        label: "BASICS",
                        status: profile.fullName && profile.headline ? "✓" : "○",
                        isDone: Boolean(profile.fullName && profile.headline),
                        target: "#basics",
                      },
                      {
                        label: "EDUCATION",
                        status: profile.education && profile.education.length > 0 ? "✓" : "○",
                        isDone: Boolean(profile.education && profile.education.length > 0),
                        target: "#education",
                      },
                      {
                        label: "SKILLS",
                        status: skillChips.length > 0 ? `${skillChips.length}` : "○",
                        isDone: skillChips.length > 0,
                        target: "#skills",
                      },
                      {
                        label: "PROJECTS",
                        status: profile.projects && profile.projects.length > 0 ? `${profile.projects.length}` : "0",
                        isDone: Boolean(profile.projects && profile.projects.length > 0),
                        target: "#projects",
                      },
                      {
                        label: "EXPERIENCE",
                        status: profile.experience && profile.experience.length > 0 ? `${profile.experience.length}` : "0",
                        isDone: Boolean(profile.experience && profile.experience.length > 0),
                        target: "#experience",
                      },
                      {
                        label: "PLATFORMS",
                        status: `${connectedCount}`,
                        isDone: connectedCount > 0,
                        target: "#platforms",
                      },
                    ].map((step) => (
                      <a
                        key={step.label}
                        href={step.target}
                        className={cn(
                          "p-3 rounded-2xl border text-center transition-all space-y-1.5 block hover:-translate-y-0.5",
                          step.isDone
                            ? "bg-secondary/40 border-border/70 text-foreground hover:border-brand/40"
                            : "bg-background/40 border-border/50 text-muted-foreground opacity-60 hover:opacity-100"
                        )}
                      >
                        <div className="flex items-center justify-center">
                          <span
                            className={cn(
                              "h-7 w-7 rounded-full text-xs font-bold grid place-items-center transition-colors tabular-nums",
                              step.isDone
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-secondary text-muted-foreground border border-border"
                            )}
                          >
                            {step.status}
                          </span>
                        </div>
                        <span className="block text-[10.5px] font-bold uppercase tracking-wider truncate">
                          {step.label}
                        </span>
                      </a>
                    ))}
                  </div>

                  {/* Bottom Completeness Summary */}
                  <div className="pt-3 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-foreground tabular-nums text-sm">{completion}%</span>
                      <span className="text-muted-foreground">profile completeness</span>
                    </div>

                    <span className="text-[11px] text-muted-foreground font-medium">
                      {completion === 100
                        ? "All core career identity sections completed."
                        : "Complete remaining sections to strengthen your ATS score."}
                    </span>
                  </div>

                </Card>
              </section>

              {/* 3. BASICS SECTION */}
              <div id="basics" className="space-y-3">
                <DashboardSectionHeader title="BASICS" desc="Your essential details, shared across your SkillVerse profile." />
                <div className="glass rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-elegant">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs">
                    <div className="border-b border-border/40 pb-3">
                      <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Full Name</span>
                      <span className="font-bold text-foreground text-sm">{profile.fullName || "Not provided"}</span>
                    </div>

                    <div className="border-b border-border/40 pb-3">
                      <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Headline</span>
                      <span className="font-bold text-foreground text-sm">{profile.headline || "Not provided"}</span>
                    </div>

                    <div className="border-b border-border/40 pb-3">
                      <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Role / Status</span>
                      <span className="font-semibold text-foreground">{profile.role || "Student"}</span>
                    </div>

                    <div className="border-b border-border/40 pb-3">
                      <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Gender</span>
                      <span className="font-semibold text-foreground">{profile.gender || "Not specified"}</span>
                    </div>

                    <div className="border-b border-border/40 pb-3">
                      <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Email</span>
                      <span className="font-semibold text-foreground">{profile.email || user?.email || "Not provided"}</span>
                    </div>

                    <div className="border-b border-border/40 pb-3">
                      <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Phone</span>
                      <span className="font-semibold text-foreground">{profile.phone || "Not provided"}</span>
                    </div>

                    <div className="sm:col-span-2">
                      <span className="text-muted-foreground block text-[11px] font-semibold uppercase tracking-wider mb-0.5">Location</span>
                      <span className="font-semibold text-foreground">{profile.location || "Not provided"}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. PROFESSIONAL SUMMARY */}
              <div className="space-y-3">
                <DashboardSectionHeader title="PROFESSIONAL SUMMARY" desc="Brief background and career focus." />
                <div className="glass rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-elegant">
                  {profile.summary ? (
                    <p className="text-sm text-foreground/90 leading-relaxed font-normal">
                      {profile.summary}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No professional summary added yet.</p>
                  )}
                </div>
              </div>

              {/* 5. CORE SKILLS */}
              <div id="skills" className="space-y-3">
                <DashboardSectionHeader title="CORE SKILLS" desc="Technical skills used for resume indexing and career matching." />
                <div className="glass rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-elegant">
                  {skillChips.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {skillChips.map((skill: string, i: number) => (
                        <span
                          key={i}
                          className="bg-secondary/60 text-foreground border border-border/60 hover:border-brand/40 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:bg-brand/10 hover:text-brand"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No skills added yet.</p>
                  )}
                </div>
              </div>

              {/* 6. EDUCATION */}
              <div id="education">
                <EducationSection />
              </div>

              {/* 7. EXPERIENCE */}
              <div id="experience" className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <DashboardSectionHeader title="EXPERIENCE" desc="Internships, technical roles, and work history." />
                  <Button
                    onClick={openAddExpModal}
                    size="sm"
                    className="bg-brand text-brand-foreground hover:opacity-90 rounded-xl text-xs font-semibold shadow-sm h-8 px-3"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Experience
                  </Button>
                </div>

                {profile.experience && profile.experience.length > 0 ? (
                  <div className="space-y-3">
                    {profile.experience.map((exp: Experience) => (
                      <Card key={exp.id} className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-foreground">{exp.role}</h4>
                            <span className="text-muted-foreground text-xs">at</span>
                            <span className="font-semibold text-brand text-xs">{exp.company}</span>
                          </div>
                          {(exp.start || exp.end) && (
                            <p className="text-xs text-muted-foreground">
                              {exp.start} — {exp.end || "Present"}
                            </p>
                          )}
                          {exp.summary && <p className="text-xs text-muted-foreground pt-1 leading-relaxed">{exp.summary}</p>}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => openEditExpModal(exp)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteExperience(exp.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="glass rounded-3xl border border-border/70 bg-card p-6 text-center text-xs text-muted-foreground">
                    No experience details added yet. Click "+ Add Experience" to add your work history.
                  </div>
                )}
              </div>

              {/* 8. PROJECTS */}
              <div id="projects" className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <DashboardSectionHeader title="PROJECTS" desc="Portfolio repositories and live engineering builds." />
                  <Button
                    onClick={openAddProjectModal}
                    size="sm"
                    className="bg-brand text-brand-foreground hover:opacity-90 rounded-xl text-xs font-semibold shadow-sm h-8 px-3"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Project
                  </Button>
                </div>

                {profile.projects && profile.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.projects.map((proj: ProjectItem) => (
                      <Card key={proj.id} className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-foreground truncate">{proj.name}</h4>
                            {proj.link && (
                              <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline flex items-center gap-1 shrink-0">
                                View <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          {proj.stack && <p className="text-xs text-muted-foreground font-mono">{proj.stack}</p>}
                          {proj.summary && <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">{proj.summary}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-1 pt-2 border-t border-border/40">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={() => openEditProjectModal(proj)}>
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive" onClick={() => setDeleteProjConfirmId(proj.id)}>
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="glass rounded-3xl border border-border/70 bg-card p-6 text-center text-xs text-muted-foreground">
                    No projects added yet. Click "+ Add Project" to showcase your portfolio.
                  </div>
                )}
              </div>

              {/* 9. CONNECTED PLATFORMS */}
              <div id="platforms" className="space-y-3 pt-2">
                <DashboardSectionHeader title="CONNECTED PLATFORMS" desc="Sync live coding stats, repositories, and streaks across platforms." />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {platformsList.map((plat) => {
                    const Icon = plat.icon;
                    const isConnected = plat.data?.connected && plat.data?.username;
                    const isSyncingThis = syncingPlatformKey === plat.key;

                    return (
                      <div
                        key={plat.name}
                        className="glass rounded-2xl border border-border/60 bg-card p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-brand/30 transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-xl bg-secondary/80 text-foreground grid place-items-center shrink-0">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-foreground leading-tight">{plat.name}</h4>
                                <span className="text-[10px] text-muted-foreground">
                                  {isConnected ? `@${plat.data?.username}` : "Not Connected"}
                                </span>
                              </div>
                            </div>

                            <span
                              className={cn(
                                "h-2 w-2 rounded-full",
                                isConnected ? "bg-emerald-500" : "bg-muted-foreground/30"
                              )}
                            />
                          </div>

                          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                            {plat.desc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px]">
                          {isConnected ? (
                            <>
                              <span className="text-muted-foreground flex items-center gap-1">
                                <RefreshCw className="h-2.5 w-2.5" /> Synced
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={isSyncingThis}
                                className="h-7 px-3 text-[11px] rounded-xl font-semibold gap-1 shrink-0"
                                onClick={() => handleSyncPlatform(plat.key)}
                              >
                                <RefreshCw className={cn("h-3 w-3", isSyncingThis && "animate-spin")} />
                                {isSyncingThis ? "Syncing..." : "Sync"}
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="text-muted-foreground">Not synced</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-3 text-[11px] rounded-xl font-semibold hover:border-brand hover:text-brand shrink-0"
                                onClick={() => openConnectModal(plat.key)}
                              >
                                <LinkIcon className="h-3 w-3 mr-1" /> Connect
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      </section>

      {/* Experience Modal */}
      <Dialog open={expModalOpen} onOpenChange={setExpModalOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingExpId ? "Edit Experience" : "Add Experience"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Company *</Label>
              <Input value={expCompany} onChange={(e) => setExpCompany(e.target.value)} placeholder="Company Name" className="bg-background text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Role *</Label>
              <Input value={expRole} onChange={(e) => setExpRole(e.target.value)} placeholder="e.g. Java Developer Intern" className="bg-background text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Start</Label>
                <Input value={expStart} onChange={(e) => setExpStart(e.target.value)} placeholder="Jun 2025" className="bg-background text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">End</Label>
                <Input value={expEnd} onChange={(e) => setExpEnd(e.target.value)} placeholder="Aug 2025 or Present" className="bg-background text-xs" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea value={expSummary} onChange={(e) => setExpSummary(e.target.value)} rows={3} placeholder="Key responsibilities and achievements..." className="bg-background text-xs" />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setExpModalOpen(false)}>Cancel</Button>
            <Button size="sm" className="bg-brand text-brand-foreground rounded-xl text-xs font-semibold" onClick={handleSaveExperience}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Add/Edit Modal */}
      <Dialog open={projModalOpen} onOpenChange={setProjModalOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingProjId ? "Edit Project" : "Add Project"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Project Name *</Label>
              <Input value={projName} onChange={(e) => setProjName(e.target.value)} placeholder="SkillVerse" className="bg-background text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tech Stack</Label>
              <Input value={projStack} onChange={(e) => setProjStack(e.target.value)} placeholder="Java, Spring Boot, React, Firebase" className="bg-background text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Live / Repo Link (Optional)</Label>
              <Input value={projLink} onChange={(e) => setProjLink(e.target.value)} placeholder="https://github.com/..." className="bg-background text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Summary</Label>
              <Textarea value={projSummary} onChange={(e) => setProjSummary(e.target.value)} rows={3} placeholder="Career identity and developer analytics platform..." className="bg-background text-xs" />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setProjModalOpen(false)}>Cancel</Button>
            <Button size="sm" className="bg-brand text-brand-foreground rounded-xl text-xs font-semibold" onClick={handleSaveProject}>Save Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Delete Confirmation Dialog */}
      <Dialog open={!!deleteProjConfirmId} onOpenChange={(open) => !open && setDeleteProjConfirmId(null)}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" /> Delete Project?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This will permanently remove this project from your profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setDeleteProjConfirmId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="rounded-xl text-xs"
              onClick={() => deleteProjConfirmId && handleDeleteProject(deleteProjConfirmId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Platform Connect Modal */}
      <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
        <DialogContent className="max-w-md bg-card border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-brand" /> Connect {activePlatform?.toUpperCase()}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter your {activePlatform?.toUpperCase()} username/handle below to connect your profile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{activePlatform?.toUpperCase()} Username *</Label>
              <Input
                value={platformUsernameInput}
                onChange={(e) => setPlatformUsernameInput(e.target.value)}
                placeholder={`e.g. ${activePlatform === 'github' ? 'Sassyurs19' : 'username'}`}
                className="bg-background text-xs"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" className="rounded-xl text-xs" onClick={() => setConnectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-brand text-brand-foreground rounded-xl text-xs font-semibold gap-1.5"
              onClick={handleConnectSubmit}
              disabled={isConnectingPlatform || !platformUsernameInput.trim()}
            >
              {isConnectingPlatform ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LinkIcon className="h-3.5 w-3.5" />}
              Connect Platform
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function DashboardSectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand backdrop-blur mb-1">
        {title}
      </div>
      <p className="text-xs text-muted-foreground font-medium">{desc}</p>
    </div>
  );
}
