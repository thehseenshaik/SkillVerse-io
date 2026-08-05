import { createFileRoute } from "@tanstack/react-router";
import {
  BarChart3,
  Zap,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { aiCareerIntelligence } from "@/lib/services/ai-career-intelligence";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/ai-usage")({
  head: () => ({
    meta: [
      { title: "AI Usage — SkillVerse" },
      {
        name: "description",
        content: "Track your AI usage and costs.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <UsagePage />
    </AuthGate>
  ),
});

function UsagePage() {
  const usage = aiCareerIntelligence.getUsage();

  // Calculate daily limit (example: 100 requests per day for free tier)
  const dailyLimit = 100;
  const dailyUsagePercent = (usage.dailyUsage / dailyLimit) * 100;

  // Calculate monthly limit (example: 2000 requests per month for free tier)
  const monthlyLimit = 2000;
  const monthlyUsagePercent = (usage.monthlyUsage / monthlyLimit) * 100;

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">AI Usage Management</h1>
          <p className="mt-2 text-muted-foreground">
            Track your AI requests, token consumption, and estimated costs
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="mt-2 text-3xl font-bold">{usage.totalRequests}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-brand" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tokens Consumed</p>
                <p className="mt-2 text-3xl font-bold">{usage.tokensConsumed.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
                <p className="mt-2 text-3xl font-bold">${usage.estimatedCost.toFixed(4)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Usage</p>
                <p className="mt-2 text-3xl font-bold">{usage.dailyUsage}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Usage Limits */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Daily Usage</h3>
              <Badge variant={dailyUsagePercent > 80 ? "destructive" : "secondary"}>
                {usage.dailyUsage}/{dailyLimit}
              </Badge>
            </div>
            <Progress value={dailyUsagePercent} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {dailyUsagePercent > 80 ? (
                <span className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Approaching daily limit
                </span>
              ) : (
                <span className="flex items-center gap-2 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  Within limits
                </span>
              )}
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Monthly Usage</h3>
              <Badge variant={monthlyUsagePercent > 80 ? "destructive" : "secondary"}>
                {usage.monthlyUsage}/{monthlyLimit}
              </Badge>
            </div>
            <Progress value={monthlyUsagePercent} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              {monthlyUsagePercent > 80 ? (
                <span className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  Approaching monthly limit
                </span>
              ) : (
                <span className="flex items-center gap-2 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  Within limits
                </span>
              )}
            </p>
          </Card>
        </div>

        {/* Pricing Information */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Pricing Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <p className="font-medium">Free Tier</p>
                <p className="text-sm text-muted-foreground">100 requests/day, 2,000 requests/month</p>
              </div>
              <Badge variant="secondary">Current</Badge>
            </div>
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div>
                <p className="font-medium">Pro Tier</p>
                <p className="text-sm text-muted-foreground">500 requests/day, 10,000 requests/month</p>
              </div>
              <Badge variant="outline">$9.99/month</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enterprise Tier</p>
                <p className="text-sm text-muted-foreground">Unlimited requests, priority support</p>
              </div>
              <Badge variant="outline">Custom</Badge>
            </div>
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
