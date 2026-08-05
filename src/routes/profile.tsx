import { createFileRoute, Link as RouterLink, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { z } from "zod";
import {
  Check,
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
  AlertCircle,
  RefreshCw,
  Link as LinkIcon,
  Clock,
  ExternalLink,
  Code,
} from "lucide-react";
import { FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";
import { SiLeetcode, SiCodeforces, SiCodechef, SiHackerrank } from "react-icons/si";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import {
  useProfile,
  newId,
  type Education,
  type Experience,
  type ProjectItem,
} from "@/lib/profile-context";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — SkillVerse" },
      {
        name: "description",
        content:
          "Fill your profile once. Generate resumes, portfolios and interview prep from a single source of truth.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Profile — SkillVerse" },
      { property: "og:description", content: "Your unified career identity." },
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
});

const educationSchema = z.object({
  school: z.string().trim().min(2, "School name required").max(100),
  degree: z.string().trim().min(2, "Degree required").max(50),
  field: z.string().trim().min(2, "Field of study required").max(100),
  start: z
    .string()
    .trim()
    .min(4, "Start year required")
    .max(4, "Enter valid year"),
  end: z.string().trim().min(2, "End date required").max(20),
  grade: z.string().trim().max(20).optional(),
});

const experienceSchema = z.object({
  company: z.string().trim().min(2, "Company name required").max(100),
  role: z.string().trim().min(2, "Role required").max(100),
  start: z.string().trim().min(7, "Start date required (MMM YYYY)").max(20),
  end: z.string().trim().min(2, "End date required").max(20),
  summary: z.string().trim().max(500, "Keep it under 500 characters"),
});

