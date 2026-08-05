/**
 * Welcome Header Widget
 * Displays greeting, avatar, career score, profile completion, resume completion, and last synced
 * Enhanced with standout score breakdown and real data visualization
 */

import { User, Award, FileText, Clock, TrendingUp, Zap, Target, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { AnimatedCounter } from "./AnimatedCounter";

interface WelcomeHeaderProps {
  name?: string;
  avatar?: string;
  careerScore?: number;
  profileCompletion?: number;
  resumeCompletion?: number;
  lastSynced?: Date;
  connectedPlatforms?: number;
  className?: string;
}

export function WelcomeHeader({
  name = "there",
  avatar,
  careerScore,
  profileCompletion,
  resumeCompletion,
  lastSynced,
  connectedPlatforms = 0,
  className,
}: WelcomeHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const greeting = getGreeting();

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-emerald-500 to-green-600";
    if (score >= 60) return "from-blue-500 to-cyan-600";
    if (score >= 40) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-rose-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Growing";
    return "Building";
  };

  const scoreColor = careerScore !== undefined ? getScoreColor(careerScore) : "from-gray-500 to-gray-600";
  const scoreLabel = careerScore !== undefined ? getScoreLabel(careerScore) : "N/A";

  return (
    <Card className={cn("p-6 relative overflow-hidden", className)}>
      {/* Background gradient for visual impact */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            {avatar ? (
              <div className="relative">
                <img
                  src={avatar}
                  alt="Avatar"
                  className="h-14 w-14 rounded-full object-cover ring-4 ring-brand/20 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shadow-md">
                  {connectedPlatforms}
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-strong text-white shadow-lg">
                  <User className="h-7 w-7" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold shadow-md">
                  {connectedPlatforms}
                </div>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {greeting}, <span className="text-gradient">{name}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Here's your career snapshot for today
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                AI-powered career intelligence platform for developers
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Score Breakdown */}
        <div className="flex flex-wrap gap-3">
          {/* Career Score - Prominent */}
          {careerScore !== undefined && (
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-brand to-brand-strong rounded-xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-white to-secondary/50 rounded-xl px-5 py-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand to-brand-strong flex items-center justify-center shadow-md">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                      <Zap className="h-2.5 w-2.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Career Score</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black bg-gradient-to-r from-brand to-brand-strong bg-clip-text text-transparent">
                        <AnimatedCounter value={careerScore} duration={1500} />
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">/100</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${scoreColor}`} />
                      <span className="text-xs font-medium text-muted-foreground">{scoreLabel}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Completion */}
          {profileCompletion !== undefined && (
            <div className="glass rounded-xl px-4 py-3 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm">
                  <User className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Profile</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">
                      <AnimatedCounter value={profileCompletion} duration={1200} />
                    </span>
                    <span className="text-xs font-bold text-brand">%</span>
                  </div>
                  <div className="h-1.5 w-16 rounded-full bg-secondary mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all duration-1000"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Resume Completion */}
          {resumeCompletion !== undefined && (
            <div className="glass rounded-xl px-4 py-3 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm">
                  <FileText className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Resume</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">
                      <AnimatedCounter value={resumeCompletion} duration={1200} />
                    </span>
                    <span className="text-xs font-bold text-brand">%</span>
                  </div>
                  <div className="h-1.5 w-16 rounded-full bg-secondary mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-600 transition-all duration-1000"
                      style={{ width: `${resumeCompletion}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Last Synced */}
          {lastSynced && (
            <div className="glass rounded-xl px-4 py-3 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-sm">
                  <Clock className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Synced</div>
                  <div className="text-sm font-bold text-foreground">
                    {formatDistanceToNow(lastSynced, { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
