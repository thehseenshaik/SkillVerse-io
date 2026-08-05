import { Achievement, type AchievementTimeline } from "@/types/identity-hub";
import { achievementAggregator } from "@/lib/services/achievement-aggregator";
import { Trophy, Medal, Award, Star, Calendar } from "lucide-react";

interface AchievementTimelineProps {
  achievements: Achievement[];
}

export function AchievementTimeline({
  achievements,
}: AchievementTimelineProps) {
  const timeline = achievementAggregator.createTimeline(achievements);
  const stats = achievementAggregator.getStatistics(achievements);

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Total"
          value={stats.total}
        />
        <StatCard
          icon={<Star className="h-5 w-5" />}
          label="Recent (30d)"
          value={stats.recent}
        />
        <StatCard
          icon={<Medal className="h-5 w-5" />}
          label="Badges"
          value={stats.byType.badge || 0}
        />
        <StatCard
          icon={<Award className="h-5 w-5" />}
          label="Certifications"
          value={stats.byType.certification || 0}
        />
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Achievement Timeline</h3>
        <div className="relative space-y-6">
          {timeline.map((item, index) => (
            <TimelineItem key={index} timelineItem={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function TimelineItem({ timelineItem }: { timelineItem: AchievementTimeline }) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getIconForType = (type: Achievement["type"]) => {
    switch (type) {
      case "badge":
        return <Award className="h-4 w-4" />;
      case "certification":
        return <Trophy className="h-4 w-4" />;
      case "milestone":
        return <Star className="h-4 w-4" />;
      case "medal":
        return <Medal className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  return (
    <div className="relative pl-6">
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
      {/* Timeline dot */}
      <div className="absolute left-[-3px] top-2 h-2 w-2 rounded-full bg-brand" />

      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-3 w-3" />
        {formatDate(timelineItem.date)}
      </div>

      <div className="space-y-2">
        {timelineItem.achievements.map((achievement: Achievement) => (
          <div
            key={achievement.id}
            className="glass rounded-lg p-3 flex items-start gap-3"
          >
            <div className="mt-1 text-brand">
              {getIconForType(achievement.type)}
            </div>
            <div className="flex-1">
              <div className="font-medium">{achievement.title}</div>
              <div className="text-sm text-muted-foreground">
                {achievement.description}
              </div>
              <div className="mt-1 text-xs text-muted-foreground capitalize">
                {achievement.source} • {achievement.type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