const projectSchema = z.object({
  name: z.string().trim().min(2, "Project name required").max(100),
  stack: z.string().trim().min(2, "Stack required").max(200),
  link: z
    .string()
    .trim()
    .url("Enter valid URL")
    .max(500)
    .optional()
    .or(z.literal("")),
  summary: z.string().trim().max(500, "Keep it under 500 characters"),
});

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    profile,
    hydrated,
    update,
    setEducation,
    setExperience,
    setProjects,
    completion,
  } = useProfile();
  const {
    connections,
    syncPlatform,
    isSyncing,
    syncProgress,
    refreshConnections,
  } = useIdentityHub();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [savingBasics, setSavingBasics] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seed name/email from auth once, if empty.
  useEffect(() => {
    if (!hydrated || !user) return;
    const patch: Partial<typeof profile> = {};
    if (!profile.fullName) patch.fullName = user.name;
    if (!profile.email) patch.email = user.email;
    if (Object.keys(patch).length) update(patch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user?.id]);

  // Refresh connections on mount
  useEffect(() => {
    refreshConnections();
  }, [refreshConnections]);

  // Validate basics in real-time
  const validateBasics = useCallback(() => {
    const parsed = basicsSchema.safeParse({
      fullName: profile.fullName,
      headline: profile.headline,
      email: profile.email,
      phone: profile.phone,
      location: profile.location,
      summary: profile.summary,
      skills: profile.skills,
    });
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        const k = String(i.path[0] ?? "form");
        if (!flat[k]) flat[k] = i.message;
      }
      return flat;
    }
    return {};
  }, [profile]);

  // Check if basics are valid
  const isBasicsValid = Object.keys(validateBasics()).length === 0;

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [profile]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const onSaveBasics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateBasics();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the validation errors before saving");
      return;
    }

    setIsSubmitting(true);
    setSavingBasics(true);
    setErrors({});

    try {
      // Trim all values before saving
      const trimmedProfile = {
        fullName: profile.fullName?.trim(),
        headline: profile.headline?.trim(),
        email: profile.email?.trim(),
        phone: profile.phone?.trim(),
        location: profile.location?.trim(),
        summary: profile.summary?.trim(),
        skills: profile.skills?.trim(),
      };

      // Only update non-empty fields
      const patch: Partial<typeof profile> = {};
      Object.entries(trimmedProfile).forEach(([key, value]) => {
        if (value && value !== profile[key as keyof typeof profile]) {
          (patch as any)[key] = value;
        }
      });

      if (Object.keys(patch).length > 0) {
        update(patch);
      }

      await new Promise((r) => setTimeout(r, 800));
      setSaved(true);
      setHasUnsavedChanges(false);
      toast.success("Profile saved successfully!");
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error("Failed to save profile. Please try again.");
      console.error("Save error:", error);
    } finally {
      setSavingBasics(false);
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-6 py-12">
        {/* Premium centered identity card — read-only */}
        <div className="relative mx-auto max-w-xl">
          <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-brand-gradient opacity-20 blur-3xl" />
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-b from-secondary/50 via-background to-background shadow-elegant">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-brand/10 to-transparent" />

            <div className="relative flex flex-col items-center px-8 pb-8 pt-12 text-center">
              {/* Person icon */}
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-brand-gradient opacity-60 blur-lg" />
                <div className="relative grid h-28 w-28 place-items-center rounded-full bg-brand-gradient text-white ring-4 ring-background shadow-glow">
                  <User className="h-14 w-14" strokeWidth={1.5} />
                </div>
                <span className="absolute -bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full border-4 border-background bg-brand text-background">
                  <BadgeCheck className="h-4 w-4" />
                </span>
              </div>

              {/* Name + headline */}
              <h1 className="mt-6 text-2xl font-bold tracking-tight md:text-[26px]">
                {profile.fullName || user?.name || "Your name"}
              </h1>
              {(profile.headline || !profile.fullName) && (
                <p className="mt-1 text-sm font-medium text-muted-foreground">
                  {profile.headline || "Add a headline in the form below"}
                </p>
              )}

              {/* Chips */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {profile.role || "Student"}
                </span>
                {profile.gender && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {profile.gender}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                  Active
                </span>
              </div>

              {/* Contact row */}
              {(profile.email || profile.location) && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                  {profile.email && (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {profile.email}
                    </span>
                  )}
                  {profile.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {profile.location}
                    </span>
                  )}
                </div>
              )}

              {/* Completion bar */}
              <div className="mt-7 w-full max-w-xs">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em]">
                  <span className="text-muted-foreground">Profile</span>
                  <span className="text-foreground">{completion}%</span>
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-brand-gradient transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {/* Basics — compact form */}
          <form
            id="basics"
            onSubmit={onSaveBasics}
            className="rounded-2xl border border-border/70 bg-card p-6 shadow-elegant lg:col-span-2"
            noValidate
          >
            <SectionHeader
              title="Basics"
              desc="Core identity — used in your resume and interviews."
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField
                label="Full name *"
                value={profile.fullName}
                onChange={(v) => update({ fullName: v })}
                icon={<User className="h-4 w-4" />}
                error={errors.fullName}
                maxLength={80}
                required
              />
              <TextField
                label="Headline"
                value={profile.headline}
                onChange={(v) => update({ headline: v })}
                placeholder="CS undergrad · Full-stack"
                error={errors.headline}
                maxLength={120}
              />
              <SelectField
                label="I am a"
                value={profile.role}
                onChange={(v) => update({ role: v })}
                options={[
                  "Student",
                  "Working Professional",
                  "Job Seeker",
                  "Freelancer",
                  "Founder",
                ]}
                icon={<GraduationCap className="h-4 w-4" />}
              />
              <SelectField
                label="Gender"
                value={profile.gender}
                onChange={(v) => update({ gender: v })}
                options={[
                  "",
                  "Male",
                  "Female",
                  "Non-binary",
                  "Prefer not to say",
                ]}
                icon={<Users className="h-4 w-4" />}
              />
              <TextField
                label="Email *"
                value={profile.email}
                onChange={(v) => update({ email: v })}
                icon={<Mail className="h-4 w-4" />}
                error={errors.email}
                maxLength={254}
                type="email"
                required
              />
              <TextField
                label="Phone"
                value={profile.phone}
                onChange={(v) => update({ phone: v })}
                icon={<Phone className="h-4 w-4" />}
                error={errors.phone}
                maxLength={30}
              />
              <TextField
                label="Location"
                value={profile.location}
                onChange={(v) => update({ location: v })}
                icon={<MapPin className="h-4 w-4" />}
                error={errors.location}
                maxLength={120}
              />
              <TextField
                label="Core skills"
                value={profile.skills}
                onChange={(v) => update({ skills: v })}
                placeholder="React, TypeScript, Python, SQL"
                error={errors.skills}
                maxLength={400}
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-xs font-medium text-muted-foreground">
                Professional summary
              </label>
              <textarea
                value={profile.summary}
                onChange={(e) => update({ summary: e.target.value })}
                rows={4}
                maxLength={600}
                placeholder="2–3 lines about who you are, what you build, and what you're looking for."
                className={`w-full rounded-xl border bg-background p-3 text-sm outline-none transition-all focus:ring-2 focus:ring-brand/20 ${
                  errors.summary
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-brand"
                }`}
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span className={errors.summary ? "text-destructive" : ""}>
                  {errors.summary}
                </span>
                <span>{profile.summary.length}/600</span>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="submit"
                disabled={savingBasics || !isBasicsValid}
                className="inline-flex h-10 min-w-[8rem] items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground shadow-elegant transition-all hover:opacity-90 focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                {savingBasics ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Save Profile"
                )}
              </button>
              {saved && !savingBasics && (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand animate-fade-up">
                  <Check className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
          </form>

          {/* Connect Profiles */}
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-secondary/50 via-card to-card p-6 shadow-elegant">
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/10 blur-3xl" />
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Connected platforms"
                desc="Sync your coding profiles for insights."
              />
              <RouterLink to="/connections" className="text-xs font-medium text-brand hover:underline">
                Manage →
              </RouterLink>
            </div>
            <ul className="relative mt-5 space-y-2.5">
              {[
                { platform: 'github', name: 'GitHub', icon: <FaGithub className="h-4 w-4" />, iconClass: "text-foreground" },
                { platform: 'leetcode', name: 'LeetCode', icon: <SiLeetcode className="h-4 w-4 text-[#FFA116]" />, iconClass: "text-[#FFA116]" },
                { platform: 'gfg', name: 'GeeksforGeeks', icon: <Code className="h-4 w-4 text-[#2F8D46]" />, iconClass: "text-[#2F8D46]" },
                { platform: 'codeforces', name: 'Codeforces', icon: <SiCodeforces className="h-4 w-4 text-[#B91C1C]" />, iconClass: "text-[#B91C1C]" },
                { platform: 'codechef', name: 'CodeChef', icon: <SiCodechef className="h-4 w-4 text-[#8B5CF6]" />, iconClass: "text-[#8B5CF6]" },
                { platform: 'hackerrank', name: 'HackerRank', icon: <SiHackerrank className="h-4 w-4 text-[#00EA64]" />, iconClass: "text-[#00EA64]" },
              ].map(({ platform, name, icon, iconClass }) => {
                const connection = connections.find((c) => c.platform === platform);
                const isConnected = connection?.status === 'connected';

                return (
                  <li
                    key={platform}
                    className={`flex items-center justify-between rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 transition-all hover:border-brand/40 hover:bg-background/70 ${isConnected ? 'cursor-pointer' : ''}`}
                    onClick={() => isConnected && navigate({ to: `/analytics/${platform}` })}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg border border-border/60 bg-background">
                        {icon}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold leading-tight">
                          {name}
                        </span>
                        {isConnected ? (
                          <span className="block truncate text-[11px] text-muted-foreground">
                            @{connection.username} · Click to view details
                          </span>
                        ) : (
                          <span className="block truncate text-[11px] text-muted-foreground">
                            Not connected
                          </span>
                        )}
                      </span>
                    </span>
                    {isConnected ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          syncPlatform(platform as any);
                        }}
                        disabled={isSyncing}
                        className="flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand hover:bg-brand/20 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        Sync
                      </button>
                    ) : (
                      <RouterLink
                        to="/connections"
                        className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Sparkles className="h-3 w-3" /> Connect
                      </RouterLink>
                    )}
                  </li>
                );
              })}

            </ul>
          </div>
        </div>

        {/* Education */}
        <div id="education" className="scroll-mt-24">
          <RepeaterSection
            title="Education"
            desc="From most recent. Used by the resume builder."
            items={profile.education}
            onChange={setEducation}
            empty={
              {
                id: "",
                school: "",
                degree: "",
                field: "",
                start: "",
                end: "",
                grade: "",
              } as Education
            }
            fields={[
              {
                key: "school",
                label: "School / University *",
                full: true,
                required: true,
              },
              { key: "degree", label: "Degree *", required: true },
              { key: "field", label: "Field of study *", required: true },
              { key: "start", label: "Start (YYYY) *", required: true },
              { key: "end", label: "End (YYYY or Present) *", required: true },
              { key: "grade", label: "Grade / CGPA (optional)", full: true },
            ]}
            schema={educationSchema}
          />
        </div>

        {/* Experience */}
        <div id="experience" className="scroll-mt-24">
          <RepeaterSection
            title="Experience"
            desc="Internships, jobs, freelance."
            items={profile.experience}
            onChange={setExperience}
            empty={
              {
                id: "",
                company: "",
                role: "",
                start: "",
                end: "",
                summary: "",
              } as Experience
            }
            fields={[
              { key: "company", label: "Company *", required: true },
              { key: "role", label: "Role *", required: true },
              { key: "start", label: "Start (MMM YYYY) *", required: true },
              {
                key: "end",
                label: "End (MMM YYYY or Present) *",
                required: true,
              },
              {
                key: "summary",
                label: "Impact — 2 lines with metrics",
                full: true,
                textarea: true,
              },
            ]}
            schema={experienceSchema}
          />
        </div>

        {/* Projects */}
        <RepeaterSection
          title="Projects"
          desc="Ship > everything. Add your best 3–5."
          items={profile.projects}
          onChange={setProjects}
          empty={
            {
              id: "",
              name: "",
              stack: "",
              link: "",
              summary: "",
            } as ProjectItem
          }
          fields={[
            { key: "name", label: "Project name *", required: true },
            {
              key: "stack",
              label: "Stack (comma separated) *",
              required: true,
            },
            { key: "link", label: "Live / Repo link", full: true },
            {
              key: "summary",
              label: "What it does + your role",
              full: true,
              textarea: true,
            },
          ]}
          schema={projectSchema}
        />

        {/* Achievements */}
        <div className="mt-6 rounded-2xl border border-border/70 bg-card p-6 shadow-elegant">
          <SectionHeader
            title="Achievements"
            desc="Hackathons, awards, certifications — one per line."
          />
          <textarea
            value={profile.achievements}
            onChange={(e) => update({ achievements: e.target.value })}
            rows={5}
            maxLength={1200}
            placeholder={
              "• Winner — Smart India Hackathon 2024\n• AWS Certified Cloud Practitioner"
            }
            className="mt-4 w-full rounded-xl border border-border bg-background p-4 text-sm outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <div className="mt-2 text-right text-xs text-muted-foreground">
            {profile.achievements.length}/1200
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-border/60 bg-card/50 p-6 text-center text-sm text-muted-foreground">
          <Sparkles className="mr-1.5 inline h-5 w-5 text-brand" />
          Everything auto-saves locally. Head to{" "}
          <span className="font-semibold text-foreground">
            Build Resume
          </span>{" "}
          once complete.
        </div>
      </section>
    </PageShell>
  );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{desc}</p>
    </div>
  );
}

