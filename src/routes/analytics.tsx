import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { usePlatformStore } from '@/lib/platform-store';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Github, Code2, TrendingUp, Award, Calendar, 
  Zap, Target, Flame, Clock, Star, GitFork 
} from 'lucide-react';

export const Route = createFileRoute('/analytics')({
  component: AnalyticsPage,
});

const COLORS = ['#F97316', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];

function AnalyticsPage() {
  const { user } = useAuth();
  const { 
    githubData, 
    leetcodeData, 
    fetchAnalyticsData, 
    isLoading 
  } = usePlatformStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAnalyticsData(user.id)
        .then(data => setAnalytics(data))
        .catch(err => {
          console.error('Failed to fetch analytics:', err);
          setError(err.message || 'Failed to load analytics');
        });
    }
  }, [user?.id, fetchAnalyticsData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <p className="text-muted-foreground">Please try connecting your platforms first.</p>
        </div>
      </div>
    );
  }

  const hasGitHubData = analytics?.github;
  const hasLeetCodeData = analytics?.leetcode;
  const hasCombinedData = analytics?.combined;

  if (!hasGitHubData && !hasLeetCodeData && !hasCombinedData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b border-border bg-gradient-to-r from-background to-muted/20">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Comprehensive insights from your connected platforms
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-muted/30 rounded-full mb-6">
              <Code2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">No Analytics Data Available</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your coding platforms (GitHub, LeetCode, etc.) to see comprehensive analytics and insights about your coding journey.
            </p>
            <a
              href="/connections"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-brand-foreground rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              <Target className="h-4 w-4" />
              Connect Platforms
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Comprehensive insights from your connected platforms
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* GitHub Analytics Section */}
        {analytics.github && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                <Github className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">GitHub Analytics</h2>
                <p className="text-sm text-muted-foreground">Repository and contribution insights</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Star className="h-4 w-4" />
                  <span className="text-xs">Total Stars</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.github.totalStars}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <GitFork className="h-4 w-4" />
                  <span className="text-xs">Total Forks</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.github.totalForks}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Github className="h-4 w-4" />
                  <span className="text-xs">Followers</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.github.followers}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Award className="h-4 w-4" />
                  <span className="text-xs">Dev Score</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.github.developerScore}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Language Distribution */}
              <div className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Language Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.github.languageDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ language, percentage }) => `${language} ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.github.languageDistribution.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Top Languages */}
              <div className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Top Languages</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.github.topLanguages}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="language" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--brand)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Repository Growth */}
            <div className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Repository Growth (by Stars)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.github.repositoryGrowth.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Bar dataKey="stars" fill="var(--brand)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* LeetCode Analytics Section */}
        {analytics.leetcode && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">LeetCode Analytics</h2>
                <p className="text-sm text-muted-foreground">Problem-solving and contest performance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Target className="h-4 w-4" />
                  <span className="text-xs">Total Solved</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.leetcode.difficultyDistribution[0].count}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Contest Rating</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.leetcode.contestData.rating}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Award className="h-4 w-4" />
                  <span className="text-xs">Global Ranking</span>
                </div>
                <p className="text-2xl font-bold text-foreground">#{analytics.leetcode.contestData.ranking}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs">Coding Score</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.leetcode.codingScore}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Difficulty Distribution */}
              <div className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Difficulty Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.leetcode.difficultyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="difficulty" stroke="var(--muted-foreground)" />
                    <YAxis stroke="var(--muted-foreground)" />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--brand)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Acceptance Rate */}
              <div className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Acceptance Rate</h3>
                <div className="flex items-center justify-center h-[300px]">
                  <div className="text-center">
                    <p className="text-6xl font-bold text-gradient">{analytics.leetcode.acceptanceRate}%</p>
                    <p className="text-sm text-muted-foreground mt-2">Overall Acceptance</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submission Timeline */}
            <div className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Submissions</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.leetcode.submissionTimeline.slice(0, 20)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                  <YAxis stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="status" stroke="var(--brand)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Badges */}
            {analytics.leetcode.badges.length > 0 && (
              <div className="p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">Achievements</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {analytics.leetcode.badges.map((badge: any) => (
                    <div key={badge.id} className="p-4 bg-background rounded-xl border border-border/50 text-center">
                      <div className="text-3xl mb-2">{badge.icon}</div>
                      <p className="text-sm font-medium text-foreground">{badge.displayName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Combined Analytics */}
        {analytics.combined && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-strong rounded-xl flex items-center justify-center">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">Combined Insights</h2>
                <p className="text-sm text-muted-foreground">Cross-platform performance metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Target className="h-4 w-4" />
                  <span className="text-xs">Career Readiness</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.combined.careerReadiness}%</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs">Activity Score</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.combined.activityScore}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs">Learning Progress</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.combined.learningProgress}%</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl border border-border/50 shadow-sm">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Award className="h-4 w-4" />
                  <span className="text-xs">Profile Strength</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{analytics.combined.profileStrength}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
