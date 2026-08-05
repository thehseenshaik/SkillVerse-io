import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  Code2,
  FileText,
  Github,
  LayoutDashboard,
  Linkedin,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  UserCircle2,
  Zap,
} from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/SiteChrome";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillVerse — Your Complete Career Operating System" },
      {
        name: "description",
        content:
          "SkillVerse unifies LinkedIn, GitHub, LeetCode, resumes, courses and interviews into one AI-powered career dashboard.",
      },
      {
        property: "og:title",
        content: "SkillVerse — Your Complete Career Operating System",
      },
      {
        property: "og:description",
        content:
          "One profile. One dashboard. One career platform. Track everything and get placement-ready with AI.",
      },
    ],
  }),
  component: IndexRedirect,
});

function IndexRedirect() {
  const { isAuthenticated, hydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [hydrated, isAuthenticated, navigate]);

  // Show landing page while hydrating or if not authenticated
  if (!hydrated || !isAuthenticated) {
    return <Landing />;
  }

  return null;
}

const platforms = [
  { name: "LinkedIn", icon: Linkedin },
  { name: "GitHub", icon: Github },
  { name: "LeetCode", icon: Code2 },
  { name: "GeeksforGeeks", icon: Code2 },
  { name: "HackerRank", icon: Trophy },
  { name: "CodeChef", icon: Code2 },
  { name: "Codeforces", icon: Trophy },
  { name: "Kaggle", icon: Brain },
  { name: "Behance", icon: Sparkles },
  { name: "Dribbble", icon: Sparkles },
];

const features = [
  {
    icon: LayoutDashboard,
    title: "Career Command Center",
    desc: "AI Career Score, streaks, insights, deadlines and today's goals — all in one clean dashboard.",
  },
  {
    icon: UserCircle2,
    title: "Digital Career Identity",
    desc: "A single professional profile that recruiters understand in minutes. Skills, projects, resume — beautifully organized.",
  },
  {
    icon: Briefcase,
    title: "Career Hub",
    desc: "AI-matched jobs, internships, courses, roadmaps and certifications — no more juggling ten tabs.",
  },
  {
    icon: Brain,
    title: "AI Career Assistant",
    desc: "Resume review, ATS analysis, cover letters, mock interviews and skill-gap plans on demand.",
  },
  {
    icon: Target,
    title: "Company Skill Match",
    desc: "Compare yourself with Google, Microsoft, Amazon and more. See what to learn to close the gap.",
  },
  {
    icon: Rocket,
    title: "Practice & Interviews",
    desc: "Timed tests, DSA, aptitude, and AI mock interviews with scores for confidence, communication and technicals.",
  },
];

