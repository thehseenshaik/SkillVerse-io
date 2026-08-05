import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileText, Sparkles, Wand2 } from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";

export const Route = createFileRoute("/resume")({
  head: () => ({
    meta: [
      { title: "Resume — SkillVerse" },
      {
        name: "description",
        content:
          "Choose how to build your resume - automatic AI generation or manual builder.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Resume — SkillVerse" },
      {
        property: "og:description",
        content: "Build your perfect resume with SkillVerse.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <ResumePage />
    </AuthGate>
  ),
});

function ResumePage() {
  return (
    <PageShell>
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand/5 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-brand/5 to-purple-500/5 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-blob delay-2000" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-blob delay-4000" />
        </div>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="animate-fade-up">
            <div className="text-xs font-semibold uppercase tracking-widest text-brand">
              Resume
            </div>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">
              Build your perfect{" "}
              <span className="text-gradient">resume</span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Choose how you want to create your resume - let AI do the heavy lifting or build it manually with full control.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Auto Resume Card */}
            <Link
              to="/ai-resume-generator"
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 p-8 shadow-elegant transition-all duration-300 hover:shadow-glow hover:scale-[1.02]"
            >
              <div className="relative z-10">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                  <Wand2 className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Auto Resume Generator
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Automatically generate a professional resume from your profile data. Choose from multiple templates optimized for different career stages.
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-brand">
                  <span>Generate Resume</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/10 blur-2xl transition-all duration-300 group-hover:bg-brand/20" />
            </Link>

            {/* Manual Resume Card */}
            <Link
              to="/resume-builder"
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-muted/30 to-muted/10 p-8 shadow-elegant transition-all duration-300 hover:shadow-glow hover:scale-[1.02]"
            >
              <div className="relative z-10">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-foreground to-foreground/70 text-background shadow-elegant">
                  <FileText className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Manual Resume Builder
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Build your resume from scratch with full control. Choose from professional templates and customize every section to match your style.
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span>Build manually</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-foreground/5 blur-2xl transition-all duration-300 group-hover:bg-foreground/10" />
            </Link>
          </div>

          {/* Features */}
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: "ATS-Friendly",
                desc: "Optimized for applicant tracking systems",
              },
              {
                icon: FileText,
                title: "Professional Templates",
                desc: "Choose from modern and classic designs",
              },
              {
                icon: Wand2,
                title: "AI-Powered",
                desc: "Smart suggestions and content optimization",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="glass rounded-xl p-5 shadow-elegant"
              >
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-lg bg-brand-gradient text-white shadow-glow">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="text-sm font-semibold">{f.title}</div>
                <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

/* ---------------- Resume templates ---------------- */

type ResumeProps = {
  p: ReturnType<typeof useProfile>["profile"];
  skills: string[];
  achievements: string[];
};

function LinkRow({ p }: { p: ResumeProps["p"] }) {
  const items: { icon: React.ReactNode; label: string; href?: string }[] = [];
  if (p.email) items.push({ icon: null, label: p.email });
  if (p.phone) items.push({ icon: null, label: p.phone });
  if (p.location) items.push({ icon: null, label: p.location });
  if (p.links.website)
    items.push({
      icon: <FaGlobe />,
      label: strip(p.links.website),
      href: p.links.website,
    });
  if (p.links.linkedin)
    items.push({
      icon: <FaLinkedin />,
      label: strip(p.links.linkedin),
      href: p.links.linkedin,
    });
  if (p.links.github)
    items.push({
      icon: <FaGithub />,
      label: strip(p.links.github),
      href: p.links.github,
    });
  if (p.links.leetcode)
    items.push({
      icon: <SiLeetcode />,
      label: strip(p.links.leetcode),
      href: p.links.leetcode,
    });
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-neutral-600">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {it.icon}
          {it.label}
        </span>
      ))}
    </div>
  );
}

