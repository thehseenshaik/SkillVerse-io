import { createFileRoute } from "@tanstack/react-router";
import { Shield, Eye, EyeOff, Globe, Lock, Users, Save } from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useIdentityHub } from "@/lib/identity-hub-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Settings — SkillVerse" },
      {
        name: "description",
        content: "Manage your profile visibility and privacy settings.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <PrivacyPage />
    </AuthGate>
  ),
});

function PrivacyPage() {
  const { profile, updatePrivacySettings } = useIdentityHub();
  const settings = profile?.privacySettings;

  const handleToggle = (key: keyof typeof settings) => {
    if (settings) {
      updatePrivacySettings({ [key]: !settings[key] });
    }
  };

  const handleSave = () => {
    toast.success("Privacy settings saved successfully");
  };

  if (!settings) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Card className="p-12 text-center">
            <Shield className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">
              Privacy Settings Not Available
            </h3>
            <p className="mt-2 text-muted-foreground">
              Please initialize your profile first
            </p>
          </Card>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Privacy Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Control who can see your profile data
          </p>
        </div>

        {/* Profile Visibility */}
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Globe className="h-6 w-6 text-brand" />
            <h2 className="text-xl font-semibold">Profile Visibility</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="public-profile">Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Make your profile visible to everyone
                </p>
              </div>
              <Switch
                id="public-profile"
                checked={settings.profileVisibility === "public"}
                onCheckedChange={(checked) =>
                  updatePrivacySettings({
                    profileVisibility: checked ? "public" : "private",
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="recruiter-visibility">Recruiter Access</Label>
                <p className="text-sm text-muted-foreground">
                  Allow recruiters to view your profile
                </p>
              </div>
              <Switch
                id="recruiter-visibility"
                checked={settings.recruiterVisibility}
                onCheckedChange={(checked) =>
                  updatePrivacySettings({ recruiterVisibility: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Users className="h-6 w-6 text-brand" />
            <h2 className="text-xl font-semibold">Contact Information</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-email">Show Email</Label>
                <p className="text-sm text-muted-foreground">
                  Display your email address on your profile
                </p>
              </div>
              <Switch
                id="show-email"
                checked={settings.showEmail}
                onCheckedChange={() => handleToggle("showEmail")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-location">Show Location</Label>
                <p className="text-sm text-muted-foreground">
                  Display your location on your profile
                </p>
              </div>
              <Switch
                id="show-location"
                checked={settings.showLocation}
                onCheckedChange={() => handleToggle("showLocation")}
              />
            </div>
          </div>
        </Card>

        {/* Profile Sections */}
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-center gap-3">
            <Eye className="h-6 w-6 text-brand" />
            <h2 className="text-xl font-semibold">Profile Sections</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-projects">Show Projects</Label>
                <p className="text-sm text-muted-foreground">
                  Display your projects on your profile
                </p>
              </div>
              <Switch
                id="show-projects"
                checked={settings.showProjects}
                onCheckedChange={() => handleToggle("showProjects")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-achievements">Show Achievements</Label>
                <p className="text-sm text-muted-foreground">
                  Display your achievements on your profile
                </p>
              </div>
              <Switch
                id="show-achievements"
                checked={settings.showAchievements}
                onCheckedChange={() => handleToggle("showAchievements")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-coding-stats">
                  Show Coding Statistics
                </Label>
                <p className="text-sm text-muted-foreground">
                  Display your coding statistics on your profile
                </p>
              </div>
              <Switch
                id="show-coding-stats"
                checked={settings.showCodingStats}
                onCheckedChange={() => handleToggle("showCodingStats")}
              />
            </div>
          </div>
        </Card>

        {/* Hidden Sections */}
        {settings.hiddenSections && settings.hiddenSections.length > 0 && (
          <Card className="mb-6 p-6">
            <div className="mb-4 flex items-center gap-3">
              <EyeOff className="h-6 w-6 text-brand" />
              <h2 className="text-xl font-semibold">Hidden Sections</h2>
            </div>
            <div className="space-y-2">
              {settings.hiddenSections.map((section) => (
                <div
                  key={section}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                >
                  <span className="capitalize">
                    {section.replace(/_/g, " ")}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updatePrivacySettings({
                        hiddenSections: settings.hiddenSections.filter(
                          (s) => s !== section,
                        ),
                      });
                    }}
                  >
                    Show
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
