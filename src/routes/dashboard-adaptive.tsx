/**
 * Adaptive Career Dashboard
 * Premium, intelligent, adaptive dashboard that automatically adjusts based on connected platforms
 */

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { useInitialSync } from "@/lib/auto-sync";
import {
  WelcomeHeader,
  QuickActions,
  ConnectedPlatforms,
  UnifiedActivityFeed,
  AIInsights,
  WeeklyProgress,
  SkillsIntelligence,
  ResumeStatus,
  CareerGoals,
  Notifications,
  OnboardingCard,
  WelcomeHeaderSkeleton,
  QuickActionsSkeleton,
  ConnectedPlatformsSkeleton,
  ActivityFeedSkeleton,
  AIInsightsSkeleton,
  WeeklyProgressSkeleton,
  SkillsIntelligenceSkeleton,
  ResumeStatusSkeleton,
  CareerGoalsSkeleton,
  NotificationsSkeleton,
  LazyWidget,
} from "@/components/dashboard";
import { dashboardCache, cacheKeys, invalidateUserCache } from "@/lib/dashboard-cache";
import {
  getAdaptiveLayout,
  generatePlatformGoals,
  generateAIInsights,
  mergeActivities,
  shouldShowSkillsIntelligence,
  shouldShowResumeStatus,
  shouldShowCareerGoals,
  shouldShowActivityFeed,
  shouldShowOnboarding,
  getConnectedPlatforms,
} from "@/lib/dashboard-utils";
import type { Platform } from "@/types/identity-hub";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard-adaptive")({
  head: () => ({
    meta: [
      { title: "Dashboard — SkillVerse" },
      {
        name: "description",
        content:
          "Your Career Command Center — AI Career Score, streaks, focus for today and personalized insights.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Dashboard — SkillVerse" },
      {
        property: "og:description",
        content: "Your daily career operating system.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <AdaptiveDashboardPage />
    </AuthGate>
  ),
});

function AdaptiveDashboardPage() {
  const { user } = useAuth();
  const { profile, completion, missing, hydrated: profileHydrated } = useProfile();
  const { connections, syncAll, isSyncing, isLoading: connectionsLoading } = useIdentityHub();
  const first = user?.name?.split(" ")[0] ?? "there";

  // Initialize sync on mount
  useInitialSync();

  // Debug logging
  console.log('Dashboard Data:', {
    user: user?.id,
    profileHydrated,
    connectionsLoading,
    connections,
    profile,
    completion
  });

  const isLoading = !profileHydrated || connectionsLoading;

  // Cache invalidation on sync
  const handleSyncAll = async () => {
    if (user?.id) {
      invalidateUserCache(user.id);
    }
    await syncAll();
  };

  // Get adaptive layout configuration
  const layout = getAdaptiveLayout(connections);

  // Generate platform-specific goals
  const careerGoals = layout.showCareerGoals
    ? getConnectedPlatforms(connections).flatMap((platform) =>
        generatePlatformGoals(platform)
      )
    : [];

  // Generate AI insights
  const aiInsights = generateAIInsights(connections);

  // Mock weekly progress data (would come from actual data)
  const weeklyProgress = layout.totalPlatforms > 0
    ? getConnectedPlatforms(connections).map((platform) => {
        const platformHash = platform.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return {
          platform,
          metric: "Activity Score",
          value: (750 + (platformHash % 200)).toString(),
          change: (platformHash % 20) - 5,
          changeType: (platformHash % 3 === 0 ? "increase" : platformHash % 3 === 1 ? "decrease" : "neutral") as "increase" | "decrease" | "neutral",
          period: "This week",
        };
      })
    : [];

  // Mock skills data (would come from actual skills aggregation)
  const skills = layout.totalPlatforms > 0
    ? [
        { name: "React", category: "frontend" as const, proficiency: 90, source: "github" },
        { name: "TypeScript", category: "frontend" as const, proficiency: 85, source: "github" },
        { name: "Node.js", category: "backend" as const, proficiency: 80, source: "github" },
        { name: "Python", category: "backend" as const, proficiency: 75, source: "leetcode" },
        { name: "PostgreSQL", category: "database" as const, proficiency: 70, source: "github" },
        { name: "AWS", category: "devops" as const, proficiency: 65, source: "github" },
      ]
    : [];

  // Mock unified activity data (would come from actual activity aggregation)
  const unifiedActivities = layout.showActivityFeed
    ? [
        {
          id: "1",
          type: "commit" as const,
          title: "GitHub Sync",
          description: "Pushed 3 commits to skillverse-portfolio",
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          platform: "github" as Platform,
        },
        {
          id: "2",
          type: "problem_solved" as const,
          title: "LeetCode Problem",
          description: "Solved 'Two Sum' (Easy)",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          platform: "leetcode" as Platform,
        },
        {
          id: "3",
          type: "contest" as const,
          title: "Codeforces Round",
          description: "Participated in Weekly Contest 345",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          platform: "codeforces" as Platform,
        },
      ]
    : [];

  // Mock notifications (would come from actual notification system)
  const notifications = [
    {
      id: "1",
      type: "success" as const,
      title: "Profile Updated",
      message: "Your profile has been successfully updated",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
    },
    {
      id: "2",
      type: "info" as const,
      title: "New Feature",
      message: "AI Resume Generator is now available",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: false,
      actionUrl: "/resume?ai=true",
      actionLabel: "Try it now",
    },
  ];

  // Mock resume status
  const resumeStatus = {
    atsScore: Math.min(100, Math.round(completion * 0.8 + Math.random() * 10)),
    missingSkills: completion < 80 ? ["Docker", "Kubernetes", "GraphQL"] : [],
    missingProjects: completion < 80 ? ["E-commerce Platform", "Real-time Chat App"] : [],
    resumeCompletion: completion,
  };

  // Calculate real career score based on actual data
  const calculateCareerScore = () => {
    const connectedCount = getConnectedPlatforms(connections).length;
    const projectCount = profile?.projects?.length || 0;
    const skillCount = profile?.skills.split(',').filter(s => s.trim()).length || 0;
    const experienceCount = profile?.experience?.length || 0;
    
    // Weighted calculation
    const profileScore = completion;
    const platformScore = Math.min(100, connectedCount * 20);
    const projectScore = Math.min(100, projectCount * 15);
    const skillScore = Math.min(100, skillCount * 8);
    const experienceScore = Math.min(100, experienceCount * 15);
    
    const overallScore = Math.round(
      (profileScore * 0.3) + 
      (platformScore * 0.2) + 
      (projectScore * 0.2) + 
      (skillScore * 0.15) + 
      (experienceScore * 0.15)
    );
    
    return overallScore;
  };

  const careerScore = calculateCareerScore();

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Header */}
        <div className="mb-6">
          {isLoading ? (
            <WelcomeHeaderSkeleton />
          ) : (
            <WelcomeHeader
              name={first}
              avatar={user?.photoURL}
              careerScore={layout.totalPlatforms > 0 ? careerScore : undefined}
              profileCompletion={completion}
              resumeCompletion={completion}
              lastSynced={connections[0]?.lastSynced}
              connectedPlatforms={layout.totalPlatforms}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          {isLoading ? (
            <QuickActionsSkeleton />
          ) : (
            <QuickActions
              onSyncAll={handleSyncAll}
              isSyncing={isSyncing}
              showAIResume={true}
            />
          )}
        </div>

        {/* Onboarding Card (shown when no platforms connected) */}
        {isLoading ? (
          <div className="mb-6">
            <ConnectedPlatformsSkeleton />
          </div>
        ) : layout.showOnboarding ? (
          <div className="mb-6">
            <OnboardingCard />
          </div>
        ) : (
          <div className="mb-6">
            <ConnectedPlatforms
              connections={connections}
              onPlatformClick={(platform) => console.log("Platform clicked:", platform)}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Primary Widgets */}
          <div className="space-y-6 lg:col-span-2">
            {/* Unified Activity Feed */}
            {isLoading ? (
              <ActivityFeedSkeleton />
            ) : layout.showActivityFeed ? (
              <UnifiedActivityFeed
                activities={unifiedActivities}
                onActivityClick={(activity) => console.log("Activity clicked:", activity)}
              />
            ) : null}

            {/* Weekly Progress */}
            {isLoading ? (
              <WeeklyProgressSkeleton />
            ) : weeklyProgress.length > 0 ? (
              <WeeklyProgress
                progressData={weeklyProgress}
                onPlatformClick={(platform) => console.log("Platform clicked:", platform)}
              />
            ) : null}

            {/* Career Goals */}
            {isLoading ? (
              <CareerGoalsSkeleton />
            ) : layout.showCareerGoals && careerGoals.length > 0 ? (
              <CareerGoals
                goals={careerGoals}
                onToggleGoal={(id) => console.log("Goal toggled:", id)}
                onAddGoal={() => console.log("Add goal clicked")}
                onPlatformClick={(platform) => console.log("Platform clicked:", platform)}
              />
            ) : null}
          </div>

          {/* Right Column - Secondary Widgets */}
          <div className="space-y-6">
            {/* AI Insights */}
            {isLoading ? (
              <AIInsightsSkeleton />
            ) : aiInsights.length > 0 ? (
              <LazyWidget threshold={0.1} rootMargin="100px">
                <AIInsights
                  insights={aiInsights}
                  onInsightClick={(insight) => console.log("Insight clicked:", insight)}
                />
              </LazyWidget>
            ) : null}

            {/* Skills Intelligence */}
            {isLoading ? (
              <SkillsIntelligenceSkeleton />
            ) : shouldShowSkillsIntelligence(skills) ? (
              <LazyWidget threshold={0.1} rootMargin="100px">
                <SkillsIntelligence
                  skills={skills}
                  onSkillClick={(skill) => console.log("Skill clicked:", skill)}
                />
              </LazyWidget>
            ) : null}

            {/* Resume Status */}
            {isLoading ? (
              <ResumeStatusSkeleton />
            ) : shouldShowResumeStatus(resumeStatus.resumeCompletion) ? (
              <LazyWidget threshold={0.1} rootMargin="100px">
                <ResumeStatus
                  atsScore={resumeStatus.atsScore}
                  missingSkills={resumeStatus.missingSkills}
                  missingProjects={resumeStatus.missingProjects}
                  resumeCompletion={resumeStatus.resumeCompletion}
                />
              </LazyWidget>
            ) : null}

            {/* Notifications */}
            {isLoading ? (
              <NotificationsSkeleton />
            ) : (
              <LazyWidget threshold={0.1} rootMargin="100px">
                <Notifications
                  notifications={notifications}
                  onMarkAsRead={(id) => console.log("Mark as read:", id)}
                  onDismiss={(id) => console.log("Dismiss:", id)}
                  onActionClick={(notification) => console.log("Action clicked:", notification)}
                />
              </LazyWidget>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
