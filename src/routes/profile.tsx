import { createFileRoute, Link as RouterLink } from "@tanstack/react-router";
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
  Link as LinkIcon
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
  const {
    profile,
    update,
    setExperience,
    setProjects,
    completion,
  } = useProfile();

  const { refreshConnections } = useIdentityHub();

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
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    role: "Student",
    gender: "",
    summary: "",
    skills: "",
    achievements: "",
  });

  // Experience Modal
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [editingExpId, setEditingExpId] = useState<string | null>(null);
  const [expCompany, setExpCompany] = useState("");
  const [expRole, setExpRole] = useState("");
  const [expStart, setExpStart] = useState("");
  const [expEnd, setExpEnd] = useState("");
  const [expSummary, setExpSummary] = useState("");

  // Project Modal & Delete Confirmation
  const [projModalOpen, setProjModalOpen] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [deleteProjConfirmId, setDeleteProjConfirmId] = useState<string | null>(null);
  const [projName, setProjName] = useState("");
  const [projStack, setProjStack] = useState("");
  const [projLink, setProjLink] = useState("");
  const [projSummary, setProjSummary] = useState("");

  // Platform Connect Modal State
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState<PlatformKey | null>(null);
  const [platformUsernameInput, setPlatformUsernameInput] = useState("");
  const [isConnectingPlatform, setIsConnectingPlatform] = useState(false);
  const [syncingPlatformKey, setSyncingPlatformKey] = useState<string | null>(null);

  const firstName = useMemo(() => {
    const fullName = profile.fullName || user?.name || "Developer";
    return fullName.trim().split(" ")[0];
  }, [profile.fullName, user?.name]);

  // Sync connections & platform store on mount
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(user.id);
      refreshConnections();
    }
  }, [user?.id, fetchDashboardData, refreshConnections]);

  const enterEditMode = () => {
    setDraft({
      fullName: profile.fullName || user?.name || "",
      headline: profile.headline || "",
      email: profile.email || user?.email || "",
      phone: profile.phone || "",
      location: profile.location || "",
      role: profile.role || "Student",
      gender: profile.gender || "",
      summary: profile.summary || "",
      skills: profile.skills || "",
      achievements: profile.achievements || "",
    });
    setErrors({});
    setIsEditing(true);
    window.scrollTo({ top: 350, behavior: "smooth" });
  };

  const cancelEditMode = () => {
    setIsEditing(false);
    setErrors({});
  };

  const handleSaveProfile = async () => {
    const result = basicsSchema.safeParse(draft);
    if (!result.success) {
      const flat: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!flat[key]) flat[key] = issue.message;
      }
      setErrors(flat);
      toast.error("Please fix the validation errors before saving");
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      update({
        fullName: draft.fullName.trim(),
        headline: draft.headline.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        location: draft.location.trim(),
        role: draft.role?.trim() || "Student",
        gender: draft.gender?.trim() || "",
        summary: draft.summary.trim(),
        skills: draft.skills.trim(),
        achievements: draft.achievements.trim(),
      });

      await new Promise((r) => setTimeout(r, 600));
      toast.success("Profile saved successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Experience Handlers
  const handleSaveExperience = () => {
    if (!expCompany.trim() || !expRole.trim()) {
      toast.error("Company and Role are required");
      return;
    }

    const newItem: Experience = {
      id: editingExpId || crypto.randomUUID(),
      company: expCompany.trim(),
      role: expRole.trim(),
      start: expStart.trim() || "2024",
      end: expEnd.trim() || "Present",
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

  // Project Handlers
  const openAddProjectModal = () => {
    setEditingProjId(null);
    setProjName("");
    setProjStack("");
    setProjLink("");
    setProjSummary("");
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
    if (!profile.skills) return [];
    return profile.skills.split(",").map((s) => s.trim()).filter(Boolean);
  }, [profile.skills]);

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-hero">
        {/* Soft Ambient Backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-24 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px] animate-pulse-glow" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-12 space-y-10 animate-fade-up">
          
          {/* Header Title Section matching Dashboard scale */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                </span>
                YOUR PROFILE
              </div>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
                Good to see you, <span className="text-gradient">{firstName}</span>.
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your career identity, built once and ready for every opportunity.
              </p>
            </div>
          </div>

          {/* 1. TOP HERO PROFILE ID CARD */}
          <div className="glass group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-8 shadow-elegant transition-all hover:shadow-glow">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand/10 to-transparent" />

            <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              
              {/* Left Column: Avatar + Bio */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left min-w-0">
                {/* Profile Photo / Existing SkillVerse Avatar */}
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
                  <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-background bg-emerald-500 text-white shadow-sm" title="Active Developer">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                </div>

                {/* Identity Information */}
                <div className="space-y-2 min-w-0">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {profile.fullName || user?.name || "SASI THEHSEEN"}
                    </h2>
                    <p className="text-sm font-semibold text-brand mt-0.5">
                      {profile.headline || "Java Full Stack Developer"}
                    </p>
                  </div>

                  {/* Compact Metadata Chips */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-muted-foreground pt-0.5">
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
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Available
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
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

              {/* Right Column: Edit Action & Profile Completion Bar */}
              <div className="flex flex-col items-center md:items-end justify-between gap-4 shrink-0 w-full md:w-auto border-t md:border-t-0 border-border/50 pt-4 md:pt-0">
                {!isEditing ? (
                  <Button
                    onClick={enterEditMode}
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-xs font-semibold text-brand-foreground shadow-sm transition-all hover:opacity-90 hover:translate-x-0.5"
                  >
                    Edit Profile <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
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

                {/* Dashboard-Style Completion Indicator */}
                <div className="w-full max-w-[240px] rounded-2xl border border-border/60 bg-background/60 p-3.5 backdrop-blur shadow-sm space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-muted-foreground uppercase tracking-wider">Profile</span>
                    <span className="text-foreground">{completion}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all duration-500"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground/80 leading-tight">
                    {completion === 100 ? "PROFILE COMPLETE" : "Complete your profile to strengthen your career presence."}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Digital ID Watermark Label */}
            <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
              <span className="flex items-center gap-1.5 text-brand">
                <Sparkles className="h-3.5 w-3.5" /> SKILLVERSE CAREER IDENTITY
              </span>
              <span className="text-muted-foreground">PROFESSIONAL PROFILE</span>
            </div>
          </div>

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
                <div className="space-y-1.5">
                  <Label className="font-semibold text-foreground">Full Name *</Label>
                  <Input
                    value={draft.fullName}
                    onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
                    placeholder="Sasi Thehseen"
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
                    placeholder="Male / Female / Other"
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
                    placeholder="9398683053"
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
              
              {/* 2. BASICS SECTION */}
              <div className="space-y-3">
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

              {/* 3. PROFESSIONAL SUMMARY */}
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

              {/* 4. CORE SKILLS */}
              <div className="space-y-3">
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

              {/* 5. EDUCATION */}
              <EducationSection />

              {/* 6. EXPERIENCE */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <DashboardSectionHeader title="EXPERIENCE" desc="Professional internships, jobs, and leadership roles." />
                  <Button
                    onClick={() => {
                      setEditingExpId(null);
                      setExpCompany("");
                      setExpRole("");
                      setExpStart("2024");
                      setExpEnd("Present");
                      setExpSummary("");
                      setExpModalOpen(true);
                    }}
                    size="sm"
                    className="bg-brand text-brand-foreground hover:opacity-90 rounded-xl text-xs gap-1 font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Experience
                  </Button>
                </div>

                {(!profile.experience || profile.experience.length === 0) ? (
                  <div className="glass rounded-3xl border border-border/70 bg-card p-8 text-center shadow-elegant">
                    <Briefcase className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="text-xs text-muted-foreground">No experience entries added yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {profile.experience.map((exp) => (
                      <div key={exp.id} className="glass rounded-2xl border border-border/70 bg-card p-5 shadow-elegant flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-foreground">{exp.role}</h4>
                          <p className="text-xs font-semibold text-brand">{exp.company}</p>
                          <p className="text-[11px] text-muted-foreground">{exp.start} — {exp.end}</p>
                          {exp.summary && <p className="text-xs text-muted-foreground pt-1 leading-relaxed">{exp.summary}</p>}
                        </div>

                        <div className="flex gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 rounded-xl"
                            onClick={() => {
                              setEditingExpId(exp.id);
                              setExpCompany(exp.company);
                              setExpRole(exp.role);
                              setExpStart(exp.start);
                              setExpEnd(exp.end);
                              setExpSummary(exp.summary || "");
                              setExpModalOpen(true);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 rounded-xl hover:text-destructive"
                            onClick={() => handleDeleteExperience(exp.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 7. PROJECTS SECTION */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <DashboardSectionHeader title="PROJECTS" desc="Featured work and technical applications." />
                  <Button
                    onClick={openAddProjectModal}
                    size="sm"
                    className="bg-brand text-brand-foreground hover:opacity-90 rounded-xl text-xs gap-1 font-semibold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Project
                  </Button>
                </div>

                {(!profile.projects || profile.projects.length === 0) ? (
                  /* Compact Professional Empty State */
                  <div className="glass rounded-3xl border border-border/70 bg-card p-8 text-center shadow-elegant space-y-3">
                    <Code className="mx-auto h-9 w-9 text-muted-foreground/40" />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">No projects yet</h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        Showcase the applications, projects, and technical work you've built.
                      </p>
                    </div>
                    <Button
                      onClick={openAddProjectModal}
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs gap-1.5 mt-2 font-medium"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add your first project
                    </Button>
                  </div>
                ) : (
                  /* Grid matching Dashboard cards */
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {profile.projects.map((proj) => (
                      <div key={proj.id} className="glass rounded-2xl border border-border/70 bg-card p-5 shadow-elegant flex flex-col justify-between space-y-3 hover:border-brand/40 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-sm text-foreground">{proj.name}</h4>
                            {proj.link && (
                              <a href={proj.link} target="_blank" rel="noreferrer" className="text-brand hover:underline p-1" title="View Project">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-[10px] font-medium bg-secondary/80">
                            {proj.stack}
                          </Badge>
                          {proj.summary && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 pt-0.5">{proj.summary}</p>}
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-border/40">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2.5 text-[11px] rounded-lg hover:text-brand"
                            onClick={() => {
                              setEditingProjId(proj.id);
                              setProjName(proj.name);
                              setProjStack(proj.stack);
                              setProjLink(proj.link || "");
                              setProjSummary(proj.summary || "");
                              setProjModalOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2.5 text-[11px] rounded-lg hover:text-destructive hover:border-destructive/30"
                            onClick={() => setDeleteProjConfirmId(proj.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 8. DEVELOPER CONNECTIONS SECTION */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <DashboardSectionHeader title="DEVELOPER CONNECTIONS" desc="Connect your coding profiles to bring your developer activity into SkillVerse." />
                  </div>

                  <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1 bg-secondary/50">
                    {connectedCount} of 6 connected
                  </Badge>
                </div>

                {/* Compact Horizontal Platform Rows matching Dashboard styling */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {platformsList.map((plat) => {
                    const isConnected = plat.data?.connected && plat.data?.username;
                    const username = plat.data?.username;
                    const isSyncingThis = syncingPlatformKey === plat.key;

                    return (
                      <div key={plat.key} className="glass rounded-2xl border border-border/70 bg-card p-4 shadow-elegant flex flex-col justify-between gap-3 hover:border-brand/40 transition-all">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-9 w-9 rounded-xl bg-secondary/70 flex items-center justify-center shrink-0">
                            <plat.icon className="h-5 w-5 text-foreground" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="font-bold text-xs text-foreground">{plat.name}</h4>
                              {isConnected ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Connected
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-muted-foreground">Not connected</span>
                              )}
                            </div>

                            {isConnected ? (
                              <p className="text-[11px] font-semibold text-brand truncate mt-0.5">
                                @{username}
                              </p>
                            ) : (
                              <p className="text-[10px] text-muted-foreground/80 leading-tight mt-0.5 line-clamp-2">
                                {plat.desc}
                              </p>
                            )}
                          </div>
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
