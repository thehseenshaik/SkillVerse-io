import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Briefcase,
  Code,
  Award,
  TrendingUp,
  Download,
  Copy,
  Mail,
  Linkedin,
  Github,
  Calendar,
  MapPin,
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

export const Route = createFileRoute("/u/$username/recruiter")({
  head: () => ({
    meta: [
      { title: "Recruiter View — SkillVerse" },
      {
        name: "description",
        content: "Recruiter-friendly profile view.",
      },
    ],
  }),
  component: RecruiterViewPage,
});

function RecruiterViewPage() {
  const { username } = Route.useParams() as { username: string };
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
        setProfile(userDoc.data());
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyProfileLink = () => {
    const link = `${window.location.origin}/u/${username}`;
    navigator.clipboard.writeText(link);
    toast.success("Profile link copied");
  };

  const handleDownloadResume = () => {
    toast.success("Resume download started");
  };

  const handleContact = () => {
    if (profile?.email) {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground">This profile may be private or doesn't exist.</p>
        </div>
      </div>
    );
  }

  const privacy = profile.privacy || {};
  const showExperience = privacy.showExperience !== false;
  const showProjects = privacy.showProjects !== false;
  const showAchievements = privacy.showAchievements !== false;
  const showCodingStats = privacy.showCodingStats !== false;
  const recruiterVisibility = privacy.recruiterVisibility !== false;

  if (!recruiterVisibility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Profile Not Available</h1>
          <p className="text-muted-foreground">This profile is not visible to recruiters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-brand/10 to-brand/5 border-b">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Recruiter View</h1>
              <p className="text-sm text-muted-foreground">Optimized for hiring managers</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopyProfileLink} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <Button onClick={handleDownloadResume} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Resume
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Quick Summary */}
        <Card className="mb-8 p-6 bg-gradient-to-br from-brand/10 to-brand/5">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand">{profile.experience?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Years Experience</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-brand">{profile.projects?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Projects</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-brand">{profile.skills?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Skills</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-brand">{profile.achievements?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Achievements</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience */}
            {showExperience && profile.experience && profile.experience.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Experience
                </h2>
                <div className="space-y-4">
                  {profile.experience.map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-brand pl-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{exp.title || exp.role}</h3>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                        <Badge variant="secondary">
                          {exp.startDate} - {exp.endDate || "Present"}
                        </Badge>
                      </div>
                      {exp.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
                      )}
                      {exp.technologies && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {exp.technologies.map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="outline" className="text-xs">
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
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{project.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                        </div>
                        {project.stars && (
                          <Badge variant="secondary">⭐ {project.stars}</Badge>
                        )}
                      </div>
                      {project.technologies && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {project.technologies.map((tech: string, techIndex: number) => (
                            <Badge key={techIndex} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {project.repository && (
                        <a
                          href={project.repository}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 text-sm text-brand hover:underline block"
                        >
                          View Repository
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Skills</h2>
                <div className="space-y-4">
                  {profile.skills.slice(0, 10).map((skill: any, index: number) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{skill.name || skill}</span>
                        <span className="text-xs text-muted-foreground">{skill.proficiency || 80}%</span>
                      </div>
                      <Progress value={skill.proficiency || 80} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                {profile.email && (
                  <Button onClick={handleContact} className="w-full justify-start" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    {profile.email}
                  </Button>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </div>
                )}
              </div>
            </Card>

            {/* Achievements */}
            {showAchievements && profile.achievements && profile.achievements.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </h2>
                <div className="space-y-3">
                  {profile.achievements.slice(0, 5).map((achievement: any, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Award className="h-4 w-4 text-brand flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-sm">{achievement.title}</h3>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Coding Statistics */}
            {showCodingStats && profile.codingStats && profile.codingStats.length > 0 && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Coding Statistics
                </h2>
                <div className="space-y-3">
                  {profile.codingStats.map((stat: any, index: number) => (
                    <div key={index} className="border border-border/60 rounded-lg p-3">
                      <h3 className="font-semibold text-sm capitalize">{stat.platform}</h3>
                      <p className="text-xs text-muted-foreground">Username: {stat.username}</p>
                      {stat.problemsSolved && (
                        <p className="text-xs text-muted-foreground">Problems Solved: {stat.problemsSolved}</p>
                      )}
                      {stat.rating && (
                        <p className="text-xs text-muted-foreground">Rating: {stat.rating}</p>
                      )}
                    </div>
                  ))}
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
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>ATS Score</span>
                    <span className="font-semibold">{profile.aiCareerScore.atsScore || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Skill Score</span>
                    <span className="font-semibold">{profile.aiCareerScore.skillScore || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Employability</span>
                    <span className="font-semibold">{profile.aiCareerScore.employability || 0}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Button onClick={handleContact} className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Candidate
                </Button>
                <Button onClick={handleDownloadResume} variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Resume
                </Button>
                <Button onClick={handleCopyProfileLink} variant="outline" className="w-full">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Profile Link
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
