import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Code2,
  MessageSquare,
  Mic,
  Target,
  Timer,
  Trophy,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { usePlatformStore } from "@/lib/platform-store";

export const Route = createFileRoute("/practice")({
  head: () => ({
    meta: [
      { title: "Practice & Mock Interviews — SkillVerse" },
      {
        name: "description",
        content:
          "Adaptive DSA sets, aptitude drills and AI mock interviews with feedback on confidence, communication and technical depth.",
      },
      {
        property: "og:title",
        content: "Practice & Mock Interviews — SkillVerse",
      },
      {
        property: "og:description",
        content:
          "Practice like it's placement day. Adaptive tests, timed drills and AI interviews that actually score you.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <PracticePage />
    </AuthGate>
  ),
});

const tracks = [
  {
    icon: Code2,
    title: "DSA sprints",
    desc: "Adaptive problem sets across arrays, DP, graphs and system design.",
    stat: "1,200+ problems",
  },
  {
    icon: Brain,
    title: "Aptitude drills",
    desc: "Quant, logical reasoning, verbal — timed like real placement tests.",
    stat: "Timed like TCS/Infy",
  },
  {
    icon: Mic,
    title: "AI mock interviews",
    desc: "HR, behavioral and technical rounds with a voice-based AI interviewer.",
    stat: "Voice + video ready",
  },
  {
    icon: Target,
    title: "Company-specific prep",
    desc: "Curated question banks tuned to Google, Amazon, Microsoft and more.",
    stat: "300+ companies",
  },
];

const scores = [
  { label: "Confidence", v: 82 },
  { label: "Communication", v: 76 },
  { label: "Technical depth", v: 88 },
  { label: "Structured answers", v: 71 },
];

function PracticePage() {
  const { leetcodeData, leetcode, githubData, github } = usePlatformStore();
  
  // Generate personalized recommendations based on LeetCode data
  const getWeakTopics = () => {
    if (!leetcodeData || !leetcode.connected) return [];
    
    const recentSubmissions = leetcodeData.recentSubmissions || [];
    const topicFrequency: Record<string, number> = {};
    
    recentSubmissions.forEach(sub => {
      const title = sub.title.toLowerCase();
      if (title.includes('array')) topicFrequency['Arrays'] = (topicFrequency['Arrays'] || 0) + 1;
      if (title.includes('string')) topicFrequency['Strings'] = (topicFrequency['Strings'] || 0) + 1;
      if (title.includes('tree')) topicFrequency['Trees'] = (topicFrequency['Trees'] || 0) + 1;
      if (title.includes('graph')) topicFrequency['Graphs'] = (topicFrequency['Graphs'] || 0) + 1;
      if (title.includes('dynamic') || title.includes('dp')) topicFrequency['Dynamic Programming'] = (topicFrequency['Dynamic Programming'] || 0) + 1;
      if (title.includes('linked list')) topicFrequency['Linked Lists'] = (topicFrequency['Linked Lists'] || 0) + 1;
      if (title.includes('hash')) topicFrequency['Hash Tables'] = (topicFrequency['Hash Tables'] || 0) + 1;
    });
    
    // Topics with fewer attempts are considered weak
    const allTopics = ['Arrays', 'Strings', 'Trees', 'Graphs', 'Dynamic Programming', 'Linked Lists', 'Hash Tables', 'Sorting', 'Searching', 'Backtracking'];
    return allTopics
      .map(topic => ({ topic, count: topicFrequency[topic] || 0 }))
      .sort((a, b) => a.count - b.count)
      .slice(0, 3)
      .map(t => t.topic);
  };
  
  const weakTopics = getWeakTopics();
  const recommendedDifficulty = (leetcodeData?.stats?.Hard || 0) > 5 ? 'Hard' : (leetcodeData?.stats?.Medium || 0) > 10 ? 'Medium' : 'Easy';
  
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-hero pt-24 pb-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-5xl px-6 text-center animate-fade-up">
          <div className="glass mx-auto inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Timer className="h-3.5 w-3.5 text-brand" /> Practice Center
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
            Practice like it's{" "}
            <span className="text-gradient">placement day.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Adaptive drills and AI-driven mock interviews that give you a real
            score — not just a green checkmark.
          </p>
          
          {/* Personalized Recommendations */}
          {(leetcode.connected && leetcodeData) || (github.connected && githubData) ? (
            <div className="mt-6 mx-auto max-w-2xl">
              <div className="glass rounded-2xl p-4 border border-brand/20 bg-brand/5">
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-brand mb-3">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Personalized Recommendations
                </div>
                {leetcode.connected && leetcodeData && weakTopics.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Focus on: <span className="font-medium text-foreground">{weakTopics.join(', ')}</span>
                    <span className="mx-2">•</span>
                    Recommended difficulty: <span className="font-medium text-foreground">{recommendedDifficulty}</span>
                  </div>
                )}
                {github.connected && githubData && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Practice with your top languages: <span className="font-medium text-foreground">
                      {Object.entries(githubData.languages)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 2)
                        .map(([lang]) => lang)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 mx-auto max-w-2xl">
              <Link
                to="/connections"
                className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border border-border/50 hover:border-brand/30 transition-colors"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                Connect LeetCode for personalized recommendations
              </Link>
            </div>
          )}
          
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/interview"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-gradient px-6 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03]"
            >
              <Mic className="h-4 w-4" /> Start AI mock interview{" "}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-border/70 px-6 text-sm font-semibold text-foreground hover:bg-secondary/60"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto grid max-w-6xl gap-5 px-6 md:grid-cols-2 lg:grid-cols-4">
          {tracks.map(({ icon: Icon, title, desc, stat }) => (
            <div
              key={title}
              className="glass rounded-3xl p-6 shadow-elegant transition-all hover:-translate-y-1 hover:shadow-glow"
            >
              <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
              <div className="mt-4 text-xs font-semibold text-brand">
                {stat}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5 text-brand" /> AI mock
              interview
            </div>
            <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              Every mock ends with a{" "}
              <span className="text-gradient">real report.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              After every interview you get a scorecard, a full transcript, and
              3 concrete things to fix before the next one.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Trophy className="h-4 w-4 text-brand" /> Confidence, tone and
                clarity analysis
              </li>
              <li className="flex items-center gap-3">
                <Trophy className="h-4 w-4 text-brand" /> Technical accuracy per
                answer
              </li>
              <li className="flex items-center gap-3">
                <Trophy className="h-4 w-4 text-brand" /> Suggested rewrites of
                your weakest answer
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand-gradient opacity-20 blur-3xl" />
            <div className="glass rounded-3xl p-8 shadow-elegant">
              <div className="text-xs text-muted-foreground">
                Last mock — Backend SDE
              </div>
              <div className="mt-1 text-5xl font-extrabold text-gradient">
                79
                <span className="text-base font-semibold text-muted-foreground">
                  /100
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {scores.map(({ label, v }) => (
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

      <section className="px-6 py-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] p-12 text-center shadow-glow">
          <div className="absolute inset-0 -z-10 bg-brand-gradient opacity-95" />
          <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Start your first mock interview.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            15 minutes. Real feedback. No judgment.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-foreground shadow-elegant transition-transform hover:scale-[1.03]"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/features"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/40 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              See all features
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
