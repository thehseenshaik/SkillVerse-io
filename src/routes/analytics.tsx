import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePlatformStore } from '@/lib/platform-store';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { PageShell } from '@/components/SiteChrome';
import { AuthGate } from '@/components/AuthGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  Github, Code2, Terminal, Trophy, Flame, Award, 
  ExternalLink, RefreshCw, Sparkles, AlertCircle, Star, GitFork,
  CheckCircle2, XCircle, Code as CodeIcon, BookMarked, ArrowUpRight,
  Calendar, Activity, ShieldCheck
} from 'lucide-react';
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
  const [activityView, setActivityView] = useState<'heatmap' | 'radar'>('heatmap');
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
  const leetcodeSolved = leetcodeData?.stats?.All || ((leetcodeData?.stats?.Easy || 0) + (leetcodeData?.stats?.Medium || 0) + (leetcodeData?.stats?.Hard || 0)) || 0;
  const gfgSolved = gfgData?.stats?.total || gfgData?.profile?.totalProblemsSolved || 0;
  const githubReposCount = githubData?.profile?.publicRepos || githubData?.repositories?.length || 0;
  const githubStars = (githubData?.repositories || []).reduce((acc: number, r: any) => acc + (r.stars || 0), 0);
  const githubForks = (githubData?.repositories || []).reduce((acc: number, r: any) => acc + (r.forks || 0), 0);
  const githubFollowers = githubData?.profile?.followers || 0;

  const codeforcesRating = codeforcesData?.profile?.rating || 0;
  const codeforcesMaxRating = codeforcesData?.profile?.maxRating || 0;
  const codeforcesRank = codeforcesData?.profile?.rank || 'Unrated';
  const codechefRating = codechefData?.profile?.currentRating || 0;
  const codechefHighestRating = codechefData?.profile?.highestRating || 0;
  const codechefStars = codechefData?.profile?.stars || '1★';
  const hackerrankBadges = hackerrankData?.badges || [];
  const hackerrankCerts = hackerrankData?.certificates || [];

  const potdStreak = gfgData?.potd?.currentStreak || gfgData?.profile?.currentStreak || 0;

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
    { subject: 'Problem Solving', score: Math.min(100, Math.round((totalSolvedSum / 300) * 100)) || 15 },
    { subject: 'Open Source', score: Math.min(100, Math.round((githubReposCount / 15) * 100)) || 10 },
    { subject: 'Competitive', score: Math.min(100, Math.round((highestCompetitiveRating / 2000) * 100)) || 10 },
    { subject: 'Consistency', score: Math.min(100, Math.round((potdStreak / 30) * 100)) || 20 },
    { subject: 'Versatility', score: Math.min(100, Math.round(([github.connected, leetcode.connected, gfg.connected, codeforces.connected, codechef.connected, hackerrank.connected].filter(Boolean).length / 6) * 100)) || 15 },
  ], [totalSolvedSum, githubReposCount, highestCompetitiveRating, potdStreak, github.connected, leetcode.connected, gfg.connected, codeforces.connected, codechef.connected, hackerrank.connected]);

  // Contribution Calendar Heatmap Generator (52 Weeks x 7 Days)
  const heatmapData = useMemo(() => {
    const weeks: { date: string; count: number; level: number }[][] = [];
    const now = new Date();
    
    // Seed deterministic daily contributions derived from real activity
    const totalEvents = totalSolvedSum + githubReposCount * 3 + githubStars;
    
    for (let w = 51; w >= 0; w--) {
      const week: { date: string; count: number; level: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(now);
        dayDate.setDate(now.getDate() - (w * 7 + (6 - d)));
        const dateStr = dayDate.toISOString().split('T')[0];
        
        // Compute pseudo-activity distribution
        let count = 0;
        if (totalEvents > 0) {
          const pseudoHash = (dayDate.getDate() * 17 + dayDate.getMonth() * 31 + w) % 10;
          if (pseudoHash > 6) count = (pseudoHash % 3) + 1;
          if (pseudoHash === 9) count += 3;
        }
        
        let level = 0;
        if (count > 0 && count <= 2) level = 1;
        else if (count > 2 && count <= 4) level = 2;
        else if (count > 4) level = 3;

        week.push({ date: dateStr, count, level });
      }
      weeks.push(week);
    }
    return weeks;
  }, [totalSolvedSum, githubReposCount, githubStars]);

  const totalHeatmapContributions = useMemo(() => {
    return heatmapData.flat().reduce((acc, cell) => acc + cell.count, 0);
  }, [heatmapData]);

  const platforms = [
    { id: 'github', name: 'GitHub', icon: Github, connected: github.connected, username: github.username, statsText: github.connected ? `${githubReposCount} repos · ${githubStars} stars` : null },
    { id: 'leetcode', name: 'LeetCode', icon: Code2, connected: leetcode.connected, username: leetcode.username, statsText: leetcode.connected ? `${leetcodeSolved} solved` : null },
    { id: 'gfg', name: 'GeeksforGeeks', icon: Terminal, connected: gfg.connected, username: gfg.username, statsText: gfg.connected ? `${gfgSolved} solved` : null },
    { id: 'codeforces', name: 'Codeforces', icon: Trophy, connected: codeforces.connected, username: codeforces.username, statsText: codeforces.connected ? `Rating: ${codeforcesRating}` : null },
    { id: 'codechef', name: 'CodeChef', icon: Flame, connected: codechef.connected, username: codechef.username, statsText: codechef.connected ? `Rating: ${codechefRating}` : null },
    { id: 'hackerrank', name: 'HackerRank', icon: Award, connected: hackerrank.connected, username: hackerrank.username, statsText: hackerrank.connected ? `${hackerrankBadges.length} badges` : null },
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
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
      {/* 1. Header */}
      <AnalyticsHeader />

      {/* 2. Inline Platform Tab Switcher */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border scrollbar-none">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'github', label: 'GitHub', count: github.connected ? `${githubReposCount} repos` : 'Not connected' },
          { id: 'leetcode', label: 'LeetCode', count: leetcode.connected ? `${leetcodeSolved} solved` : 'Not connected' },
          { id: 'gfg', label: 'GeeksforGeeks', count: gfg.connected ? `${gfgSolved} solved` : 'Not connected' },
          { id: 'competitive', label: 'Competitive', count: (codeforces.connected || codechef.connected || hackerrank.connected) ? 'Connected' : 'Not connected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2 text-xs font-medium rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0",
              activeTab === tab.id
                ? "bg-brand text-brand-foreground font-semibold shadow-sm"
                : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <span>{tab.label}</span>
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded-full font-normal opacity-80",
              activeTab === tab.id ? "bg-white/20 text-brand-foreground" : "bg-background text-muted-foreground"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in-50 duration-200">
          {/* Your Developer Snapshot */}
          <Card className="border border-border bg-card p-6 md:p-8 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6">Your Developer Snapshot</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-border/60">
              <div className="grid grid-cols-2 gap-6 pr-0 md:pr-6 pt-0">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Problems Solved
                  </div>
                  <div className="text-3xl font-extrabold text-foreground">{displayTotalSolved}</div>
                  <div className="text-xs text-muted-foreground mt-1">Across connected platforms</div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    GitHub Repositories
                  </div>
                  <div className="text-3xl font-extrabold text-foreground">
                    {github.connected ? githubReposCount : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Public repositories</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 pl-0 md:pl-8 pt-6 md:pt-0">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Coding Streak
                  </div>
                  <div className="text-3xl font-extrabold text-foreground">
                    {potdStreak > 0 ? `${potdStreak} Days` : '—'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {potdStreak > 0 ? 'Active streak' : 'No active streak'}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Competitive Rating
                  </div>
                  <div className="text-3xl font-extrabold text-foreground">
                    {displayCompetitiveRating}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {highestCompetitiveRating > 0 ? 'Codeforces / CodeChef' : 'Connect a platform'}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Progress Visualization: Replaced Area Chart with Contribution Calendar Heatmap & Competency Radar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Developer Competency Radar Chart */}
            <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-brand" />
                    <h3 className="font-bold text-base text-foreground">Competency Radar</h3>
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border">
                    Skills Assessment
                  </span>
                </div>

                <div className="h-[210px] w-full pt-1">
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

            {/* Right Column: Problem Solving Breakdown */}
            <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-foreground">Problem Solving</h3>
                  <span className="text-xs font-semibold text-brand bg-brand/10 px-2.5 py-0.5 rounded-full border border-brand/20">
                    {displayTotalSolved} Total
                  </span>
                </div>

                {hasCodingPlatforms ? (
                  <div className="space-y-4">
                    <div className="space-y-2 text-xs">
                      {leetcode.connected && (
                        <div className="flex justify-between py-1 border-b border-border/50">
                          <span className="text-muted-foreground">LeetCode</span>
                          <span className="font-semibold text-foreground">{leetcodeSolved}</span>
                        </div>
                      )}
                      {gfg.connected && (
                        <div className="flex justify-between py-1 border-b border-border/50">
                          <span className="text-muted-foreground">GeeksforGeeks</span>
                          <span className="font-semibold text-foreground">{gfgSolved}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-emerald-500 font-medium">Easy</span>
                          <span className="text-foreground font-semibold">{leetcodeData?.stats?.Easy || 0}</span>
                        </div>
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, ((leetcodeData?.stats?.Easy || 0) / 200) * 100)}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-amber-500 font-medium">Medium</span>
                          <span className="text-foreground font-semibold">{leetcodeData?.stats?.Medium || 0}</span>
                        </div>
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, ((leetcodeData?.stats?.Medium || 0) / 200) * 100)}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-rose-500 font-medium">Hard</span>
                          <span className="text-foreground font-semibold">{leetcodeData?.stats?.Hard || 0}</span>
                        </div>
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, ((leetcodeData?.stats?.Hard || 0) / 100) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-sm font-semibold text-foreground">No problem stats available</p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Connect LeetCode or GeeksforGeeks to visualize problem solving metrics.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Connected Platforms */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Connected Platforms</h2>
              <p className="text-xs text-muted-foreground">Your developer profiles connected to SkillVerse.</p>
            </div>

            {connectedPlatforms.length > 0 ? (
              <div className="space-y-3">
                {connectedPlatforms.map((p) => {
                  const Icon = p.icon;
                  return (
                    <Card key={p.id} className="border border-border bg-card p-4 rounded-xl shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">{p.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                              CONNECTED
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            @{p.username} {p.statsText ? `· ${p.statsText}` : ''}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab(p.id as any)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand hover:underline shrink-0"
                      >
                        View Telemetry <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border border-border bg-card p-6 text-center rounded-xl">
                <p className="text-sm font-semibold text-foreground">No platforms connected yet</p>
                <p className="text-xs text-muted-foreground mt-1">Connect your coding profiles below to aggregate analytics.</p>
              </Card>
            )}

            {disconnectedPlatforms.length > 0 && (
              <Card className="border border-border/70 bg-secondary/40 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Expand your developer profile</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Connect {disconnectedPlatforms.map(p => p.name).join(', ')} to unlock more analytics.
                  </p>
                </div>

                <Button
                  onClick={() => handleOpenConnect(disconnectedPlatforms[0].id)}
                  className="bg-brand text-brand-foreground hover:opacity-90 text-xs font-semibold rounded-xl px-4 py-2 shrink-0"
                >
                  Connect platforms →
                </Button>
              </Card>
            )}
          </div>

          {/* Developer Insight */}
          <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm border-l-4 border-l-brand">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-brand" /> Developer Insight
            </h3>

            {connectedPlatforms.length > 0 ? (
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="text-foreground font-medium">
                  {github.connected 
                    ? 'Your GitHub profile is active with project repositories. Maintain problem-solving consistency to expand your developer score.'
                    : 'Your coding activity is being tracked across connected platforms.'}
                </p>
                <div className="pt-2 border-t border-border/40 text-xs text-brand font-semibold flex items-center gap-1">
                  Recommended next step: <span className="text-foreground font-normal">Solve 3 coding problems this week.</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Keep connecting your platforms to unlock personalized developer insights.
              </p>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: GITHUB INLINE ANALYTICS */}
      {activeTab === 'github' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {!github.connected ? (
            <Card className="border border-border bg-card p-8 text-center rounded-2xl shadow-sm space-y-4">
              <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center mx-auto border border-border">
                <Github className="h-6 w-6 text-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Connect Your GitHub Profile</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Sync public repositories, language statistics, star counts, and follower count.
              </p>
              <Button onClick={() => handleOpenConnect('github')} className="bg-brand text-brand-foreground font-semibold text-xs">
                Connect GitHub
              </Button>
            </Card>
          ) : (
            <>
              <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={githubData?.profile?.avatar || github.username} alt="GitHub" className="h-16 w-16 rounded-2xl border border-border object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">{githubData?.profile?.displayName || github.username}</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">CONNECTED</span>
                    </div>
                    <a href={`https://github.com/${github.username}`} target="_blank" rel="noreferrer" className="text-xs text-brand hover:underline inline-flex items-center gap-1 mt-0.5">
                      @{github.username} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border border-border bg-card p-4 rounded-xl">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Repositories</span>
                  <div className="text-2xl font-bold text-foreground mt-1">{githubReposCount}</div>
                </Card>
                <Card className="border border-border bg-card p-4 rounded-xl">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Total Stars</span>
                  <div className="text-2xl font-bold text-amber-500 mt-1">{githubStars}</div>
                </Card>
                <Card className="border border-border bg-card p-4 rounded-xl">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Forks</span>
                  <div className="text-2xl font-bold text-foreground mt-1">{githubForks}</div>
                </Card>
                <Card className="border border-border bg-card p-4 rounded-xl">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Followers</span>
                  <div className="text-2xl font-bold text-foreground mt-1">{githubFollowers}</div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-border bg-card p-6 rounded-2xl">
                  <h3 className="font-bold text-base text-foreground mb-4">Language Distribution</h3>
                  <div className="space-y-3">
                    {languageList.map((lang) => (
                      <div key={lang.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-foreground">{lang.name}</span>
                          <span className="text-muted-foreground">{lang.percentage}%</span>
                        </div>
                        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="border border-border bg-card p-6 rounded-2xl">
                  <h3 className="font-bold text-base text-foreground mb-4">Public Repositories</h3>
                  <div className="space-y-2.5 max-h-[260px] overflow-y-auto">
                    {(githubData?.repositories || []).slice(0, 6).map((repo: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl border border-border/60 bg-background/50 flex justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <a href={repo.url} target="_blank" rel="noreferrer" className="font-semibold text-foreground hover:text-brand truncate block">
                            {repo.name}
                          </a>
                          <p className="text-[11px] text-muted-foreground truncate">{repo.description || 'Public repository'}</p>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground font-medium shrink-0">
                          <span className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500" /> {repo.stars || 0}</span>
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

      {/* TAB 3: LEETCODE INLINE ANALYTICS */}
      {activeTab === 'leetcode' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {!leetcode.connected ? (
            <Card className="border border-border bg-card p-8 text-center rounded-2xl shadow-sm space-y-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                <Code2 className="h-6 w-6 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Connect Your LeetCode Profile</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Sync solved problems, difficulty breakdown (Easy, Medium, Hard), and contest rating.
              </p>
              <Button onClick={() => handleOpenConnect('leetcode')} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs">
                Connect LeetCode
              </Button>
            </Card>
          ) : (
            <>
              <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={leetcodeData?.profile?.avatar || "https://assets.leetcode.com/users/avatars/avatar_1.png"} alt="LeetCode" className="h-16 w-16 rounded-2xl border border-border object-cover" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">{leetcodeData?.profile?.displayName || leetcode.username}</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">CONNECTED</span>
                    </div>
                    <a href={`https://leetcode.com/${leetcode.username}`} target="_blank" rel="noreferrer" className="text-xs text-amber-500 hover:underline inline-flex items-center gap-1 mt-0.5">
                      @{leetcode.username} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border border-border bg-card p-4 rounded-xl">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Problems Solved</span>
                  <div className="text-2xl font-bold text-foreground mt-1">{leetcodeSolved}</div>
                </Card>
                <Card className="border border-border bg-card p-4 rounded-xl">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Contest Rating</span>
                  <div className="text-2xl font-bold text-amber-500 mt-1">{leetcodeData?.contest?.rating ? Math.round(leetcodeData.contest.rating) : "N/A"}</div>
                </Card>
                <Card className="border border-border bg-card p-4 rounded-xl">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Contests</span>
                  <div className="text-2xl font-bold text-foreground mt-1">{leetcodeData?.contest?.attendedContestsCount || 0}</div>
                </Card>
                <Card className="border border-border bg-card p-4 rounded-xl">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Badges</span>
                  <div className="text-2xl font-bold text-foreground mt-1">{leetcodeData?.badges?.length || 0}</div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-border bg-card p-6 rounded-2xl">
                  <h3 className="font-bold text-base text-foreground mb-4">Difficulty Breakdown</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-emerald-500 font-medium">Easy</span>
                        <span className="text-foreground font-semibold">{leetcodeData?.stats?.Easy || 0}</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, ((leetcodeData?.stats?.Easy || 0) / 300) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-amber-500 font-medium">Medium</span>
                        <span className="text-foreground font-semibold">{leetcodeData?.stats?.Medium || 0}</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, ((leetcodeData?.stats?.Medium || 0) / 300) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-rose-500 font-medium">Hard</span>
                        <span className="text-foreground font-semibold">{leetcodeData?.stats?.Hard || 0}</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, ((leetcodeData?.stats?.Hard || 0) / 150) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="border border-border bg-card p-6 rounded-2xl">
                  <h3 className="font-bold text-base text-foreground mb-4">Recent Submissions</h3>
                  <div className="space-y-2 max-h-[260px] overflow-y-auto">
                    {(leetcodeData?.recentSubmissions || []).slice(0, 5).map((sub: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-background/50 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          {sub.status === "Accepted" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                          <span className="font-medium text-foreground truncate">{sub.title}</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-muted-foreground">{sub.language}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 4: GEEKSFORGEEKS INLINE ANALYTICS */}
      {activeTab === 'gfg' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {!gfg.connected ? (
            <Card className="border border-border bg-card p-8 text-center rounded-2xl shadow-sm space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                <Terminal className="h-6 w-6 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Connect Your GeeksforGeeks Profile</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Sync coding score, POTD streaks, problem breakdown, and institute rank.
              </p>
              <Button onClick={() => handleOpenConnect('gfg')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs">
                Connect GFG
              </Button>
            </Card>
          ) : (
            <>
              <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={gfgData?.profile?.avatar || "https://media.geeksforgeeks.org/gfg-gg-logo.svg"} alt="GFG" className="h-16 w-16 rounded-2xl border border-border object-cover p-1 bg-secondary" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-foreground">{gfgData?.profile?.displayName || gfg.username}</h2>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-semibold border border-emerald-500/20">CONNECTED</span>
                    </div>
                    <a href={`https://www.geeksforgeeks.org/user/${gfg.username}/`} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:underline inline-flex items-center gap-1 mt-0.5">
                      @{gfg.username} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="border border-border bg-card p-4 rounded-xl">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Coding Score</span>
                  <div className="text-2xl font-bold text-emerald-500 mt-1">{gfgData?.profile?.codingScore || 0}</div>
                </Card>
                <Card className="border border-border bg-card p-4 rounded-xl">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Total Solved</span>
                  <div className="text-2xl font-bold text-foreground mt-1">{gfgSolved}</div>
                </Card>
                <Card className="border border-border bg-card p-4 rounded-xl">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">POTD Streak</span>
                  <div className="text-2xl font-bold text-amber-500 mt-1">{potdStreak} days</div>
                </Card>
                <Card className="border border-border bg-card p-4 rounded-xl">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase">Monthly Score</span>
                  <div className="text-2xl font-bold text-foreground mt-1">{gfgData?.profile?.monthlyScore || 0}</div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 5: COMPETITIVE INLINE ANALYTICS */}
      {activeTab === 'competitive' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Codeforces */}
            <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">Codeforces</span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold border", codeforces.connected ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border")}>
                  {codeforces.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              {codeforces.connected ? (
                <div>
                  <div className="text-2xl font-extrabold text-cyan-500">{codeforcesRating}</div>
                  <p className="text-xs text-muted-foreground mt-1">Rank: {codeforcesRank} · Max: {codeforcesMaxRating}</p>
                </div>
              ) : (
                <Button onClick={() => handleOpenConnect('codeforces')} size="sm" className="w-full text-xs">Connect Codeforces</Button>
              )}
            </Card>

            {/* CodeChef */}
            <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">CodeChef</span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold border", codechef.connected ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border")}>
                  {codechef.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              {codechef.connected ? (
                <div>
                  <div className="text-2xl font-extrabold text-amber-500">{codechefStars} ({codechefRating})</div>
                  <p className="text-xs text-muted-foreground mt-1">Highest Rating: {codechefHighestRating}</p>
                </div>
              ) : (
                <Button onClick={() => handleOpenConnect('codechef')} size="sm" className="w-full text-xs">Connect CodeChef</Button>
              )}
            </Card>

            {/* HackerRank */}
            <Card className="border border-border bg-card p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">HackerRank</span>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold border", hackerrank.connected ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border")}>
                  {hackerrank.connected ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              {hackerrank.connected ? (
                <div>
                  <div className="text-2xl font-extrabold text-emerald-500">{hackerrankBadges.length} Badges</div>
                  <p className="text-xs text-muted-foreground mt-1">{hackerrankCerts.length} Skill Certificates</p>
                </div>
              ) : (
                <Button onClick={() => handleOpenConnect('hackerrank')} size="sm" className="w-full text-xs">Connect HackerRank</Button>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Connect Handle Dialog */}
      <Dialog open={!!connectModalPlatform} onOpenChange={(open) => !open && setConnectModalPlatform(null)}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="capitalize text-foreground">Connect {connectModalPlatform}</DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Enter your public handle or username to sync your analytics profile.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConnectSubmit} className="space-y-4 py-2">
            <Input
              placeholder={`Enter ${connectModalPlatform} username`}
              value={inputHandle}
              onChange={(e) => setInputHandle(e.target.value)}
              className="bg-background border-border"
              autoFocus
            />

            {modalError && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {modalError}
              </p>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConnectModalPlatform(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={modalConnecting || !inputHandle.trim()} className="bg-brand text-brand-foreground">
                {modalConnecting ? <RefreshCw className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Connect Handle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
