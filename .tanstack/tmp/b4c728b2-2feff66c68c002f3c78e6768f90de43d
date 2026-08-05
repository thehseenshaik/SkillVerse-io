import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePlatformStore } from '@/lib/platform-store';
import { useIdentityHub } from '@/lib/identity-hub-context';
import { RefreshCw, X, Link as LinkIcon, Clock, CheckCircle, AlertCircle, Plus, Code2, BookOpen, Zap, Trophy, Award, Loader2, ArrowRight, Shield, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { PageShell } from '@/components/SiteChrome';
import { AuthGate } from '@/components/AuthGate';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export const Route = createFileRoute('/connections-premium')({
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
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Staggered animation on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const platforms = [
    {
      id: 'github',
      name: 'GitHub',
      icon: 'github',
      color: '#181717',
      connected: github.connected,
      username: github.username,
      data: githubData,
      lastSynced: github.lastSynced,
      stats: [
        { label: 'Repos', value: githubData?.profile.publicRepos || 0 },
        { label: 'Followers', value: githubData?.profile.followers || 0 },
        { label: 'Following', value: githubData?.profile.following || 0 },
      ],
      handleConnect: () => handlePlatformConnect('github', githubUsername),
      handleSync: () => handlePlatformSync('github'),
      handleDisconnect: () => setDisconnectingPlatform('github'),
    },
    {
      id: 'leetcode',
      name: 'LeetCode',
      icon: 'leetcode',
      color: '#FFA116',
      connected: leetcode.connected,
      username: leetcode.username,
      data: leetcodeData,
      lastSynced: leetcode.lastSynced,
      stats: [
        { label: 'Solved', value: leetcodeData?.solved || 0 },
        { label: 'Contests', value: leetcodeData?.contests || 0 },
        { label: 'Rating', value: leetcodeData?.rating || 0 },
      ],
      handleConnect: () => handlePlatformConnect('leetcode', leetcodeUsername),
      handleSync: () => handlePlatformSync('leetcode'),
      handleDisconnect: () => setDisconnectingPlatform('leetcode'),
    },
    {
      id: 'gfg',
      name: 'GeeksforGeeks',
      icon: 'gfg',
      color: '#2F8D46',
      connected: gfg.connected,
      username: gfg.username,
      data: gfgData,
      lastSynced: gfg.lastSynced,
      stats: [
        { label: 'Solved', value: gfgData?.solved || 0 },
        { label: 'Contests', value: gfgData?.contests || 0 },
        { label: 'Score', value: gfgData?.score || 0 },
      ],
      handleConnect: () => handlePlatformConnect('gfg', gfgUsername),
      handleSync: () => handlePlatformSync('gfg'),
      handleDisconnect: () => setDisconnectingPlatform('gfg'),
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      icon: 'codeforces',
      color: '#B81D1D',
      connected: codeforces.connected,
      username: codeforces.username,
      data: codeforcesData,
      lastSynced: codeforces.lastSynced,
      stats: [
        { label: 'Rating', value: codeforcesData?.rating || 0 },
        { label: 'Max Rating', value: codeforcesData?.maxRating || 0 },
        { label: 'Contests', value: codeforcesData?.contests || 0 },
      ],
      handleConnect: () => handlePlatformConnect('codeforces', codeforcesUsername),
      handleSync: () => handlePlatformSync('codeforces'),
      handleDisconnect: () => setDisconnectingPlatform('codeforces'),
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      icon: 'codechef',
      color: '#5B4632',
      connected: codechef.connected,
      username: codechef.username,
      data: codechefData,
      lastSynced: codechef.lastSynced,
      stats: [
        { label: 'Rating', value: codechefData?.rating || 0 },
        { label: 'Stars', value: codechefData?.stars || 0 },
        { label: 'Contests', value: codechefData?.contests || 0 },
      ],
      handleConnect: () => handlePlatformConnect('codechef', codechefUsername),
      handleSync: () => handlePlatformSync('codechef'),
      handleDisconnect: () => setDisconnectingPlatform('codechef'),
    },
    {
      id: 'hackerrank',
      name: 'HackerRank',
      icon: 'hackerrank',
      color: '#00EA64',
      connected: hackerrank.connected,
      username: hackerrank.username,
      data: hackerrankData,
      lastSynced: hackerrank.lastSynced,
      stats: [
        { label: 'Contests', value: hackerrankData?.contests || 0 },
        { label: 'Badges', value: hackerrankData?.badges || 0 },
        { label: 'Score', value: hackerrankData?.score || 0 },
      ],
      handleConnect: () => handlePlatformConnect('hackerrank', hackerrankUsername),
      handleSync: () => handlePlatformSync('hackerrank'),
      handleDisconnect: () => setDisconnectingPlatform('hackerrank'),
    },
  ];

  const connectedCount = platforms.filter(p => p.connected).length;
  const connectionProgress = (connectedCount / platforms.length) * 100;

  const handlePlatformConnect = async (platformId: string, username: string) => {
    if (!username.trim() || !user?.id) return;
    
    setConnectingPlatform(platformId);
    setIsValidating(true);
    clearError();
    
    try {
      switch (platformId) {
        case 'github':
          await validateGitHubUsername(username);
          await connectGitHub(user.id, username);
          setGithubUsername('');
          break;
        case 'leetcode':
          await validateLeetCodeUsername(username);
          await connectLeetCode(user.id, username);
          setLeetcodeUsername('');
          break;
        case 'gfg':
          await validateGFGUsername(username);
          await connectGFG(user.id, username);
          setGfgUsername('');
          break;
        case 'codeforces':
          await validateCodeforcesUsername(username);
          await connectCodeforces(user.id, username);
          setCodeforcesUsername('');
          break;
        case 'codechef':
          await validateCodeChefUsername(username);
          await connectCodeChef(user.id, username);
          setCodechefUsername('');
          break;
        case 'hackerrank':
          await validateHackerRankUsername(username);
          await connectHackerRank(user.id, username);
          setHackerrankUsername('');
          break;
      }
      await fetchDashboardData(user.id);
      await refreshConnections();
    } catch (err) {
      console.error(`${platformId} connection failed:`, err);
    } finally {
      setConnectingPlatform(null);
      setIsValidating(false);
    }
  };

  const handlePlatformSync = async (platformId: string) => {
    if (!user?.id) return;
    
    setSyncingPlatform(platformId);
    
    try {
      switch (platformId) {
        case 'github':
          await syncGitHub(user.id);
          break;
        case 'leetcode':
          await syncLeetCode(user.id);
          break;
        case 'gfg':
          await syncGFG(user.id);
          break;
        case 'codeforces':
          await syncCodeforces(user.id);
          break;
        case 'codechef':
          await syncCodeChef(user.id);
          break;
        case 'hackerrank':
          await syncHackerRank(user.id);
          break;
      }
    } catch (err) {
      console.error(`${platformId} sync failed:`, err);
    } finally {
      setSyncingPlatform(null);
    }
  };

  const handleDisconnectConfirm = async () => {
    if (!disconnectingPlatform || !user?.id) return;
    
    try {
      switch (disconnectingPlatform) {
        case 'github':
          await disconnectGitHub(user.id);
          break;
        case 'leetcode':
          await disconnectLeetCode(user.id);
          break;
        case 'gfg':
          await disconnectGFG(user.id);
          break;
        case 'codeforces':
          await disconnectCodeforces(user.id);
          break;
        case 'codechef':
          await disconnectCodeChef(user.id);
          break;
        case 'hackerrank':
          await disconnectHackerRank(user.id);
          break;
      }
      await refreshConnections();
    } catch (err) {
      console.error(`${disconnectingPlatform} disconnect failed:`, err);
    } finally {
      setDisconnectingPlatform(null);
      setShowDisconnectModal(false);
    }
  };

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

  const getPlatformIcon = (icon: string) => {
    switch (icon) {
      case 'github':
        return (
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'leetcode':
        return <Code2 className="h-6 w-6" />;
      case 'gfg':
        return <BookOpen className="h-6 w-6" />;
      case 'codeforces':
        return <Zap className="h-6 w-6" />;
      case 'codechef':
        return <Award className="h-6 w-6" />;
      case 'hackerrank':
        return <Trophy className="h-6 w-6" />;
      default:
        return <Code2 className="h-6 w-6" />;
    }
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

  const PlatformCard = ({ platform, index }: { platform: typeof platforms[0]; index: number }) => {
    const isConnecting = connectingPlatform === platform.id;
    const isSyncing = syncingPlatform === platform.id;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <Card
        className={`group relative overflow-hidden transition-all duration-500 ease-out
          ${platform.connected 
            ? 'bg-gradient-to-br from-brand/5 via-background to-muted/10 border-brand/20 hover:border-brand/40 hover:shadow-glow' 
            : 'bg-gradient-to-br from-muted/30 to-muted/10 border-border/50 hover:border-border/80 hover:shadow-elegant'
          }
          cursor-pointer
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
        style={{
          transitionDelay: `${index * 100}ms`,
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (platform.connected) {
            window.location.href = `/dashboard?platform=${platform.id}`;
          }
        }}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        
        {/* Glow effect on hover */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-transparent animate-pulse pointer-events-none" />
        )}

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: platform.color + '20' }}
              >
                <div style={{ color: platform.color }}>
                  {getPlatformIcon(platform.icon)}
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-brand transition-colors">
                  {platform.name}
                </h3>
                {platform.connected ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Connected</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Not connected</span>
                )}
              </div>
            </div>
            
            {platform.connected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  platform.handleDisconnect();
                }}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200 hover:scale-110"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Connected State */}
          {platform.connected ? (
            <div className="space-y-4">
              {/* Profile Info */}
              <div className="p-4 bg-background/50 rounded-xl border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-3">
                  {platform.data?.profile?.avatar && (
                    <img
                      src={platform.data.profile.avatar}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full ring-2 ring-brand/20"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {platform.data?.profile?.displayName || platform.username}
                    </p>
                    <p className="text-xs text-muted-foreground">@{platform.username}</p>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/50">
                  {platform.stats.map((stat, idx) => (
                    <div key={idx} className="text-center">
                      <p className="text-lg font-bold text-foreground">
                        <AnimatedCounter value={stat.value} />
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync Action */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Last synced: {formatLastSynced(platform.lastSynced)}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    platform.handleSync();
                  }}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-brand bg-brand/10 hover:bg-brand/20 rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSyncing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" />
                      Sync
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Not Connected State */
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your {platform.name} account to track your progress and unlock analytics
              </p>
              
              <input
                type="text"
                placeholder={`${platform.name} username`}
                value={
                  platform.id === 'github' ? githubUsername :
                  platform.id === 'leetcode' ? leetcodeUsername :
                  platform.id === 'gfg' ? gfgUsername :
                  platform.id === 'codeforces' ? codeforcesUsername :
                  platform.id === 'codechef' ? codechefUsername :
                  hackerrankUsername
                }
                onChange={(e) => {
                  if (platform.id === 'github') setGithubUsername(e.target.value);
                  else if (platform.id === 'leetcode') setLeetcodeUsername(e.target.value);
                  else if (platform.id === 'gfg') setGfgUsername(e.target.value);
                  else if (platform.id === 'codeforces') setCodeforcesUsername(e.target.value);
                  else if (platform.id === 'codechef') setCodechefUsername(e.target.value);
                  else setHackerrankUsername(e.target.value);
                }}
                className="w-full px-3 py-2 text-sm bg-background border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              />
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  platform.handleConnect();
                }}
                disabled={isConnecting || isValidating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-gradient hover:shadow-glow rounded-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4" />
                    Connect {platform.name}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Chevron for navigation */}
          {platform.connected && (
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ChevronRight className="h-5 w-5 text-brand" />
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <PageShell>
      <div className="relative overflow-hidden min-h-screen">
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
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 animate-fade-up">
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
            {platforms.map((platform, index) => (
              <PlatformCard key={platform.id} platform={platform} index={index} />
            ))}
          </div>

          {/* Empty State */}
          {connectedCount === 0 && !isLoading && (
            <div className="text-center py-16 animate-fade-up">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand/10 flex items-center justify-center">
                <LinkIcon className="h-10 w-10 text-brand" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No platforms connected yet
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Connect your coding platforms to start tracking your progress and unlock powerful analytics
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      <Dialog open={showDisconnectModal} onOpenChange={setShowDisconnectModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect Platform</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect this platform? This will remove all associated data and analytics.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDisconnectModal(false);
                setDisconnectingPlatform(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnectConfirm}
            >
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
