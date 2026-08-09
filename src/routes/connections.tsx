import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePlatformStore } from '@/lib/platform-store';
import { useIdentityHub } from '@/lib/identity-hub-context';
import { RefreshCw, X, Link as LinkIcon, Clock, CheckCircle, AlertCircle, Plus, Code2, BookOpen, Zap, Trophy, Award, Loader2, ArrowRight, Shield, TrendingUp, Star } from 'lucide-react';
import { PageShell } from '@/components/SiteChrome';
import { AuthGate } from '@/components/AuthGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export const Route = createFileRoute('/connections')({
  component: () => (
    <AuthGate>
      <ConnectionsPage />
    </AuthGate>
  ),
});

function ConnectionsPage() {
  const { user } = useAuth();
  const {
    github,
    leetcode,
    gfg,
    codeforces,
    codechef,
    hackerrank,
    githubData,
    leetcodeData,
    gfgData,
    codeforcesData,
    codechefData,
    hackerrankData,
    isLoading,
    isSyncing,
    error,
    validateGitHubUsername,
    connectGitHub,
    syncGitHub,
    disconnectGitHub,
    validateLeetCodeUsername,
    connectLeetCode,
    syncLeetCode,
    disconnectLeetCode,
    validateGFGUsername,
    connectGFG,
    syncGFG,
    disconnectGFG,
    validateCodeforcesUsername,
    connectCodeforces,
    syncCodeforces,
    disconnectCodeforces,
    validateCodeChefUsername,
    connectCodeChef,
    syncCodeChef,
    disconnectCodeChef,
    validateHackerRankUsername,
    connectHackerRank,
    syncHackerRank,
    disconnectHackerRank,
    fetchDashboardData,
    clearError,
  } = usePlatformStore();
  const { refreshConnections } = useIdentityHub();

  const [githubUsername, setGithubUsername] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [gfgUsername, setGfgUsername] = useState('');
  const [codeforcesUsername, setCodeforcesUsername] = useState('');
  const [codechefUsername, setCodechefUsername] = useState('');
  const [hackerrankUsername, setHackerrankUsername] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  // Animation states
  const [mounted, setMounted] = useState(false);
  
  // Load connections and data on mount
  useEffect(() => {
    setMounted(true);
    if (user?.id) {
      fetchDashboardData(user.id);
      refreshConnections();
    }
  }, [user?.id]);

  // Handler functions - must be defined before platforms array
  const handleGitHubConnect = async () => {
    if (!githubUsername.trim() || !user?.id) return;

    console.log('[GitHub Connect] Attempting to connect with username:', githubUsername);
    setIsValidating(true);
    clearError();

    try {
      await validateGitHubUsername(githubUsername);
      await connectGitHub(user.id, githubUsername);
      await refreshConnections();
      setGithubUsername('');
      console.log('[GitHub Connect] Connection successful, refreshed connections.');
    } catch (err) {
      console.error('GitHub connection failed:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleLeetCodeConnect = async () => {
    if (!leetcodeUsername.trim() || !user?.id) return;
    
    setIsValidating(true);
    clearError();
    
    try {
      await validateLeetCodeUsername(leetcodeUsername);
      await connectLeetCode(user.id, leetcodeUsername);
      await refreshConnections();
      setLeetcodeUsername('');
    } catch (err) {
      console.error('LeetCode connection failed:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleGFGConnect = async () => {
    if (!gfgUsername.trim() || !user?.id) return;
    
    setIsValidating(true);
    clearError();
    
    try {
      await validateGFGUsername(gfgUsername);
      await connectGFG(user.id, gfgUsername);
      await refreshConnections();
      setGfgUsername('');
    } catch (err) {
      console.error('GFG connection failed:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCodeforcesConnect = async () => {
    if (!codeforcesUsername.trim() || !user?.id) return;
    
    setIsValidating(true);
    clearError();
    
    try {
      await validateCodeforcesUsername(codeforcesUsername);
      await connectCodeforces(user.id, codeforcesUsername);
      await refreshConnections();
      setCodeforcesUsername('');
    } catch (err) {
      console.error('Codeforces connection failed:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCodeChefConnect = async () => {
    if (!codechefUsername.trim() || !user?.id) return;
    
    setIsValidating(true);
    clearError();
    
    try {
      await validateCodeChefUsername(codechefUsername);
      await connectCodeChef(user.id, codechefUsername);
      await refreshConnections();
      setCodechefUsername('');
    } catch (err) {
      console.error('CodeChef connection failed:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleHackerRankConnect = async () => {
    if (!hackerrankUsername.trim() || !user?.id) return;
    
    setIsValidating(true);
    clearError();
    
    try {
      await validateHackerRankUsername(hackerrankUsername);
      await connectHackerRank(user.id, hackerrankUsername);
      await refreshConnections();
      setHackerrankUsername('');
    } catch (err) {
      console.error('HackerRank connection failed:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleGitHubSync = async () => {
    if (!user?.id) return;
    try {
      await syncGitHub(user.id);
      await fetchDashboardData(user.id);
      await refreshConnections();
    } catch (err) {
      console.error('GitHub sync failed:', err);
    }
  };

  const handleLeetCodeSync = async () => {
    if (!user?.id) return;
    try {
      await syncLeetCode(user.id);
      await fetchDashboardData(user.id);
      await refreshConnections();
    } catch (err) {
      console.error('LeetCode sync failed:', err);
    }
  };

  const handleGFGSync = async () => {
    if (!user?.id) return;
    try {
      await syncGFG(user.id);
      await fetchDashboardData(user.id);
      await refreshConnections();
    } catch (err) {
      console.error('GFG sync failed:', err);
    }
  };

  const handleCodeforcesSync = async () => {
    if (!user?.id) return;
    try {
      await syncCodeforces(user.id);
      await fetchDashboardData(user.id);
      await refreshConnections();
    } catch (err) {
      console.error('Codeforces sync failed:', err);
    }
  };

  const handleCodeChefSync = async () => {
    if (!user?.id) return;
    try {
      await syncCodeChef(user.id);
      await fetchDashboardData(user.id);
      await refreshConnections();
    } catch (err) {
      console.error('CodeChef sync failed:', err);
    }
  };

  const handleHackerRankSync = async () => {
    if (!user?.id) return;
    try {
      await syncHackerRank(user.id);
      await fetchDashboardData(user.id);
      await refreshConnections();
    } catch (err) {
      console.error('HackerRank sync failed:', err);
    }
  };

  const platforms = [
    {
      id: 'github',
      name: 'GitHub',
      connected: github.connected,
      username: github.username,
      data: githubData,
      lastSynced: github.lastSynced,
      handleConnect: handleGitHubConnect,
      handleSync: handleGitHubSync,
      handleDisconnect: () => user?.id && disconnectGitHub(user.id),
    },
    {
      id: 'leetcode',
      name: 'LeetCode',
      connected: leetcode.connected,
      username: leetcode.username,
      data: leetcodeData,
      lastSynced: leetcode.lastSynced,
      handleConnect: handleLeetCodeConnect,
      handleSync: handleLeetCodeSync,
      handleDisconnect: () => user?.id && disconnectLeetCode(user.id),
    },
    {
      id: 'gfg',
      name: 'GeeksforGeeks',
      connected: gfg.connected,
      username: gfg.username,
      data: gfgData,
      lastSynced: gfg.lastSynced,
      handleConnect: handleGFGConnect,
      handleSync: handleGFGSync,
      handleDisconnect: () => user?.id && disconnectGFG(user.id),
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      connected: codeforces.connected,
      username: codeforces.username,
      data: codeforcesData,
      lastSynced: codeforces.lastSynced,
      handleConnect: handleCodeforcesConnect,
      handleSync: handleCodeforcesSync,
      handleDisconnect: () => user?.id && disconnectCodeforces(user.id),
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      connected: codechef.connected,
      username: codechef.username,
      data: codechefData,
      lastSynced: codechef.lastSynced,
      handleConnect: handleCodeChefConnect,
      handleSync: handleCodeChefSync,
      handleDisconnect: () => user?.id && disconnectCodeChef(user.id),
    },
    {
      id: 'hackerrank',
      name: 'HackerRank',
      connected: hackerrank.connected,
      username: hackerrank.username,
      data: hackerrankData,
      lastSynced: hackerrank.lastSynced,
      handleConnect: handleHackerRankConnect,
      handleSync: handleHackerRankSync,
      handleDisconnect: () => user?.id && disconnectHackerRank(user.id),
    },
  ];

  const connectedCount = platforms.filter(p => p.connected).length;
  const connectionProgress = (connectedCount / platforms.length) * 100;
  
  // Animation states
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  
  // Counter animation refs
  const githubReposRef = useRef(0);
  const leetcodeSolvedRef = useRef(0);
  const gfgSolvedRef = useRef(0);
  const codeforcesRatingRef = useRef(0);
  const codechefRatingRef = useRef(0);
  const hackerrankRatingRef = useRef(0);

  const formatLastSynced = (date: string | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const syncDate = new Date(date);
    const diffMs = now.getTime() - syncDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return `${Math.floor(diffMins / 1440)} days ago`;
  };

  const AnimatedCounter = ({ value, duration = 1000 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const animationRef = useRef<number>();

    useEffect(() => {
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        countRef.current = Math.floor(easeOutQuart * value);
        setCount(countRef.current);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [value, duration]);

    return <span>{count.toLocaleString()}</span>;
  };

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

        {/* Header */}
        <div className="border-b border-border/50 bg-gradient-to-r from-background via-muted/20 to-background backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between animate-fade-up">
              <div>
                <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Connections
                </h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Connect your coding platforms to unlock powerful analytics and insights
                </p>
              </div>
              
              {/* Connection Progress */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {connectedCount}/{platforms.length} Connected
                  </p>
                  <p className="text-xs text-muted-foreground">Platforms linked</p>
                </div>
                <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-gradient transition-all duration-1000 ease-out"
                    style={{ width: `${connectionProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-destructive hover:text-destructive/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Connections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* GitHub Card */}
          <div 
            className={`p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-glow hover:scale-[1.02] hover:border-brand/30 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '0ms' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#181717">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">GitHub</h3>
                  {github.connected ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Connected</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not connected</span>
                  )}
                </div>
              </div>
              {github.connected && (
                <button
                  onClick={() => user?.id && disconnectGitHub(user.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {github.connected ? (
              <div className="space-y-3">
                <div className="p-3 bg-background rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    {githubData?.profile.avatar && (
                      <img
                        src={githubData.profile.avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-xs font-medium text-foreground">{githubData?.profile.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{github.username}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{githubData?.profile.publicRepos}</p>
                      <p className="text-xs text-muted-foreground">Repos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{githubData?.profile.followers}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{githubData?.profile.following}</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>{formatLastSynced(github.lastSynced)}</span>
                  </div>
                  <button
                    onClick={handleGitHubSync}
                    disabled={isSyncing || isLoading}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-brand to-brand-strong text-white rounded-md text-xs font-medium hover:shadow-md hover:shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="Enter GitHub username"
                  className="w-full px-4 py-2.5 text-sm border border-border/50 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all duration-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleGitHubConnect()}
                  disabled={isValidating || isLoading}
                  autoFocus={false}
                />
                <button
                  onClick={handleGitHubConnect}
                  disabled={isValidating || isLoading || !githubUsername.trim()}
                  className="w-full py-2.5 text-sm font-medium bg-gradient-to-r from-brand to-brand-strong text-white rounded-lg hover:shadow-lg hover:shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-sm flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* LeetCode Card */}
          <div 
            className={`p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-glow hover:scale-[1.02] hover:border-brand/30 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <img src="/logos/LeetCode_logo_black.png" alt="LeetCode" className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">LeetCode</h3>
                  {leetcode.connected ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Connected</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not connected</span>
                  )}
                </div>
              </div>
              {leetcode.connected && (
                <button
                  onClick={() => user?.id && disconnectLeetCode(user.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {leetcode.connected ? (
              <div className="space-y-3">
                <div className="p-3 bg-background rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    {leetcodeData?.profile.avatar && (
                      <img
                        src={leetcodeData.profile.avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-xs font-medium text-foreground">{leetcodeData?.profile.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{leetcode.username}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{leetcodeData?.stats.All}</p>
                      <p className="text-xs text-muted-foreground">Solved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{leetcodeData?.contest.rating}</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{leetcodeData?.acceptanceRate.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Acceptance</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>{formatLastSynced(leetcode.lastSynced)}</span>
                  </div>
                  <button
                    onClick={handleLeetCodeSync}
                    disabled={isSyncing || isLoading}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-brand to-brand-strong text-white rounded-md text-xs font-medium hover:shadow-md hover:shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={leetcodeUsername}
                  onChange={(e) => setLeetcodeUsername(e.target.value)}
                  placeholder="Enter LeetCode username"
                  className="w-full px-4 py-2.5 text-sm border border-border/50 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all duration-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleLeetCodeConnect()}
                  disabled={isValidating || isLoading}
                  autoFocus={false}
                />
                <button
                  onClick={handleLeetCodeConnect}
                  disabled={isValidating || isLoading || !leetcodeUsername.trim()}
                  className="w-full py-2 text-sm font-medium bg-gradient-to-r from-brand to-brand-strong text-white rounded-lg hover:shadow-lg hover:shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-sm flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* GFG Card */}
          <div 
            className={`p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-glow hover:scale-[1.02] hover:border-brand/30 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <img src="/logos/GeeksForGeeks_logo.png" alt="GeeksforGeeks" className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">GeeksforGeeks</h3>
                  {gfg.connected ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Connected</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not connected</span>
                  )}
                </div>
              </div>
              {gfg.connected && (
                <button
                  onClick={() => user?.id && disconnectGFG(user.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {gfg.connected ? (
              <div className="space-y-3">
                <div className="p-3 bg-background rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    {gfgData?.profile.avatar && (
                      <img
                        src={gfgData.profile.avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-xs font-medium text-foreground">{gfgData?.profile.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{gfg.username}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{gfgData?.profile.codingScore ?? 0}</p>
                      <p className="text-[10px] text-muted-foreground">Score</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{gfgData?.profile.problemsSolved ?? 0}</p>
                      <p className="text-[10px] text-muted-foreground">Problems</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-emerald-500">{gfgData?.potd?.currentStreak ?? 0}</p>
                      <p className="text-[10px] text-muted-foreground">POTD Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{gfgData?.potd?.longestStreak ?? 0}</p>
                      <p className="text-[10px] text-muted-foreground">Max Streak</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>{formatLastSynced(gfg.lastSynced)}</span>
                  </div>
                  <button
                    onClick={handleGFGSync}
                    disabled={isSyncing || isLoading}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-brand to-brand-strong text-white rounded-md text-xs font-medium hover:shadow-md hover:shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={gfgUsername}
                  onChange={(e) => setGfgUsername(e.target.value)}
                  placeholder="Enter GFG username"
                  className="w-full px-4 py-2.5 text-sm border border-border/50 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all duration-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleGFGConnect()}
                  disabled={isValidating || isLoading}
                  autoFocus={false}
                />
                <button
                  onClick={handleGFGConnect}
                  disabled={isValidating || isLoading || !gfgUsername.trim()}
                  className="w-full py-2 text-sm font-medium bg-gradient-to-r from-brand to-brand-strong text-white rounded-lg hover:shadow-lg hover:shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-sm flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Codeforces Card */}
          <div 
            className={`p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-glow hover:scale-[1.02] hover:border-brand/30 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#1F5AC3">
                    <path d="M4.5 0h15c2.485 0 4.5 2.015 4.5 4.5v15c0 2.485-2.015 4.5-4.5 4.5h-15C2.015 24 0 21.985 0 19.5v-15C0 2.015 2.015 0 4.5 0zm7.5 4.5c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 2.25c2.071 0 3.75 1.679 3.75 3.75s-1.679 3.75-3.75 3.75S8.25 12.571 8.25 10.5 9.929 6.75 12 6.75z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Codeforces</h3>
                  {codeforces.connected ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Connected</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not connected</span>
                  )}
                </div>
              </div>
              {codeforces.connected && (
                <button
                  onClick={() => user?.id && disconnectCodeforces(user.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {codeforces.connected ? (
              <div className="space-y-3">
                <div className="p-3 bg-background rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    {codeforcesData?.profile.avatar && (
                      <img
                        src={codeforcesData.profile.avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-xs font-medium text-foreground">{codeforcesData?.profile.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{codeforces.username}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{codeforcesData?.profile.rating}</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{codeforcesData?.profile.maxRating}</p>
                      <p className="text-xs text-muted-foreground">Max</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{codeforcesData?.totalContests}</p>
                      <p className="text-xs text-muted-foreground">Contests</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>{formatLastSynced(codeforces.lastSynced)}</span>
                  </div>
                  <button
                    onClick={handleCodeforcesSync}
                    disabled={isSyncing || isLoading}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-brand to-brand-strong text-white rounded-md text-xs font-medium hover:shadow-md hover:shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={codeforcesUsername}
                  onChange={(e) => setCodeforcesUsername(e.target.value)}
                  placeholder="Enter Codeforces handle"
                  className="w-full px-3 py-2 text-sm border border-border/50 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleCodeforcesConnect()}
                  disabled={isValidating || isLoading}
                />
                <button
                  onClick={handleCodeforcesConnect}
                  disabled={isValidating || isLoading || !codeforcesUsername.trim()}
                  className="w-full py-2 text-sm font-medium bg-gradient-to-r from-brand to-brand-strong text-white rounded-lg hover:shadow-lg hover:shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-sm flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* CodeChef Card */}
          <div 
            className={`p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-glow hover:scale-[1.02] hover:border-brand/30 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="#8B4513">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">CodeChef</h3>
                  {codechef.connected ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Connected</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not connected</span>
                  )}
                </div>
              </div>
              {codechef.connected && (
                <button
                  onClick={() => user?.id && disconnectCodeChef(user.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {codechef.connected ? (
              <div className="space-y-3">
                <div className="p-3 bg-background rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    {codechefData?.profile.avatar && (
                      <img
                        src={codechefData.profile.avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div>
                      <p className="text-xs font-medium text-foreground">{codechefData?.profile.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{codechef.username}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{codechefData?.profile.currentRating}</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{codechefData?.profile.highestRating}</p>
                      <p className="text-xs text-muted-foreground">Max</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-foreground">{codechefData?.profile.globalRank}</p>
                      <p className="text-xs text-muted-foreground">Global Rank</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>{formatLastSynced(codechef.lastSynced)}</span>
                  </div>
                  <button
                    onClick={handleCodeChefSync}
                    disabled={isSyncing || isLoading}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-brand to-brand-strong text-white rounded-md text-xs font-medium hover:shadow-md hover:shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={codechefUsername}
                  onChange={(e) => setCodechefUsername(e.target.value)}
                  placeholder="Enter CodeChef handle"
                  className="w-full px-3 py-2 text-sm border border-border/50 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleCodeChefConnect()}
                  disabled={isValidating || isLoading}
                />
                <button
                  onClick={handleCodeChefConnect}
                  disabled={isValidating || isLoading || !codechefUsername.trim()}
                  className="w-full py-2 text-sm font-medium bg-gradient-to-r from-brand to-brand-strong text-white rounded-lg hover:shadow-lg hover:shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-sm flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* HackerRank Card */}
          <div 
            className={`p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-glow hover:scale-[1.02] hover:border-brand/30 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <img src="/logos/HackerRank_logo.png" alt="HackerRank" className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">HackerRank</h3>
                  {hackerrank.connected ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Connected</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not connected</span>
                  )}
                </div>
              </div>
              {hackerrank.connected && (
                <button
                  onClick={() => user?.id && disconnectHackerRank(user.id)}
                  className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {hackerrank.connected ? (
              <div className="space-y-3">
                <div className="p-3 bg-background rounded-lg border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div>
                      <p className="text-xs font-medium text-foreground">{hackerrankData?.profile.displayName}</p>
                      <p className="text-xs text-muted-foreground">@{hackerrank.username}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>{formatLastSynced(hackerrank.lastSynced)}</span>
                  </div>
                  <button
                    onClick={handleHackerRankSync}
                    disabled={isSyncing || isLoading}
                    className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-brand to-brand-strong text-white rounded-md text-xs font-medium hover:shadow-md hover:shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={hackerrankUsername}
                  onChange={(e) => setHackerrankUsername(e.target.value)}
                  placeholder="Enter HackerRank username"
                  className="w-full px-3 py-2 text-sm border border-border/50 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-transparent transition-all duration-200"
                  onKeyDown={(e) => e.key === 'Enter' && handleHackerRankConnect()}
                  disabled={isValidating || isLoading}
                />
                <button
                  onClick={handleHackerRankConnect}
                  disabled={isValidating || isLoading || !hackerrankUsername.trim()}
                  className="w-full py-2 text-sm font-medium bg-gradient-to-r from-brand to-brand-strong text-white rounded-lg hover:shadow-lg hover:shadow-brand/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-sm flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {isValidating ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Coming Soon Cards */}
          {[
            { name: 'LinkedIn', icon: LinkIcon },
            { name: 'AtCoder', icon: Code2 },
            { name: 'Kaggle', icon: Code2 },
            { name: 'Stack Overflow', icon: Code2 },
          ].map((platform) => (
            <div
              key={platform.name}
              className="p-6 bg-muted/20 rounded-2xl border border-border/30 opacity-60"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                  <platform.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-foreground">{platform.name}</h3>
                  <span className="text-xs text-muted-foreground">Coming Soon</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </PageShell>
  );
}