function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <SiteNav />

      {/* HERO */}
      <section
        id="top"
        className="relative overflow-hidden pt-40 pb-24 bg-hero"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-24 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px] animate-pulse-glow" />
        </div>
        <div className="mx-auto max-w-5xl px-6 text-center animate-fade-up">
          <div className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse-glow" />
            The Career Operating System — now in beta
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            One profile. <span className="text-gradient">One dashboard.</span>
            <br className="hidden sm:block" /> Your entire career.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            SkillVerse connects LinkedIn, GitHub, LeetCode, your resume and more
            — then uses AI to guide you from student to placement-ready.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-brand-gradient px-6 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03]"
            >
              Start free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="glass inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-foreground transition-transform hover:scale-[1.02]"
            >
              See how it works
            </a>
          </div>

          {/* Preview card */}
          <div className="relative mx-auto mt-20 max-w-4xl animate-float">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-gradient opacity-20 blur-2xl" />
            <div className="glass overflow-hidden rounded-3xl p-4 shadow-elegant md:p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="glass rounded-2xl p-5 text-left">
                  <div className="text-xs font-medium text-muted-foreground">
                    AI Career Score
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gradient">
                      84
                    </span>
                    <span className="text-sm text-muted-foreground">/100</span>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-[84%] bg-brand-gradient" />
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    +6 this week
                  </div>
                </div>
                <div className="glass rounded-2xl p-5 text-left">
                  <div className="text-xs font-medium text-muted-foreground">
                    Coding streak
                  </div>
                  <div className="mt-2 text-4xl font-extrabold">
                    42
                    <span className="text-base font-semibold text-muted-foreground">
                      {" "}
                      days
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-7 gap-1">
                    {Array.from({ length: 21 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-4 rounded-sm"
                        style={{
                          backgroundColor:
                            i % 3 === 0
                              ? "var(--brand-glow)"
                              : i % 2 === 0
                                ? "var(--brand)"
                                : "var(--muted)",
                          opacity: i % 5 === 0 ? 0.5 : 1,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="glass rounded-2xl p-5 text-left">
                  <div className="text-xs font-medium text-muted-foreground">
                    Today's focus
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-brand" /> 2 DSA
                      problems
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-brand" /> Resume ATS
                      review
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <span className="h-4 w-4 rounded-full border" /> Mock HR
                      interview
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORMS */}
      <section id="platforms" className="border-y border-border/60 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Connect everything you already use
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {platforms.map(({ name, icon: Icon }) => (
              <div
                key={name}
                className="glass flex items-center gap-3 rounded-2xl px-4 py-3 shadow-elegant transition-transform hover:-translate-y-0.5"
              >
                <Icon className="h-5 w-5 text-brand" />
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              Everything you need.{" "}
              <span className="text-gradient">Nothing you don't.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Six connected surfaces that replace a dozen tabs — from career
              score to interviews.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group glass relative rounded-3xl p-6 shadow-elegant transition-all hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAREER SCORE */}
      <section id="score" className="py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-brand" /> AI Career Score
            </div>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              A single number that tells you{" "}
              <span className="text-gradient">what to do next.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              We analyze your resume, GitHub, coding profiles, projects,
              certificates, mock interviews and consistency — then hand you a
              personalized plan.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Add a backend project to strengthen your portfolio",
                "Improve resume — 3 ATS keywords missing",
                "Complete SQL certification",
                "Increase GitHub activity to 5 commits / week",
              ].map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
                  <span className="text-foreground/90">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-gradient opacity-20 blur-3xl" />
            <div className="glass rounded-3xl p-8 shadow-elegant">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">
                    Your score
                  </div>
                  <div className="mt-1 text-6xl font-extrabold text-gradient">
                    84
                  </div>
                </div>
                <div className="glass grid h-16 w-16 place-items-center rounded-full">
                  <Trophy className="h-6 w-6 text-brand" />
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { label: "Resume", v: 78 },
                  { label: "GitHub activity", v: 88 },
                  { label: "DSA / Coding", v: 82 },
                  { label: "Interview readiness", v: 74 },
                ].map(({ label, v }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-brand-gradient"
                        style={{ width: `${v}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLOW */}
      <section id="flow" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
              From sign up to <span className="text-gradient">placed</span>.
            </h2>
            <p className="mt-4 text-muted-foreground">
              A guided journey — not another empty dashboard.
            </p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-4">
            {[
              {
                icon: UserCircle2,
                t: "Build profile",
                d: "Import from LinkedIn & GitHub in seconds.",
              },
              {
                icon: FileText,
                t: "Upload resume",
                d: "AI scores it, rewrites weak sections, checks ATS.",
              },
              {
                icon: Rocket,
                t: "Practice daily",
                d: "DSA, aptitude and mock interviews with AI feedback.",
              },
              {
                icon: Briefcase,
                t: "Apply & land it",
                d: "AI-matched jobs, cover letters and skill-gap plans.",
              },
            ].map(({ icon: Icon, t, d }, i) => (
              <div
                key={t}
                className="glass relative rounded-3xl p-6 shadow-elegant"
              >
                <div className="text-xs font-semibold text-brand">
                  STEP {i + 1}
                </div>
                <Icon className="mt-4 h-6 w-6 text-foreground" />
                <div className="mt-4 text-base font-semibold">{t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="px-6 py-28">
        <div className="relative isolate mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-brand-gradient p-12 text-center shadow-glow">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-hero opacity-40 mix-blend-overlay" />
          <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Your career, finally in one place.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Join thousands of students turning scattered profiles into a
            placement-ready career story.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-foreground shadow-elegant transition-transform hover:scale-[1.03]"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Explore features
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