function strip(u: string) {
  return u.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function ModernResume({ p, skills, achievements }: ResumeProps) {
  return (
    <div>
      <header className="border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight">{p.fullName}</h1>
        <div className="mt-1 text-sm font-medium text-neutral-700">
          {p.headline}
        </div>
        <LinkRow p={p} />
      </header>

      {p.summary && (
        <Section title="Summary">
          <p className="text-[13px] leading-relaxed text-neutral-800">
            {p.summary}
          </p>
        </Section>
      )}

      {skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {skills.map((s) => (
              <span
                key={s}
                className="rounded-md bg-neutral-100 px-2 py-1 text-[12px] font-medium text-neutral-800"
              >
                {s}
              </span>
            ))}
          </div>
        </Section>
      )}

      {p.experience.length > 0 && (
        <Section title="Experience">
          {p.experience.map((e) => (
            <div key={e.id} className="mb-3 last:mb-0">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-[14px] font-semibold">
                  {e.role} ·{" "}
                  <span className="font-normal text-neutral-700">
                    {e.company}
                  </span>
                </div>
                <div className="text-[12px] text-neutral-500">
                  {e.start} — {e.end}
                </div>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-neutral-800">
                {e.summary}
              </p>
            </div>
          ))}
        </Section>
      )}

      {p.projects.length > 0 && (
        <Section title="Projects">
          {p.projects.map((pr) => (
            <div key={pr.id} className="mb-3 last:mb-0">
              <div className="flex items-baseline justify-between gap-2">
                <div className="text-[14px] font-semibold">
                  {pr.name}{" "}
                  {pr.stack && (
                    <span className="font-normal text-neutral-600">
                      · {pr.stack}
                    </span>
                  )}
                </div>
                {pr.link && (
                  <div className="text-[12px] text-neutral-500">
                    {strip(pr.link)}
                  </div>
                )}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-neutral-800">
                {pr.summary}
              </p>
            </div>
          ))}
        </Section>
      )}

      {p.education.length > 0 && (
        <Section title="Education">
          {p.education.map((ed) => (
            <div
              key={ed.id}
              className="mb-2 last:mb-0 flex items-baseline justify-between gap-2"
            >
              <div>
                <div className="text-[14px] font-semibold">{ed.school}</div>
                <div className="text-[13px] text-neutral-700">
                  {ed.degree}
                  {ed.field ? `, ${ed.field}` : ""}{" "}
                  {ed.grade && (
                    <span className="text-neutral-500">· {ed.grade}</span>
                  )}
                </div>
              </div>
              <div className="text-[12px] text-neutral-500">
                {ed.start} — {ed.end}
              </div>
            </div>
          ))}
        </Section>
      )}

      {achievements.length > 0 && (
        <Section title="Achievements">
          <ul className="list-disc pl-5 text-[13px] leading-relaxed text-neutral-800">
            {achievements.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function ClassicResume({ p, skills, achievements }: ResumeProps) {
  return (
    <div className="text-neutral-900">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-wide">
          {p.fullName.toUpperCase()}
        </h1>
        <div className="mt-1 text-[13px] italic text-neutral-700">
          {p.headline}
        </div>
        <div className="mt-2 flex justify-center">
          <LinkRow p={p} />
        </div>
      </header>
      <hr className="my-4 border-neutral-300" />

      {p.summary && (
        <Section title="Summary" classic>
          <p className="text-[13px] leading-relaxed">{p.summary}</p>
        </Section>
      )}
      {skills.length > 0 && (
        <Section title="Skills" classic>
          <p className="text-[13px]">{skills.join(" · ")}</p>
        </Section>
      )}
      {p.experience.length > 0 && (
        <Section title="Experience" classic>
          {p.experience.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="text-[14px]">
                <b>{e.role}</b>, {e.company}{" "}
                <span className="float-right italic text-neutral-600">
                  {e.start} — {e.end}
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed">{e.summary}</p>
            </div>
          ))}
        </Section>
      )}
      {p.projects.length > 0 && (
        <Section title="Projects" classic>
          {p.projects.map((pr) => (
            <div key={pr.id} className="mb-3">
              <div className="text-[14px]">
                <b>{pr.name}</b>
                {pr.stack && ` — ${pr.stack}`}
                {pr.link && (
                  <span className="float-right italic text-neutral-600">
                    {strip(pr.link)}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed">{pr.summary}</p>
            </div>
          ))}
        </Section>
      )}
      {p.education.length > 0 && (
        <Section title="Education" classic>
          {p.education.map((ed) => (
            <div key={ed.id} className="mb-2 text-[13px]">
              <b>{ed.school}</b> — {ed.degree}
              {ed.field ? `, ${ed.field}` : ""}
              {ed.grade && `, ${ed.grade}`}
              <span className="float-right italic text-neutral-600">
                {ed.start} — {ed.end}
              </span>
            </div>
          ))}
        </Section>
      )}
      {achievements.length > 0 && (
        <Section title="Achievements" classic>
          <ul className="list-disc pl-5 text-[13px] leading-relaxed">
            {achievements.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
  classic,
}: {
  title: string;
  children: React.ReactNode;
  classic?: boolean;
}) {
  return (
    <section className="mt-5">
      <h2
        className={
          classic
            ? "mb-2 text-center text-[12px] font-bold uppercase tracking-[0.2em]"
            : "mb-2 border-b border-neutral-200 pb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500"
        }
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
