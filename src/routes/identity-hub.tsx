import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
  XCircle,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getProfessionalPlatforms,
  getCodingPlatforms,
} from "@/lib/connectors/platform-config";
import {
  type Platform,
  type PlatformConnection,
  type ConnectionStatus,
} from "@/types/identity-hub";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/identity-hub")({
  component: IdentityHub,
});

function IdentityHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<PlatformConnection[]>([
    {
      platform: "github",
      status: "connected",
      username: "johndoe",
      lastSynced: new Date(Date.now() - 1000 * 60 * 30),
      syncStatus: "synced",
    },
    {
      platform: "leetcode",
      status: "connected",
      username: "johndoe",
      lastSynced: new Date(Date.now() - 1000 * 60 * 60 * 2),
      syncStatus: "synced",
    },
    {
      platform: "linkedin",
      status: "disconnected",
    },
  ]);

  const [isConnecting, setIsConnecting] = useState<Platform | null>(null);
  const [isSyncing, setIsSyncing] = useState<Platform | null>(null);

  const profileCompletion = calculateProfileCompletion(connections);

  const handleViewProfile = (platform: Platform) => {
    navigate({ to: `/analytics/${platform}` });
  };

  const handleConnect = async (platform: Platform, username?: string) => {
    setIsConnecting(platform);
    try {
      const response = await fetch(`http://localhost:3001/api/${platform}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid: user?.id, username }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect');
      }

      // Reload connections after connect
      const userResponse = await fetch(`http://localhost:3001/api/user/${user?.id}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const connectionsData = userData.connections || {};

        const platformConnections: PlatformConnection[] = Object.entries(connectionsData).map(
          ([platform, data]: [string, any]) => ({
            platform: platform as Platform,
            status: data.connected ? 'connected' : 'disconnected',
            username: data.username || '',
            lastSynced: data.lastSynced ? new Date(data.lastSynced) : undefined,
            syncStatus: 'synced',
          })
        );

        setConnections(platformConnections);
      }

      toast.success(
        `Successfully connected to ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
      );
    } catch (error) {
      toast.error(`Failed to connect to ${platform}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = (platform: Platform) => {
    setConnections((prev) => [
      ...prev.filter((c) => c.platform !== platform),
      { platform, status: "disconnected" },
    ]);
    toast.success(
      `Disconnected from ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
    );
  };

  const handleSync = (platform: Platform) => {
    setIsSyncing(platform);
    setTimeout(() => {
      setConnections((prev) =>
        prev.map((c) =>
          c.platform === platform
            ? { ...c, lastSynced: new Date(), syncStatus: "synced" }
            : c,
        ),
      );
      setIsSyncing(null);
      toast.success(
        `${platform.charAt(0).toUpperCase() + platform.slice(1)} synced successfully`,
      );
    }, 2000);
  };

  const professionalPlatforms = getProfessionalPlatforms();
  const codingPlatforms = getCodingPlatforms();

  return (
    <PageShell>
      <AuthGate>
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gradient">
                  Identity Hub
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Connect your platforms to build your unified career profile
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground">
                  {profileCompletion}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Profile Complete
                </div>
              </div>
            </div>
          </div>

          {/* Professional Platforms */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">
              Professional Platforms
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {professionalPlatforms.map((platform) => (
                <PlatformCard
                  key={platform}
                  platform={platform}
                  connection={connections.find((c) => c.platform === platform)}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onSync={handleSync}
                  isConnecting={isConnecting === platform}
                  isSyncing={isSyncing === platform}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          </div>

          {/* Coding Platforms */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold">Coding Platforms</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {codingPlatforms.map((platform) => (
                <PlatformCard
                  key={platform}
                  platform={platform}
                  connection={connections.find((c) => c.platform === platform)}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onSync={handleSync}
                  isConnecting={isConnecting === platform}
                  isSyncing={isSyncing === platform}
                  onViewProfile={handleViewProfile}
                />
              ))}
            </div>
          </div>

          {/* Sync All Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => {
                connections
                  .filter((c) => c.status === "connected")
                  .forEach((c) => handleSync(c.platform));
              }}
              disabled={
                connections.filter((c) => c.status === "connected").length === 0
              }
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" /> Sync All Platforms
            </Button>
          </div>
        </div>
      </AuthGate>
    </PageShell>
  );
}

function PlatformCard({
  platform,
  connection,
  onConnect,
  onDisconnect,
  onSync,
  isConnecting,
  isSyncing,
  onViewProfile,
}: {
  platform: Platform;
  connection?: PlatformConnection;
  onConnect: (platform: Platform, username?: string) => Promise<void>;
  onDisconnect: (platform: Platform) => void;
  onSync: (platform: Platform) => void;
  isConnecting: boolean;
  isSyncing: boolean;
  onViewProfile: (platform: Platform) => void;
}) {
  const [username, setUsername] = useState("");
  const [showInput, setShowInput] = useState(false);
  const isConnected = connection?.status === "connected";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const canViewProfile = true;

  return (
    <Card 
      className={`p-5 ${isConnected && canViewProfile ? "cursor-pointer hover:border-brand/50 transition-colors" : ""}`}
      onClick={() => isConnected && canViewProfile && onViewProfile(platform)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${getPlatformColor(platform)}20` }}
          >
            <span
              className="text-lg font-bold"
              style={{ color: getPlatformColor(platform) }}
            >
              {platform.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold">{platformName}</h3>
            {isConnected && connection.username && (
              <p className="text-xs text-muted-foreground">
                @{connection.username}
              </p>
            )}
          </div>
        </div>
        <StatusBadge
          variant={connection?.status === "connected" ? "success" : "neutral"}
          dot
        >
          {connection?.status === "connected" ? "Connected" : "Disconnected"}
        </StatusBadge>
      </div>

      {isConnected && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last synced:{" "}
              {connection.lastSynced
                ? formatTimeAgo(connection.lastSynced)
                : "Never"}
            </div>
            {connection.syncStatus === "syncing" && (
              <div className="flex items-center gap-1 text-brand">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Syncing...
              </div>
            )}
          </div>
          {connection.errorMessage && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <ShieldAlert className="h-3 w-3" />
              {connection.errorMessage}
            </div>
          )}
          {canViewProfile && (
            <div className="text-xs text-brand">
              Click to view full profile
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
        {isConnected ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSync(platform)}
              disabled={isSyncing}
              className="flex-1 gap-1"
            >
              <RefreshCw
                className={`h-3 w-3 ${isSyncing ? "animate-spin" : ""}`}
              />
              {isSyncing ? "Syncing" : "Sync"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDisconnect(platform)}
              className="gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Disconnect
            </Button>
          </>
        ) : showInput ? (
          <div className="flex gap-2 w-full">
            <input
              type="text"
              placeholder={`${platformName} username`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-border rounded-md bg-background"
              autoFocus
            />
            <Button
              variant="default"
              size="sm"
              onClick={() => onConnect(platform, username)}
              disabled={isConnecting || !username}
              className="gap-1"
            >
              {isConnecting ? "Connecting..." : "Connect"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInput(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowInput(true)}
            disabled={isConnecting}
            className="w-full gap-1"
          >
            <Plus className="h-3 w-3" />
            Connect
          </Button>
        )}
      </div>
    </Card>
  );
}

function calculateProfileCompletion(connections: PlatformConnection[]): number {
  const totalPlatforms = 11; // Total supported platforms
  const connectedPlatforms = connections.filter(
    (c) => c.status === "connected",
  ).length;
  return Math.round((connectedPlatforms / totalPlatforms) * 100);
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getPlatformColor(platform: Platform): string {
  const colors: Record<Platform, string> = {
    github: "#24292e",
    linkedin: "#0077b5",
    leetcode: "#ffa116",
    gfg: "#2f8d46",
    hackerrank: "#00ea64",
    codechef: "#5b4632",
    codeforces: "#b01e28",
    kaggle: "#20beff",
    medium: "#000000",
    devto: "#0a0a0a",
    portfolio: "#6366f1",
  };
  return colors[platform];
}
