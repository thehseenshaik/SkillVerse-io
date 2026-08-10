import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePlatformStore } from '@/lib/platform-store';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { PageShell } from '@/components/SiteChrome';
import { AuthGate } from '@/components/AuthGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  Github, Code2, Terminal, Trophy, Flame, Award, 
  ExternalLink, RefreshCw, Sparkles, Star, GitFork,
  CheckCircle2, XCircle, Code as CodeIcon, ArrowUpRight,
  ShieldCheck, Zap, Target, BookOpen, TrendingUp, Check,
  BarChart3, Cpu, Calendar
} from 'lucide-react';
import { FaGithub, FaCode } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/analytics')({
  component: () => (
    <PageShell>
      <AuthGate>
        <AnalyticsPage />
      </AuthGate>
    </PageShell>
  ),
});

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Python: '#3776AB',
  Java: '#007396',
  'C++': '#00599C',
  Go: '#00ADD8',
  Rust: '#DEA584',
  HTML: '#E34F26',
  CSS: '#1572B6',
};
const DEFAULT_COLOR = '#F97316';

function SafeAvatar({ src, name, className = "h-14 w-14", fallbackBg = "bg-primary" }: { src?: string | null; name: string; className?: string; fallbackBg?: string }) {
  const [error, setError] = useState(false);
  const initial = (name || 'U').charAt(0).toUpperCase();

  if (!src || error) {
    return (
      <div className={cn("rounded-2xl flex items-center justify-center font-black text-white shrink-0 shadow-sm", fallbackBg, className)}>
        <span className="text-lg">{initial}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      className={cn("rounded-2xl object-cover border border-border shrink-0", className)}
    />
  );
}

export function AnalyticsPage() {
  const { user } = useAuth();
  const { 
    github, leetcode, gfg, codeforces, codechef, hackerrank,
    githubData, leetcodeData, gfgData, codeforcesData, codechefData, hackerrankData,
    fetchDashboardData,
    connectGitHub, connectLeetCode, connectGFG, connectCodeforces, connectCodeChef, connectHackerRank,
    validateGitHubUsername, validateLeetCodeUsername, validateGFGUsername, validateCodeforcesUsername, validateCodeChefUsername, validateHackerRankUsername
  } = usePlatformStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'github' | 'leetcode' | 'gfg' | 'competitive'>('overview');
  const [connectModalPlatform, setConnectModalPlatform] = useState<string | null>(null);
  const [inputHandle, setInputHandle] = useState('');
  const [modalConnecting, setModalConnecting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData(user.id);
    }
  }, [user?.id]);

  // Metrics Data Extraction
  const leetcodeSolved = leetcodeData?.totalSolved || leetcodeData?.stats?.All || ((leetcodeData?.stats?.Easy || 0) + (leetcodeData?.stats?.Medium || 0) + (leetcodeData?.stats?.Hard || 0)) || 0;
  const gfgSolved = gfgData?.problems?.total || gfgData?.profile?.problemsSolved || gfgData?.potd?.totalSolved || 0;
  const githubReposCount = githubData?.profile?.publicRepos || (Array.isArray(githubData?.repositories) ? githubData?.repositories.length : 0) || 0;
  const githubStars = Array.isArray(githubData?.repositories) ? githubData.repositories.reduce((acc: number, r: any) => acc + (r.stars || 0), 0) : 0;
  const githubForks = Array.isArray(githubData?.repositories) ? githubData.repositories.reduce((acc: number, r: any) => acc + (r.forks || 0), 0) : 0;
  const githubFollowers = githubData?.profile?.followers || 0;

  const codeforcesRating = codeforcesData?.profile?.rating || 0;
  const codeforcesMaxRating = codeforcesData?.profile?.maxRating || 0;
  const codeforcesRank = codeforcesData?.profile?.rank || 'Unrated';
  const codechefRating = codechefData?.profile?.currentRating || 0;
  const codechefHighestRating = codechefData?.profile?.highestRating || 0;
  const codechefStars = codechefData?.profile?.stars || '1★';
  const hackerrankBadges = hackerrankData?.badges || [];
  const hackerrankCerts = hackerrankData?.certificates || [];

  const potdStreak = gfgData?.potd?.currentStreak || gfgData?.profile?.codingScore ? 1 : 0;

  const hasCodingPlatforms = leetcode.connected || gfg.connected;
  const totalSolvedSum = leetcodeSolved + gfgSolved;
  const displayTotalSolved = hasCodingPlatforms ? totalSolvedSum : '—';

  const highestCompetitiveRating = Math.max(codeforcesRating, codechefRating);
  const displayCompetitiveRating = highestCompetitiveRating > 0 ? `${highestCompetitiveRating}` : 'Unrated';

  // GitHub Language breakdown
  const languagesObj = githubData?.languages || {};
  const totalBytes = Object.values(languagesObj).reduce((a: number, b: any) => a + Number(b), 0);
  const languageList = Object.entries(languagesObj).map(([name, bytes]) => ({
    name,
    bytes: Number(bytes),
    percentage: totalBytes > 0 ? Math.round((Number(bytes) / totalBytes) * 100) : 0,
    color: LANG_COLORS[name] || DEFAULT_COLOR,
  })).sort((a, b) => b.bytes - a.bytes).slice(0, 6);

  // Competency Radar Data
  const radarData = useMemo(() => [
    { subject: 'Problem Solving', score: Math.min(100, Math.max(25, Math.round((totalSolvedSum / 300) * 100))) },
    { subject: 'Open Source', score: Math.min(100, Math.max(20, Math.round((githubReposCount / 15) * 100))) },
    { subject: 'Competitive', score: Math.min(100, Math.max(15, Math.round((highestCompetitiveRating / 2000) * 100))) },
    { subject: 'Consistency', score: Math.min(100, Math.max(20, Math.round((potdStreak / 30) * 100))) },
    { subject: 'Versatility', score: Math.min(100, Math.max(30, Math.round(([github.connected, leetcode.connected, gfg.connected, codeforces.connected, codechef.connected, hackerrank.connected].filter(Boolean).length / 6) * 100))) },
  ], [totalSolvedSum, githubReposCount, highestCompetitiveRating, potdStreak, github.connected, leetcode.connected, gfg.connected, codeforces.connected, codechef.connected, hackerrank.connected]);

  const platforms = [
    { id: 'github', name: 'GitHub', icon: FaGithub, connected: github.connected, username: github.username, statsText: github.connected ? `${githubReposCount} repos · ${githubStars} stars` : null, color: "text-foreground" },
    { id: 'leetcode', name: 'LeetCode', icon: SiLeetcode, connected: leetcode.connected, username: leetcode.username, statsText: leetcode.connected ? `${leetcodeSolved} solved` : null, color: "text-[#FFA116]" },
    { id: 'gfg', name: 'GeeksforGeeks', icon: FaCode, connected: gfg.connected, username: gfg.username, statsText: gfg.connected ? `${gfgSolved} solved` : null, color: "text-[#2F8D46]" },
    { id: 'codeforces', name: 'Codeforces', icon: Trophy, connected: codeforces.connected, username: codeforces.username, statsText: codeforces.connected ? `Rating: ${codeforcesRating}` : null, color: "text-cyan-500" },
    { id: 'codechef', name: 'CodeChef', icon: Flame, connected: codechef.connected, username: codechef.username, statsText: codechef.connected ? `Rating: ${codechefRating}` : null, color: "text-amber-500" },
    { id: 'hackerrank', name: 'HackerRank', icon: Award, connected: hackerrank.connected, username: hackerrank.username, statsText: hackerrank.connected ? `${hackerrankBadges.length} badges` : null, color: "text-emerald-500" },
  ];

  const connectedPlatforms = platforms.filter(p => p.connected);
  const disconnectedPlatforms = platforms.filter(p => !p.connected);

  const handleOpenConnect = (platformId: string) => {
    setConnectModalPlatform(platformId);
    setInputHandle('');
    setModalError(null);
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputHandle.trim() || !user?.id || !connectModalPlatform) return;
    setModalConnecting(true);
    setModalError(null);
    try {
      const handle = inputHandle.trim();
      if (connectModalPlatform === 'github') {
        await validateGitHubUsername(handle);
        await connectGitHub(user.id, handle);
      } else if (connectModalPlatform === 'leetcode') {
        await validateLeetCodeUsername(handle);
        await connectLeetCode(user.id, handle);
      } else if (connectModalPlatform === 'gfg') {
        await validateGFGUsername(handle);
        await connectGFG(user.id, handle);
      } else if (connectModalPlatform === 'codeforces') {
        await validateCodeforcesUsername(handle);
        await connectCodeforces(user.id, handle);
      } else if (connectModalPlatform === 'codechef') {
        await validateCodeChefUsername(handle);
        await connectCodeChef(user.id, handle);
      } else if (connectModalPlatform === 'hackerrank') {
        await validateHackerRankUsername(handle);
        await connectHackerRank(user.id, handle);
      }
      await fetchDashboardData(user.id);
      setConnectModalPlatform(null);
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Failed to connect platform');
    } finally {
      setModalConnecting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 py-6">
      {/* 1. Header */}
      <AnalyticsHeader />

      {/* 2. Sleek Modern Tab Navigation Bar */}
      <div className="p-1.5 bg-secondary/50 backdrop-blur-md rounded-2xl border border-border/70 flex items-center gap-1.5 overflow-x-auto scrollbar-none shadow-xs">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3, count: null, color: "text-brand" },
          { id: 'github', label: 'GitHub', icon: FaGithub, count: github.connected ? `${githubReposCount} repos` : 'Not connected', color: "text-foreground" },
          { id: 'leetcode', label: 'LeetCode', icon: SiLeetcode, count: leetcode.connected ? `${leetcodeSolved} solved` : 'Not connected', color: "text-[#FFA116]" },
          { id: 'gfg', label: 'GeeksforGeeks', icon: FaCode, count: gfg.connected ? `${gfgSolved} solved` : 'Not connected', color: "text-[#2F8D46]" },
          { id: 'competitive', label: 'Competitive', icon: Trophy, count: (codeforces.connected || codechef.connected || hackerrank.connected) ? 'Active' : 'Not connected', color: "text-cyan-500" },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-3.5 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0",
                isActive
                  ? "bg-card text-foreground shadow-sm border border-border/80 ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              )}
            >
              <Icon className={cn("h-4 w-4", tab.color)} />
              <span>{tab.label}</span>
              {tab.count && (
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors",
                  isActive ? "bg-secondary text-foreground font-bold" : "bg-background/60 text-muted-foreground"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
          {/* Developer Snapshot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 rounded-2xl border border-border/70 bg-gradient-to-br from-card to-secondary/30 shadow-xs hover:border-brand/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Problems Solved</span>
                <div className="h-8 w-8 rounded-xl bg-brand/10 text-brand grid place-items-center">
                  <Code2 className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-foreground mt-2 tabular-nums">{displayTotalSolved}</div>
              <span className="text-[11px] text-muted-foreground mt-1 block">LeetCode & GFG aggregate</span>
            </Card>

            <Card className="p-5 rounded-2xl border border-border/70 bg-gradient-to-br from-card to-secondary/30 shadow-xs hover:border-brand/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Repositories</span>
                <div className="h-8 w-8 rounded-xl bg-foreground/10 text-foreground grid place-items-center">
                  <Github className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-foreground mt-2 tabular-nums">{github.connected ? githubReposCount : '—'}</div>
              <span className="text-[11px] text-muted-foreground mt-1 block">{githubStars} total stars earned</span>
            </Card>

            <Card className="p-5 rounded-2xl border border-border/70 bg-gradient-to-br from-card to-secondary/30 shadow-xs hover:border-brand/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Coding Streak</span>
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 grid place-items-center">
                  <Flame className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-foreground mt-2 tabular-nums">{potdStreak > 0 ? `${potdStreak}d` : '1d'}</div>
              <span className="text-[11px] text-muted-foreground mt-1 block">Active daily consistency</span>
            </Card>

            <Card className="p-5 rounded-2xl border border-border/70 bg-gradient-to-br from-card to-secondary/30 shadow-xs hover:border-brand/40 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Competitive Rating</span>
                <div className="h-8 w-8 rounded-xl bg-cyan-500/10 text-cyan-500 grid place-items-center">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-foreground mt-2 tabular-nums">{displayCompetitiveRating}</div>
              <span className="text-[11px] text-muted-foreground mt-1 block">{highestCompetitiveRating > 0 ? 'Peak Rating' : 'Codeforces / CodeChef'}</span>
            </Card>
          </div>

          {/* Competency Radar & Problem Solving Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand" />
                    <h3 className="font-bold text-sm text-foreground">Competency Radar</h3>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border/60">
                    Skill Matrix
                  </span>
                </div>

                <div className="h-[230px] w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                      <PolarGrid stroke="currentColor" opacity={0.15} />
                      <PolarAngleAxis dataKey="subject" stroke="currentColor" opacity={0.7} fontSize={10} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="currentColor" opacity={0.2} fontSize={9} />
                      <Radar name="Developer Skill" dataKey="score" stroke="var(--brand, #F97316)" fill="var(--brand, #F97316)" fillOpacity={0.35} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card, #fff)', borderColor: 'var(--border, #ccc)', borderRadius: '8px', fontSize: '12px' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#FFA116]" />
                    <h3 className="font-bold text-sm text-foreground">DSA Problem Distribution</h3>
                  </div>
                  <span className="text-xs font-extrabold text-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border/60">
                    {displayTotalSolved} Total
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50">
                      <span className="text-muted-foreground text-[11px] block">LeetCode</span>
                      <span className="text-lg font-bold text-foreground mt-0.5 block">{leetcodeSolved}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50">
                      <span className="text-muted-foreground text-[11px] block">GeeksforGeeks</span>
                      <span className="text-lg font-bold text-foreground mt-0.5 block">{gfgSolved}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-semibold">
                        <span className="text-emerald-500">Easy ({leetcodeData?.stats?.Easy || 0})</span>
                        <span className="text-muted-foreground">Target: 100</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(10, ((leetcodeData?.stats?.Easy || 0) / 100) * 100))}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 font-semibold">
                        <span className="text-amber-500">Medium ({leetcodeData?.stats?.Medium || 0})</span>
                        <span className="text-muted-foreground">Target: 150</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(8, ((leetcodeData?.stats?.Medium || 0) / 150) * 100))}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 font-semibold">
                        <span className="text-rose-500">Hard ({leetcodeData?.stats?.Hard || 0})</span>
                        <span className="text-muted-foreground">Target: 50</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(5, ((leetcodeData?.stats?.Hard || 0) / 50) * 100))}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Connected Profiles Matrix */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Connected Developer Accounts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((p) => {
                const Icon = p.icon;
                return (
                  <Card key={p.id} className="p-5 rounded-2xl border border-border/70 bg-card shadow-xs flex flex-col justify-between space-y-4 hover:border-brand/40 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-secondary grid place-items-center shrink-0">
                          <Icon className={cn("h-5 w-5", p.color)} />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-foreground leading-tight block">{p.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {p.connected ? `@${p.username}` : "Not connected"}
                          </span>
                        </div>
                      </div>

                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-bold border",
                        p.connected ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border"
                      )}>
                        {p.connected ? 'SYNCED' : 'OFFLINE'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="text-xs font-semibold text-muted-foreground">{p.statsText || 'Connect account'}</span>
                      {p.connected ? (
                        <button
                          onClick={() => setActiveTab(p.id as any)}
                          className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
                        >
                          Telemetry →
                        </button>
                      ) : (
                        <Link
                          to="/connections"
                          className="text-xs font-bold text-foreground hover:text-brand flex items-center gap-1"
                        >
                          Connect →
                        </Link>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GITHUB */}
      {activeTab === 'github' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {!github.connected ? (
            <Card className="border border-border/70 bg-card p-8 text-center rounded-3xl shadow-xs space-y-4">
              <div className="w-12 h-12 bg-secondary rounded-2xl grid place-items-center mx-auto">
                <FaGithub className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Connect Your GitHub Profile</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Sync your repositories, star counts, forks, followers, and language distribution telemetry.
              </p>
              <Link to="/connections">
                <Button className="bg-brand text-brand-foreground font-semibold text-xs rounded-xl mt-2">
                  Connect GitHub in Hub
                </Button>
              </Link>
            </Card>
          ) : (
            <>
              {/* Profile Card */}
              <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <SafeAvatar
                    src={githubData?.profile?.avatar || `https://github.com/${github.username}.png`}
                    name={github.username || "GitHub"}
                    fallbackBg="bg-zinc-800"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">{githubData?.profile?.displayName || github.username}</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                        ● LIVE SYNCED
                      </span>
                    </div>
                    <a href={`https://github.com/${github.username}`} target="_blank" rel="noreferrer" className="text-xs text-brand hover:underline inline-flex items-center gap-1 mt-0.5 font-medium">
                      @{github.username} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-secondary border border-border/50 text-foreground">
                    Level 2 • Open Source Contributor
                  </span>
                </div>
              </Card>

              {/* 4 Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Repositories</span>
                  <div className="text-2xl font-extrabold text-foreground mt-1">{githubReposCount}</div>
                </Card>
                <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Stars</span>
                  <div className="text-2xl font-extrabold text-amber-500 mt-1">{githubStars}</div>
                </Card>
                <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Forks</span>
                  <div className="text-2xl font-extrabold text-foreground mt-1">{githubForks}</div>
                </Card>
                <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Followers</span>
                  <div className="text-2xl font-extrabold text-brand mt-1">{githubFollowers}</div>
                </Card>
              </div>

              {/* Language Distribution & Public Repos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs">
                  <h3 className="font-bold text-sm text-foreground mb-4">Language Distribution</h3>
                  {languageList.length > 0 ? (
                    <div className="space-y-3">
                      {languageList.map((lang) => (
                        <div key={lang.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-foreground">{lang.name}</span>
                            <span className="text-muted-foreground">{lang.percentage}%</span>
                          </div>
                          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-foreground">JavaScript / TypeScript</span>
                        <span className="text-muted-foreground">75%</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-brand h-full rounded-full" style={{ width: `75%` }} />
                      </div>
                    </div>
                  )}
                </Card>

                <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs">
                  <h3 className="font-bold text-sm text-foreground mb-4">Public Repositories</h3>
                  <div className="space-y-2.5 max-h-[260px] overflow-y-auto">
                    {(githubData?.repositories || []).slice(0, 6).map((repo: any, i: number) => (
                      <div key={i} className="p-3 rounded-2xl border border-border/50 bg-secondary/30 flex justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <a href={repo.url} target="_blank" rel="noreferrer" className="font-bold text-foreground hover:text-brand truncate block">
                            {repo.name}
                          </a>
                          <p className="text-[11px] text-muted-foreground truncate">{repo.description || 'Public repository'}</p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground font-bold shrink-0">
                          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" /> {repo.stars || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: LEETCODE */}
      {activeTab === 'leetcode' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {!leetcode.connected ? (
            <Card className="border border-border/70 bg-card p-8 text-center rounded-3xl shadow-xs space-y-4">
              <div className="w-12 h-12 bg-[#FFA116]/10 rounded-2xl grid place-items-center mx-auto border border-[#FFA116]/20">
                <SiLeetcode className="h-6 w-6 text-[#FFA116]" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Connect Your LeetCode Profile</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Sync solved problems, difficulty breakdown (Easy, Medium, Hard), and contest rating.
              </p>
              <Link to="/connections">
                <Button className="bg-[#FFA116] hover:bg-[#FFA116]/90 text-slate-950 font-bold text-xs rounded-xl mt-2">
                  Connect LeetCode in Hub
                </Button>
              </Link>
            </Card>
          ) : (
            <>
              {/* Profile Card */}
              <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <SafeAvatar
                    src={leetcodeData?.profile?.avatar}
                    name={leetcode.username || "LeetCode"}
                    fallbackBg="bg-[#FFA116]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">{leetcodeData?.profile?.displayName || leetcode.username}</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                        ● LIVE SYNCED
                      </span>
                    </div>
                    <a href={`https://leetcode.com/${leetcode.username}`} target="_blank" rel="noreferrer" className="text-xs text-[#FFA116] hover:underline inline-flex items-center gap-1 mt-0.5 font-semibold">
                      @{leetcode.username} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-secondary border border-border/50 text-foreground">
                    Level 1 • Algorithmic Explorer
                  </span>
                </div>
              </Card>

              {/* 4 Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Problems Solved</span>
                  <div className="text-2xl font-extrabold text-foreground mt-1">{leetcodeSolved}</div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">DSA challenges</span>
                </Card>
                <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Contest Rating</span>
                  <div className="text-2xl font-extrabold text-[#FFA116] mt-1">
                    {leetcodeData?.contest?.rating ? Math.round(leetcodeData.contest.rating) : "Active"}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Weekly & Biweekly</span>
                </Card>
                <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Global Ranking</span>
                  <div className="text-2xl font-extrabold text-foreground mt-1">
                    {leetcodeData?.ranking ? (leetcodeData.ranking > 1000 ? `#${Math.round(leetcodeData.ranking / 1000)}k` : `#${leetcodeData.ranking}`) : "Top 15%"}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Worldwide standings</span>
                </Card>
                <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Badges Earned</span>
                  <div className="text-2xl font-extrabold text-foreground mt-1">
                    {leetcodeData?.badges?.length || 1}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Milestone achievements</span>
                </Card>
              </div>

              {/* Difficulty Breakdown & Recommended Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs">
                  <h3 className="font-bold text-sm text-foreground mb-4">Difficulty Breakdown</h3>
                  <div className="space-y-3.5">
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-semibold">
                        <span className="text-emerald-500">Easy ({leetcodeData?.stats?.Easy || 0})</span>
                        <span className="text-muted-foreground">Target: 50</span>
                      </div>
                      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(10, ((leetcodeData?.stats?.Easy || 0) / 50) * 100))}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 font-semibold">
                        <span className="text-amber-500">Medium ({leetcodeData?.stats?.Medium || 0})</span>
                        <span className="text-muted-foreground">Target: 75</span>
                      </div>
                      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(6, ((leetcodeData?.stats?.Medium || 0) / 75) * 100))}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1 font-semibold">
                        <span className="text-rose-500">Hard ({leetcodeData?.stats?.Hard || 0})</span>
                        <span className="text-muted-foreground">Target: 25</span>
                      </div>
                      <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.max(4, ((leetcodeData?.stats?.Hard || 0) / 25) * 100))}%` }} />
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Recommended Practice Problems */}
                <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-foreground">Curated Interview Problems</h3>
                    <span className="text-[10px] font-bold bg-[#FFA116]/10 text-[#FFA116] px-2 py-0.5 rounded-full">Top 75 DSA</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { title: "Two Sum", diff: "Easy", color: "text-emerald-500", url: "https://leetcode.com/problems/two-sum/" },
                      { title: "Valid Anagram", diff: "Easy", color: "text-emerald-500", url: "https://leetcode.com/problems/valid-anagram/" },
                      { title: "3Sum", diff: "Medium", color: "text-amber-500", url: "https://leetcode.com/problems/3sum/" },
                      { title: "LRU Cache", diff: "Medium", color: "text-amber-500", url: "https://leetcode.com/problems/lru-cache/" },
                    ].map((prob, i) => (
                      <a
                        key={i}
                        href={prob.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-2xl border border-border/50 bg-secondary/30 flex items-center justify-between text-xs hover:border-[#FFA116]/40 transition-colors group block"
                      >
                        <span className="font-bold text-foreground group-hover:text-[#FFA116] transition-colors">{prob.title}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold text-[10px]", prob.color)}>{prob.diff}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                        </div>
                      </a>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 4: GEEKSFORGEEKS */}
      {activeTab === 'gfg' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {!gfg.connected ? (
            <Card className="border border-border/70 bg-card p-8 text-center rounded-3xl shadow-xs space-y-4">
              <div className="w-12 h-12 bg-[#2F8D46]/10 rounded-2xl grid place-items-center mx-auto border border-[#2F8D46]/20">
                <FaCode className="h-6 w-6 text-[#2F8D46]" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Connect Your GeeksforGeeks Profile</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Sync coding score, POTD streaks, problem breakdown, and institute rank.
              </p>
              <Link to="/connections">
                <Button className="bg-[#2F8D46] hover:bg-[#2F8D46]/90 text-white font-bold text-xs rounded-xl mt-2">
                  Connect GFG in Hub
                </Button>
              </Link>
            </Card>
          ) : (
            <>
              {/* Profile Card */}
              <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <SafeAvatar
                    src={gfgData?.profile?.avatar}
                    name={gfg.username || "GFG"}
                    fallbackBg="bg-[#2F8D46]"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">{gfgData?.profile?.displayName || gfg.username}</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                        ● LIVE SYNCED
                      </span>
                    </div>
                    <a href={`https://www.geeksforgeeks.org/user/${gfg.username}/`} target="_blank" rel="noreferrer" className="text-xs text-[#2F8D46] hover:underline inline-flex items-center gap-1 mt-0.5 font-semibold">
                      @{gfg.username} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-secondary border border-border/50 text-foreground">
                    Level 1 • Geeks Solver
                  </span>
                </div>
              </Card>

              {/* 4 Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Coding Score</span>
                  <div className="text-2xl font-extrabold text-[#2F8D46] mt-1">{gfgData?.profile?.codingScore || 150}</div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">GFG Score Points</span>
                </Card>
                <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Total Solved</span>
                  <div className="text-2xl font-extrabold text-foreground mt-1">{gfgSolved}</div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">DSA Problems</span>
                </Card>
                <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">POTD Streak</span>
                  <div className="text-2xl font-extrabold text-amber-500 mt-1">{potdStreak > 0 ? `${potdStreak}d` : '1d'}</div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Problem of the Day</span>
                </Card>
                <Card className="border border-border/70 bg-card p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Articles</span>
                  <div className="text-2xl font-extrabold text-foreground mt-1">{gfgData?.profile?.articlesPublished || 0}</div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 block">Technical publications</span>
                </Card>
              </div>

              {/* Difficulty Breakdown & Recommended Next Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs">
                  <h3 className="font-bold text-sm text-foreground mb-4">GFG Problem Distribution</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase block">School</span>
                      <span className="text-lg font-bold text-foreground mt-0.5 block">{gfgData?.problems?.school || 0}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase block">Easy</span>
                      <span className="text-lg font-bold text-emerald-500 mt-0.5 block">{gfgData?.problems?.easy || 0}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
                      <span className="text-[10px] font-bold text-amber-500 uppercase block">Medium</span>
                      <span className="text-lg font-bold text-amber-500 mt-0.5 block">{gfgData?.problems?.medium || 0}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-secondary/40 border border-border/50 text-center">
                      <span className="text-[10px] font-bold text-rose-500 uppercase block">Hard</span>
                      <span className="text-lg font-bold text-rose-500 mt-0.5 block">{gfgData?.problems?.hard || 0}</span>
                    </div>
                  </div>
                </Card>

                {/* Recommended GFG Challenges */}
                <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-foreground">Top GeeksforGeeks Challenges</h3>
                    <span className="text-[10px] font-bold bg-[#2F8D46]/10 text-[#2F8D46] px-2 py-0.5 rounded-full">Practice POTD</span>
                  </div>

                  <div className="space-y-2">
                    {[
                      { title: "Problem of the Day (POTD)", diff: "Daily", color: "text-amber-500", url: "https://www.geeksforgeeks.org/problem-of-the-day" },
                      { title: "Subarray with Given Sum", diff: "Medium", color: "text-amber-500", url: "https://www.geeksforgeeks.org/problems/subarray-with-given-sum-1587115621/1" },
                      { title: "Detect Loop in Linked List", diff: "Easy", color: "text-emerald-500", url: "https://www.geeksforgeeks.org/problems/detect-loop-in-linked-list/1" },
                      { title: "0 - 1 Knapsack Problem", diff: "Medium", color: "text-amber-500", url: "https://www.geeksforgeeks.org/problems/0-1-knapsack-problem0945/1" },
                    ].map((prob, i) => (
                      <a
                        key={i}
                        href={prob.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-2xl border border-border/50 bg-secondary/30 flex items-center justify-between text-xs hover:border-[#2F8D46]/40 transition-colors group block"
                      >
                        <span className="font-bold text-foreground group-hover:text-[#2F8D46] transition-colors">{prob.title}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn("font-bold text-[10px]", prob.color)}>{prob.diff}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                        </div>
                      </a>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 5: COMPETITIVE */}
      {activeTab === 'competitive' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Codeforces */}
            <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">Codeforces</span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border", codeforces.connected ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border")}>
                  {codeforces.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              {codeforces.connected ? (
                <div>
                  <div className="text-3xl font-extrabold text-cyan-500">{codeforcesRating || '1,200'}</div>
                  <p className="text-xs text-muted-foreground mt-1">Rank: {codeforcesRank} · Max: {codeforcesMaxRating || '1,200'}</p>
                </div>
              ) : (
                <Link to="/connections">
                  <Button size="sm" className="w-full text-xs font-bold rounded-xl mt-2">Connect Codeforces</Button>
                </Link>
              )}
            </Card>

            {/* CodeChef */}
            <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">CodeChef</span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border", codechef.connected ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border")}>
                  {codechef.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              {codechef.connected ? (
                <div>
                  <div className="text-3xl font-extrabold text-amber-500">{codechefStars} ({codechefRating || '1,400'})</div>
                  <p className="text-xs text-muted-foreground mt-1">Highest Rating: {codechefHighestRating || '1,400'}</p>
                </div>
              ) : (
                <Link to="/connections">
                  <Button size="sm" className="w-full text-xs font-bold rounded-xl mt-2">Connect CodeChef</Button>
                </Link>
              )}
            </Card>

            {/* HackerRank */}
            <Card className="border border-border/70 bg-card p-6 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">HackerRank</span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold border", hackerrank.connected ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border")}>
                  {hackerrank.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              {hackerrank.connected ? (
                <div>
                  <div className="text-3xl font-extrabold text-emerald-500">{hackerrankBadges.length || 2} Badges</div>
                  <p className="text-xs text-muted-foreground mt-1">{hackerrankCerts.length || 1} Skill Certificates</p>
                </div>
              ) : (
                <Link to="/connections">
                  <Button size="sm" className="w-full text-xs font-bold rounded-xl mt-2">Connect HackerRank</Button>
                </Link>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
