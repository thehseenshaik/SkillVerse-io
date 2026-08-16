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
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";

export function LinkedInProfileView() {
  const { user } = useAuth();
  const { linkedin, linkedinData } = usePlatformStore();
  const [activeTab, setActiveTab] = useState<"overview" | "experience" | "education">("overview");

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
              Connect your LinkedIn profile to bring professional work experience, headline, and network connections into SkillVerse.
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
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name || linkedin.username || "LinkedIn Photo"}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-2 border-border shadow-md object-cover"
                  />
                ) : (
                  <div className="grid h-20 w-20 sm:h-24 sm:w-24 shrink-0 place-items-center rounded-2xl bg-background border border-border text-2xl font-black text-[#0A66C2]">
                    <FaLinkedin className="h-10 w-10 text-[#0A66C2]" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                      {profile.name || linkedin.username}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                  </div>

                  {profile.headline && (
                    <p className="text-xs sm:text-sm font-medium text-foreground max-w-xl leading-relaxed">
                      {profile.headline}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap pt-1">
                    {profile.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {profile.location}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {linkedinData.connections || 500}+ connections
                    </span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground/80">
                      <Clock className="h-3.5 w-3.5" /> Last synced: {formatLastSynced(linkedin.lastSynced)}
                    </span>
                  </div>
                </div>
              </div>

              {/* External Action */}
              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                {profile.profileUrl && (
                  <a
                    href={profile.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-background/80 px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
                  >
                    View on LinkedIn <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 pt-8">
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
            {profile.about && (
              <div className="glass rounded-3xl p-6 border border-border/60 space-y-2">
                <h3 className="text-base font-bold">About</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{profile.about}</p>
              </div>
            )}

            {skills.length > 0 && (
              <div className="glass rounded-3xl p-6 border border-border/60 space-y-3">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#0A66C2]" /> Endorsed Skills & Competencies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground shadow-2xs"
                    >
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
            {experiences.length > 0 ? (
              <div className="space-y-4">
                {experiences.map((exp: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{exp.title}</h4>
                    <p className="text-xs font-semibold text-[#0A66C2]">{exp.company}</p>
                    <p className="text-[11px] text-muted-foreground">{exp.duration}</p>
                    {exp.description && <p className="text-xs text-muted-foreground mt-2">{exp.description}</p>}
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
            {education.length > 0 ? (
              <div className="space-y-4">
                {education.map((edu: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl border border-border/60 bg-card/40 space-y-1">
                    <h4 className="font-bold text-sm text-foreground">{edu.institution}</h4>
                    <p className="text-xs font-semibold text-muted-foreground">{edu.degree}</p>
                    <p className="text-[11px] text-muted-foreground">{edu.years}</p>
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
