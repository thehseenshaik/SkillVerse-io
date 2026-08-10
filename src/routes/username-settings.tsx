import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { UsernameManagerCard } from "@/components/profile/UsernameManagerCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AtSign,
  ShieldCheck,
  Globe,
  Share2,
  Sparkles,
  ExternalLink,
  Lock,
  Zap,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/username-settings")({
  head: () => ({
    meta: [
      { title: "Developer Handle & Public URL — SkillVerse" },
      {
        name: "description",
        content: "Claim and manage your unique SkillVerse developer handle and public portfolio URL.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <UsernameSettingsPage />
    </AuthGate>
  ),
});

function UsernameSettingsPage() {
  return (
    <PageShell>
      {/* Hero Section matching Dashboard & Analytics */}
      <section className="relative overflow-hidden border-b border-border/60 bg-hero py-10 md:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.65_0.22_35/0.14),transparent)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.72_0.22_38/0.18),transparent)] pointer-events-none" />
        
        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold tracking-wider uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
                VANITY HANDLE ENGINE
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                Developer Handle & <span className="text-gradient">Public URL</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Configure your permanent public identifier on SkillVerse. Your handle powers your live public portfolio, recruiter snapshots, and ATS resume links.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="outline"
                className="h-11 px-5 rounded-xl border-border/80 font-bold gap-2"
              >
                <Link to="/profile">
                  View Profile Settings
                </Link>
              </Button>
              <Button
                asChild
                className="h-11 px-5 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold gap-2 shadow-xs shadow-brand/20"
              >
                <Link to="/dashboard">
                  Dashboard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Core Username Manager Card */}
        <UsernameManagerCard />

        {/* Feature Grid: What Your Handle Unlocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs relative overflow-hidden space-y-3">
            <div className="h-11 w-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Globe className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold tracking-tight text-foreground">
              Public Developer Portfolio
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Anyone with your link can view your verified GitHub stats, LeetCode ratings, GFG rank, and project showcase in real time.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs relative overflow-hidden space-y-3">
            <div className="h-11 w-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Zap className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold tracking-tight text-foreground">
              1-Click Recruiter Mode
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Recruiters can download your ATS-ready resume PDF, inspect your verified problem-solving telemetry, and contact you directly.
            </p>
          </Card>

          <Card className="p-6 rounded-3xl border border-border/70 bg-card shadow-xs relative overflow-hidden space-y-3">
            <div className="h-11 w-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="text-lg font-bold tracking-tight text-foreground">
              Permanent Identity Lock
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Once claimed, your handle is atomically reserved in our global registry and cannot be claimed by any other user.
            </p>
          </Card>
        </div>

        {/* Handle Guidelines */}
        <Card className="p-6 sm:p-7 rounded-3xl border border-border/70 bg-card shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <ShieldCheck className="h-4 w-4 text-brand" />
            Handle & Vanity URL Guidelines
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-start gap-2.5">
              <span className="text-brand font-bold">●</span>
              <span>Length must be between <strong>3 and 30 characters</strong>.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-brand font-bold">●</span>
              <span>Only alphanumeric characters, hyphens (<code>-</code>), and underscores (<code>_</code>) are allowed.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-brand font-bold">●</span>
              <span>System names (e.g., <code>admin</code>, <code>api</code>, <code>dashboard</code>) are reserved.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-brand font-bold">●</span>
              <span>Your public profile respects your privacy settings configured in your Profile Settings.</span>
            </div>
          </div>
        </Card>
      </main>
    </PageShell>
  );
}
