import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  MapPin,
  Mail,
  Linkedin,
  Github,
  Twitter,
  Globe,
  Download,
  Share2,
  Calendar,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { usernameService } from "@/lib/services/username-service";
import { doc, getDoc } from "firebase/firestore";
import { fbDb } from "@/lib/firebase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const db = fbDb();

export const Route = createFileRoute("/u/$username")({
  head: () => ({
    meta: [
      { title: "Profile — SkillVerse" },
      {
        name: "description",
        content: "View professional profile on SkillVerse.",
      },
    ],
  }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const params = Route.useParams() as { username: string };
  const username = params.username;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const userId = await usernameService.getUserIdByUsername(username);
      if (!userId) {
        setLoading(false);
        return;
      }

      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const merged = {
          ...data,
          ...(data.basicInfo || {}),
          ...(data.profile || {}),
          displayName: data.profile?.displayName || data.basicInfo?.displayName || data.displayName || data.fullName || username,
          headline: data.profile?.headline || data.basicInfo?.headline || data.headline || "Software Engineer",
          location: data.profile?.location || data.basicInfo?.location || data.location || "",
          about: data.profile?.summary || data.summary || data.about || "",
          skills: Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : (data.profile?.skills ? (Array.isArray(data.profile.skills) ? data.profile.skills : data.profile.skills.split(',').map((s: string) => s.trim()).filter(Boolean)) : [])),
          avatarUrl: data.avatarUrl || data.photoURL || data.basicInfo?.avatarUrl || data.profile?.avatarUrl,
        };
        setProfile(merged);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md space-y-4">
          <div className="h-16 w-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">Profile Not Found</h1>
          <p className="text-muted-foreground text-sm">
            The developer handle <strong>@{username}</strong> doesn't exist or is set to private.
          </p>
          <Button asChild className="rounded-xl bg-brand text-white font-bold">
            <a href="/">Explore SkillVerse</a>
          </Button>
        </div>
      </div>
    );
  }

  const privacy = profile.privacy || {};
  const showEmail = privacy.showEmail !== false;
  const showLocation = privacy.showLocation !== false;
  const showProjects = privacy.showProjects !== false;
  const showAchievements = privacy.showAchievements !== false;
  const showCodingStats = privacy.showCodingStats !== false;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border/60 bg-hero py-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.65_0.22_35/0.14),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.72_0.22_38/0.18),transparent)] pointer-events-none" />
        
        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            {/* Profile Avatar */}
            <div className="flex-shrink-0 relative">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl object-cover border-2 border-border/80 shadow-lg"
                />
              ) : (
                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-gradient-to-br from-brand to-brand/70 flex items-center justify-center text-4xl font-extrabold text-white shadow-lg">
                  {profile.displayName?.charAt(0).toUpperCase() || username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-mono text-[10px] font-bold shadow-xs">
                PRO
              </span>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand uppercase tracking-wider mb-1">
                    <span>@{username}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                    {profile.displayName}
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground font-medium mt-1">
                    {profile.headline}
                  </p>
                  {showLocation && profile.location && (
                    <p className="mt-2 text-xs sm:text-sm text-muted-foreground flex items-center justify-center md:justify-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-brand" />
                      {profile.location}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="h-10 px-4 rounded-xl border-border/80 font-bold gap-2 hover:border-brand/40"
                  >
                    <Share2 className="h-4 w-4 text-brand" />
                    Share Profile
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="h-10 px-4 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold gap-2 shadow-xs shadow-brand/20"
                  >
                    <a href="/resume">
                      <Download className="h-4 w-4" />
                      ATS Resume
                    </a>
                  </Button>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-4 flex gap-3">
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand">
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {profile.twitter && (
                  <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand">
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-brand">
                    <Globe className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {profile.about && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-muted-foreground">{profile.about}</p>
              </Card>
            )}

            {/* Experience */}
            {profile.experience && profile.experience.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experience
                </h2>
                <div className="space-y-4">
                  {profile.experience.map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-border pl-4">
                      <h3 className="font-semibold">{exp.role}</h3>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {exp.startDate} - {exp.endDate || "Present"}
                      </p>
                      {exp.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Projects */}
            {showProjects && profile.projects && profile.projects.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Projects
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {profile.projects.map((project: any, index: number) => (
                    <div key={index} className="border border-border/60 rounded-lg p-4">
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                      {project.technologies && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.technologies.map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Education */}
            {profile.education && profile.education.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </h2>
                <div className="space-y-4">
                  {profile.education.map((edu: any, index: number) => (
                    <div key={index} className="border-l-2 border-border pl-4">
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {edu.year}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Achievements */}
            {showAchievements && profile.achievements && profile.achievements.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </h2>
                <div className="grid gap-3">
                  {profile.achievements.map((achievement: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Award className="h-5 w-5 text-brand flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Contact</h2>
              <div className="space-y-3">
                {showEmail && profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </a>
                )}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand">
                    <Globe className="h-4 w-4" />
                    {profile.website}
                  </a>
                )}
              </div>
            </Card>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Coding Stats */}
            {showCodingStats && profile.codingStats && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Coding Statistics
                </h2>
                <div className="space-y-3">
                  {profile.codingStats.github && (
                    <div>
                      <p className="text-sm text-muted-foreground">GitHub</p>
                      <p className="font-semibold">{profile.codingStats.github.repositories} repositories</p>
                      <Progress value={profile.codingStats.github.contributions || 0} className="mt-1" />
                    </div>
                  )}
                  {profile.codingStats.leetcode && (
                    <div>
                      <p className="text-sm text-muted-foreground">LeetCode</p>
                      <p className="font-semibold">{profile.codingStats.leetcode.problemsSolved} problems solved</p>
                      <Progress value={(profile.codingStats.leetcode.problemsSolved / 1000) * 100} className="mt-1" />
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* AI Career Score */}
            {profile.aiCareerScore && (
              <Card className="p-6 bg-gradient-to-br from-brand/10 to-brand/5">
                <h2 className="text-lg font-semibold mb-4">AI Career Score</h2>
                <div className="text-center">
                  <p className="text-4xl font-bold text-brand">{profile.aiCareerScore.overall || 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">Overall Score</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Powered by <a href="https://skillverse.io" className="text-brand hover:underline">SkillVerse</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
