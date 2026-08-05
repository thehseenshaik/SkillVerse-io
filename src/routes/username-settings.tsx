import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  User,
  Check,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { usernameService } from "@/lib/services/username-service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/username-settings")({
  head: () => ({
    meta: [
      { title: "Username Settings — SkillVerse" },
      {
        name: "description",
        content: "Set your unique username for your public profile.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <UsernameSettingsPage />
    </AuthGate>
  ),
});

function UsernameSettingsPage() {
  const { user } = useAuth();
  const [username, setUsername] = useState<string>("");
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [availability, setAvailability] = useState<"available" | "taken" | "checking" | "idle">("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; message: string }>({ valid: true, message: "" });

  useEffect(() => {
    loadCurrentUsername();
  }, [user?.id]);

  const loadCurrentUsername = async () => {
    if (!user?.id) return;
    try {
      const current = await usernameService.getUsernameByUserId(user.id);
      if (current) {
        setCurrentUsername(current);
        setUsername(current);
      }
    } catch (error) {
      console.error("Error loading current username:", error);
    }
  };

  const validateUsername = (value: string) => {
    const result = usernameService.validateUsername(value);
    setValidation(result);
    return result.valid;
  };

  const checkAvailability = async (value: string) => {
    if (!value || !validateUsername(value)) {
      setAvailability("idle");
      return;
    }

    setAvailability("checking");
    try {
      const result = await usernameService.checkAvailability(value);
      setAvailability(result.available ? "available" : "taken");
      
      if (!result.available) {
        // Generate suggestions
        const suggested = await usernameService.suggestUsernames(value);
        setSuggestions(suggested);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailability("idle");
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setAvailability("idle");
    setSuggestions([]);
    if (value) {
      validateUsername(value);
    }
  };

  const handleClaimUsername = async () => {
    if (!user?.id || !username) return;

    const valid = validateUsername(username);
    if (!valid) {
      toast.error(validation.message);
      return;
    }

    setLoading(true);
    try {
      if (currentUsername) {
        await usernameService.updateUsername(user.id, currentUsername, username);
        toast.success("Username updated successfully");
      } else {
        await usernameService.claimUsername(user.id, username);
        toast.success("Username claimed successfully");
      }
      setCurrentUsername(username);
      setAvailability("idle");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to claim username");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setUsername(suggestion);
    checkAvailability(suggestion);
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Username Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Choose a unique username for your public profile
          </p>
        </div>

        {/* Current Username */}
        {currentUsername && (
          <Card className="mb-6 p-6 bg-secondary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Username</p>
                <p className="mt-1 text-2xl font-bold">{currentUsername}</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
          </Card>
        )}

        {/* Username Input */}
        <Card className="mb-6 p-6">
          <Label htmlFor="username">Username</Label>
          <div className="mt-2 flex gap-3">
            <div className="relative flex-1">
              <Input
                id="username"
                placeholder="your-username"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className="pr-10"
              />
              {availability === "checking" && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {availability === "available" && (
                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
              )}
              {availability === "taken" && (
                <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-600" />
              )}
            </div>
            <Button
              onClick={() => checkAvailability(username)}
              variant="outline"
              disabled={!username || !validation.valid}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Check
            </Button>
          </div>

          {/* Validation Message */}
          {username && !validation.valid && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {validation.message}
            </p>
          )}

          {/* Availability Message */}
          {availability === "available" && (
            <p className="mt-2 text-sm text-emerald-600 flex items-center gap-2">
              <Check className="h-4 w-4" />
              Username is available
            </p>
          )}
          {availability === "taken" && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-2">
              <X className="h-4 w-4" />
              Username is already taken
            </p>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Available suggestions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Claim Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleClaimUsername}
              disabled={loading || availability !== "available" || !validation.valid}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  {currentUsername ? "Update Username" : "Claim Username"}
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Public Profile URL */}
        {currentUsername && (
          <Card className="p-6 bg-gradient-to-br from-brand/10 to-brand/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Public Profile</p>
                <p className="mt-1 text-lg font-semibold">skillverse.io/u/{currentUsername}</p>
              </div>
              <Button variant="outline" size="sm">
                Visit Profile
              </Button>
            </div>
          </Card>
        )}

        {/* Username Rules */}
        <Card className="mt-6 p-6">
          <h3 className="font-semibold mb-3">Username Rules</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Must be 3-30 characters long</li>
            <li>• Can only contain letters, numbers, underscores, and hyphens</li>
            <li>• Must start with a letter</li>
            <li>• Cannot be a reserved word</li>
            <li>• Cannot be changed frequently (rate limited)</li>
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
