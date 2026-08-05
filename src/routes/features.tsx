import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Rocket,
  Target,
  Trophy,
  UserCircle2,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — SkillVerse Career OS" },
      {
        name: "description",
        content:
          "Explore every surface of SkillVerse — dashboard, career hub, AI assistant, practice, mock interviews and more.",
      },
      { property: "og:title", content: "Features — SkillVerse Career OS" },
      {
        property: "og:description",
        content:
          "Every tool a student needs to go from scattered profiles to placement-ready, in one platform.",
      },
    ],
  }),
  component: FeaturesPage,
});

const surfaces = [
  {
    icon: LayoutDashboard,
    title: "Career Command Center",
    desc: "Your daily home. AI Career Score, weekly streaks, deadlines, today's focus and personalized insights.",
    bullets: [
      "Live Career Score",
      "Streaks & consistency graph",
      "Smart deadlines",
      "Today's 3 goals",
    ],
  },
  {
    icon: UserCircle2,
    title: "Digital Career Identity",
    desc: "One profile that replaces ten links. Auto-synced from LinkedIn, GitHub and coding platforms.",
    bullets: [
      "Public shareable profile",
      "Skills verified via activity",
      "Project showcase",
      "Recruiter-friendly view",
    ],
  },
  {
    icon: Briefcase,
    title: "Career Hub",
    desc: "AI-matched jobs, internships, courses, roadmaps and certifications in one searchable feed.",
    bullets: [
      "Match score per role",
      "Course & roadmap library",
      "Saved & applied tracker",
      "Weekly opportunity digest",
    ],
  },
  {
    icon: Brain,
    title: "AI Career Assistant",
    desc: "A career coach in your pocket — resume review, ATS scoring, cover letters, and skill-gap plans on demand.",
    bullets: [
      "Resume rewrite",
      "ATS keyword analysis",
      "Cover letter generator",
      "Personalized 30-day plan",
    ],
  },
  {
    icon: Target,
    title: "Company Skill Match",
    desc: "Benchmark yourself against Google, Microsoft, Amazon and hundreds more. See exactly what to learn next.",
    bullets: [
      "Company skill maps",
      "Gap breakdown",
      "Recommended prep",
      "Progress tracking",
    ],
  },
  {
    icon: Rocket,
    title: "Practice & Interviews",
    desc: "Timed tests, DSA, aptitude and AI mock interviews with scores for confidence, communication and technicals.",
    bullets: [
      "Adaptive DSA sets",
      "Aptitude drills",
      "AI mock interviews",
      "Detailed feedback report",
    ],
  },
  {
    icon: FileText,
    title: "Resume & Portfolio Builder",
    desc: "Beautiful, ATS-safe resumes and a live portfolio site — generated from your profile, updated automatically.",
    bullets: [
      "ATS-optimized templates",
      "One-click portfolio site",
      "Version history",
      "Recruiter share link",
    ],
  },
  {
    icon: Trophy,
    title: "Achievements & Leaderboards",
    desc: "Turn effort into momentum. Earn badges, climb weekly leaderboards, and unlock milestone rewards.",
    bullets: [
      "Skill badges",
      "Weekly leaderboards",
      "Milestone rewards",
      "College & peer groups",
    ],
  },
];

function FeaturesPage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-hero pt-24 pb-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-5xl px-6 text-center animate-fade-up">
          <div className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            Features
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Eight surfaces.{" "}
            <span className="text-gradient">One career OS.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            SkillVerse replaces the twelve tabs students juggle every day with a
            single, connected workspace.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-5 px-6 md:grid-cols-2">
          {surfaces.map(({ icon: Icon, title, desc, bullets }) => (
            <div
              key={title}
              className="glass rounded-3xl p-7 shadow-elegant transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {desc}
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                    <span className="text-foreground/90">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] p-12 text-center shadow-glow">
          <div className="absolute inset-0 -z-10 bg-brand-gradient opacity-95" />
          <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Ready to try the whole thing?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Free forever for students. Upgrade only when you need advanced AI
            coaching.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-foreground shadow-elegant transition-transform hover:scale-[1.03]"
            >
              See pricing <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/practice"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Explore practice
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