function TextField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  error?: string;
  maxLength: number;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-muted-foreground">
        {props.label}
      </label>
      <div
        className={`flex h-10 items-center gap-2 rounded-xl border bg-background px-3.5 transition-all focus-within:ring-2 focus-within:ring-brand/20 ${
          props.error
            ? "border-destructive focus-within:border-destructive"
            : "border-border focus-within:border-brand"
        }`}
      >
        {props.icon && (
          <span className="text-muted-foreground">{props.icon}</span>
        )}
        <input
          type={props.type ?? "text"}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          maxLength={props.maxLength}
          placeholder={props.placeholder}
          className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          required={props.required}
        />
      </div>
      {props.error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" /> {props.error}
        </p>
      )}
    </div>
  );
}

function SelectField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-muted-foreground">
        {props.label}
      </label>
      <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3.5 transition-all focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand">
        {props.icon && (
          <span className="text-muted-foreground">{props.icon}</span>
        )}
        <select
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          className="h-full flex-1 cursor-pointer bg-transparent text-sm outline-none"
        >
          {props.options.map((o) => (
            <option key={o} value={o}>
              {o || "Select…"}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

type FieldSpec<T> = {
  key: keyof T;
  label: string;
  full?: boolean;
  textarea?: boolean;
  required?: boolean;
};

function RepeaterSection<T extends { id: string }>(props: {
  title: string;
  desc: string;
  items: T[];
  onChange: (rows: T[]) => void;
  empty: T;
  fields: FieldSpec<T>[];
  schema?: z.ZodSchema<any>;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const add = () =>
    props.onChange([...props.items, { ...props.empty, id: newId() }]);
  const remove = (id: string) => {
    props.onChange(props.items.filter((r) => r.id !== id));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };
  const patch = (id: string, key: keyof T, value: string) => {
    props.onChange(
      props.items.map((r) => (r.id === id ? { ...r, [key]: value.trim() } : r)),
    );
  };

  const validateItem = (item: T, id: string): Record<string, string> => {
    if (!props.schema) return {};
    const parsed = props.schema.safeParse(item);
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        const k = String(i.path[0] ?? "form");
        if (!flat[k]) flat[k] = i.message;
      }
      return flat;
    }
    return {};
  };

  const isSectionValid = props.items.every((item) => {
    const itemErrors = validateItem(item, item.id);
    return Object.keys(itemErrors).length === 0;
  });

  const onSave = async () => {
    if (isSubmitting) return;

    // Validate all items
    const allErrors: Record<string, Record<string, string>> = {};
    let hasErrors = false;

    for (const item of props.items) {
      const itemErrors = validateItem(item, item.id);
      if (Object.keys(itemErrors).length > 0) {
        allErrors[item.id] = itemErrors;
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(allErrors);
      toast.error(
        `Please fix validation errors in ${props.title.toLowerCase()}`,
      );
      return;
    }

    setIsSubmitting(true);
    setSaving(true);
    setErrors({});

    try {
      await new Promise((r) => setTimeout(r, 800));
      setSaved(true);
      toast.success(`${props.title} saved successfully!`);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error(
        `Failed to save ${props.title.toLowerCase()}. Please try again.`,
      );
      console.error("Save error:", error);
    } finally {
      setSaving(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-border/70 bg-card p-6 shadow-elegant">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader title={props.title} desc={props.desc} />
        <button
          type="button"
          onClick={add}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-background px-3.5 text-xs font-semibold transition-all hover:bg-secondary focus:ring-2 focus:ring-brand/20"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {props.items.length === 0 ? (
        <p className="mt-5 rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
          Nothing here yet. Click{" "}
          <span className="font-semibold text-foreground">Add</span> to start.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {props.items.map((row, idx) => (
            <div
              key={row.id}
              className="rounded-xl border border-border/60 bg-secondary/30 p-4 transition-all hover:border-border/80"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => remove(row.id)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive focus:ring-2 focus:ring-destructive/20 rounded-lg px-2 py-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {props.fields.map((f) => (
                  <div
                    key={String(f.key)}
                    className={f.full ? "sm:col-span-2" : ""}
                  >
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">
                      {f.label}
                    </label>
                    {f.textarea ? (
                      <textarea
                        value={String(row[f.key] ?? "")}
                        onChange={(e) => patch(row.id, f.key, e.target.value)}
                        rows={3}
                        maxLength={500}
                        className={`w-full rounded-xl border bg-background p-3 text-sm outline-none transition-all focus:ring-2 focus:ring-brand/20 ${
                          errors[row.id]?.[String(f.key)]
                            ? "border-destructive focus:border-destructive"
                            : "border-border focus:border-brand"
                        }`}
                      />
                    ) : (
                      <input
                        value={String(row[f.key] ?? "")}
                        onChange={(e) => patch(row.id, f.key, e.target.value)}
                        maxLength={200}
                        required={f.required}
                        className={`h-10 w-full rounded-xl border bg-background px-3.5 text-sm outline-none transition-all focus:ring-2 focus:ring-brand/20 ${
                          errors[row.id]?.[String(f.key)]
                            ? "border-destructive focus:border-destructive"
                            : "border-border focus:border-brand"
                        }`}
                      />
                    )}
                    {errors[row.id]?.[String(f.key)] && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                        <AlertCircle className="h-3 w-3" />{" "}
                        {errors[row.id][String(f.key)]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {props.items.length > 0 && (
        <div className="mt-5 flex items-center justify-end gap-3">
          {saved && !saving && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand animate-fade-up">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !isSectionValid}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-brand px-4 text-xs font-semibold text-brand-foreground shadow-elegant transition-all hover:opacity-90 focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving…
              </>
            ) : (
              <>Save {props.title.toLowerCase()}</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
