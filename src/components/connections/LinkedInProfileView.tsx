import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Award,
  Users,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { usePlatformStore } from "@/lib/platform-store";
import { toast } from "sonner";

export function LinkedInProfileView() {
  const { user } = useAuth();
  const { profile: userProfile } = useProfile();
  const { linkedin, linkedinData, syncLinkedIn, isSyncing } = usePlatformStore();
  const [activeTab, setActiveTab] = useState<"overview" | "experience" | "education">("overview");
  const [avatarError, setAvatarError] = useState(false);

  const formatLastSynced = (date: string | null) => {
    if (!date) return "Never";
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const handleSync = async () => {
    if (!user?.id) return;
    try {
      toast.info("Syncing LinkedIn profile data...");
      await syncLinkedIn(user.id);
      toast.success("LinkedIn profile synced successfully!");
    } catch (err: any) {
      toast.error(`Sync failed: ${err?.message || "Please try again"}`);
    }
  };

  if (!linkedin.connected || !linkedinData) {
    return (
      <div className="min-h-screen bg-background text-foreground pb-20">
        <div className="mx-auto max-w-6xl px-6 pt-10">
          <Link
            to="/connections"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Career Identity
          </Link>
          <div className="glass rounded-3xl p-12 text-center border border-border/60 max-w-xl mx-auto">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-background border border-border shadow-md mb-4">
              <FaLinkedin className="h-8 w-8 text-[#0A66C2]" />
            </div>
            <h2 className="text-xl font-bold">LinkedIn Account Not Connected</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Connect your LinkedIn profile URL or handle to bring professional credentials, verified skills, and network telemetry into SkillVerse.
            </p>
            <Link
              to="/connections"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A66C2] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Connect LinkedIn
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const profile = linkedinData.profile || {};
  const experiences = linkedinData.experience || [];
  const education = linkedinData.education || [];
  const skills = linkedinData.skills || [];

  // Real User Telemetry
  const displayName = userProfile?.fullName || user?.name || profile.name || linkedin.username;
  const headlineText = userProfile?.headline || profile.headline || userProfile?.role || "";
  const locationText = userProfile?.location || profile.location || "";
  const aboutText = userProfile?.summary || profile.about || "";
  
  const skillsList = userProfile?.skills
    ? userProfile.skills.split(",").map((s) => s.trim()).filter(Boolean)
    : (skills || []);

  const realExperiences =
    Array.isArray(userProfile?.experience) && userProfile.experience.length > 0
      ? userProfile.experience.map((e) => ({
          title: e.role,
          company: e.company,
          duration: `${e.start || ""} ${e.start && e.end ? "-" : ""} ${e.end || ""}`.trim() || "Present",
          description: e.summary,
        }))
      : (experiences || []);

  const realEducation =
    Array.isArray(userProfile?.education) && userProfile.education.length > 0
      ? userProfile.education.map((e) => ({
          institution: e.school,
          degree: `${e.degree || ""} ${e.field ? `in ${e.field}` : ""}`.trim(),
          years: `${e.start || ""} ${e.start && e.end ? "-" : ""} ${e.end || ""}`.trim(),
        }))
      : (education || []);

  const profileLink = profile.profileUrl || `https://www.linkedin.com/in/${linkedin.username}`;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-hero border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-20 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#0A66C2]/15 blur-[120px] animate-pulse-glow" />
        </div>

        <div className="mx-auto max-w-6xl px-6 pt-8 pb-8">
          <Link
            to="/connections"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Career Identity
          </Link>

          {/* Profile Header Card */}
          <div className="glass rounded-3xl p-6 sm:p-8 border border-border/60 shadow-elegant relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                {!avatarError && profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={displayName}
                    onError={() => setAvatarError(true)}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-border shadow-md object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-20 sm:h-24 sm:w-24 shrink-0 place-items-center rounded-2xl bg-[#0A66C2]/10 border-2 border-[#0A66C2]/30 text-3xl font-extrabold text-[#0A66C2]">
                    {(displayName || "M").charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {displayName}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-[#0A66C2]">
                    in/{linkedin.username}
                  </p>

                  {headlineText && (
                    <p className="text-xs sm:text-sm font-medium text-foreground max-w-xl leading-relaxed">
                      {headlineText}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                    {locationText && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {locationText}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-[#0A66C2]" /> {linkedinData.connections ? `${linkedinData.connections}+ connections` : "Profile Connected"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                      <Clock className="h-3.5 w-3.5" /> Last synced: {formatLastSynced(linkedin.lastSynced)}
                    </span>
                  </div>
                </div>
              </div>

              {/* External Actions */}
              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                <a
                  href={profileLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#0A66C2]/40 bg-[#0A66C2]/10 px-4 py-2 text-xs font-bold text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all shadow-2xs"
                >
                  View on LinkedIn <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="relative group overflow-hidden inline-flex items-center gap-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#0A66C2]/90 px-4 py-2 text-xs font-extrabold text-white shadow-md transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Syncing..." : "Sync Profile"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 pt-8">
        {/* High-Value 4-Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="glass rounded-2xl p-5 border border-border/60 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] mb-2">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{linkedinData.connections ? `${linkedinData.connections}+` : "Connected"}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">{linkedinData.connections ? "Connections" : "Profile Status"}</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-border/60 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-2">
              <Award className="h-5 w-5" />
            </div>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">Verified</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Industry Credential</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-border/60 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-500 mb-2">
              <Briefcase className="h-5 w-5" />
            </div>
            <p className="text-lg font-extrabold text-foreground truncate px-1">
              {realExperiences[0]?.title || userProfile?.role || "Developer"}
            </p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Primary Role</p>
          </div>

          <div className="glass rounded-2xl p-5 border border-border/60 text-center">
            <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-amber-500/10 text-amber-500 mb-2">
              <GraduationCap className="h-5 w-5" />
            </div>
            <p className="text-2xl font-extrabold text-foreground">{skillsList.length}</p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">Endorsed Skills</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border/60 mb-6 gap-2">
          {(["overview", "experience", "education"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-bold capitalize transition-colors relative ${
                activeTab === tab ? "text-[#0A66C2] border-b-2 border-[#0A66C2]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {aboutText && (
              <div className="glass rounded-3xl p-6 border border-border/60 space-y-2">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#0A66C2]" /> Summary & Professional About
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{aboutText}</p>
              </div>
            )}

            {skillsList.length > 0 && (
              <div className="glass rounded-3xl p-6 border border-border/60 space-y-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#0A66C2]" /> Endorsed Skills & Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill: string) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-full border border border-[#0A66C2]/30 bg-[#0A66C2]/10 px-3.5 py-1 text-xs font-bold text-[#0A66C2] shadow-2xs"
                    >
                      <CheckCircle className="h-3 w-3" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "experience" && (
          <div className="glass rounded-3xl p-6 border border-border/60 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#0A66C2]" /> Work Experience
            </h3>
            {realExperiences.length > 0 ? (
              <div className="space-y-4">
                {realExperiences.map((exp: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{exp.title}</h4>
                    <p className="text-xs font-semibold text-[#0A66C2]">{exp.company}</p>
                    {exp.duration && <p className="text-[11px] text-muted-foreground">{exp.duration}</p>}
                    {exp.description && <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No work experience logged.</p>
            )}
          </div>
        )}

        {activeTab === "education" && (
          <div className="glass rounded-3xl p-6 border border-border/60 space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#0A66C2]" /> Education History
            </h3>
            {realEducation.length > 0 ? (
              <div className="space-y-4">
                {realEducation.map((edu: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{edu.institution}</h4>
                    {edu.degree && <p className="text-xs font-semibold text-muted-foreground">{edu.degree}</p>}
                    {edu.years && <p className="text-[11px] text-muted-foreground">{edu.years}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No education details logged.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
