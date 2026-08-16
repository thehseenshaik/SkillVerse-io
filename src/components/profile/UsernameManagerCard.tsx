import { useState, useEffect, useCallback } from "react";
import {
  Check,
  X,
  Loader2,
  Copy,
  ExternalLink,
  QrCode,
  Sparkles,
  ShieldCheck,
  AtSign,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { usernameService } from "@/lib/services/username-service";
import { toast } from "sonner";

interface UsernameManagerCardProps {
  onUsernameUpdated?: (newUsername: string) => void;
  className?: string;
}

export function UsernameManagerCard({
  onUsernameUpdated,
  className = "",
}: UsernameManagerCardProps) {
  const { user } = useAuth();
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [inputUsername, setInputUsername] = useState<string>("");
  const [availability, setAvailability] = useState<
    "available" | "taken" | "checking" | "same" | "invalid" | "idle"
  >("idle");
  const [validationMessage, setValidationMessage] = useState<string>("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [qrOpen, setQrOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Load current username
  useEffect(() => {
    if (!user?.id) return;
    usernameService.getUsernameByUserId(user.id).then((handle) => {
      if (handle) {
        setCurrentUsername(handle);
        setInputUsername(handle);
      } else if (user.email) {
        const fallback = user.email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, "");
        setCurrentUsername(fallback);
        setInputUsername(fallback);
      }
    });
  }, [user?.id, user?.email]);

  // Debounced availability check
  useEffect(() => {
    const clean = inputUsername.trim().toLowerCase().replace(/^@/, "");
    if (!clean) {
      setAvailability("idle");
      setValidationMessage("");
      setSuggestions([]);
      return;
    }

    if (clean === currentUsername.toLowerCase()) {
      setAvailability("same");
      setValidationMessage("Your active claimed handle");
      setSuggestions([]);
      return;
    }

    const validation = usernameService.validateUsername(clean);
    if (!validation.valid) {
      setAvailability("invalid");
      setValidationMessage(validation.message);
      setSuggestions([]);
      return;
    }

    setAvailability("checking");
    setValidationMessage("Checking availability...");

    const timeout = setTimeout(async () => {
      try {
        const res = await usernameService.checkAvailability(clean);
        if (res.available) {
          setAvailability("available");
          setValidationMessage(`@${clean} is available!`);
          setSuggestions([]);
        } else {
          setAvailability("taken");
          setValidationMessage(`@${clean} is already claimed.`);
          const smartSuggestions = await usernameService.suggestUsernames(clean);
          setSuggestions(smartSuggestions);
        }
      } catch (err) {
        console.error("Availability check error:", err);
        setAvailability("idle");
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [inputUsername, currentUsername]);

  const handleClaim = async () => {
    if (!user?.id) {
      toast.error("You must be logged in to claim a username");
      return;
    }

    const clean = inputUsername.trim().toLowerCase().replace(/^@/, "");
    if (!clean) return;

    setSaving(true);
    try {
      await usernameService.claimUsername(user.id, clean);
      setCurrentUsername(clean);
      setAvailability("same");
      toast.success(`Username @${clean} claimed!`);
      if (onUsernameUpdated) {
        onUsernameUpdated(clean);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to claim username");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyPublicUrl = useCallback(() => {
    const handle = currentUsername || inputUsername || "developer";
    const url = `${window.location.origin}/u/${handle}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Public portfolio URL copied!");
    setTimeout(() => setCopied(false), 2500);
  }, [currentUsername, inputUsername]);

  const activeHandle = currentUsername || inputUsername || "username";
  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/u/${activeHandle}`
      : `https://skillverse-io.web.app/u/${activeHandle}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    publicUrl
  )}&bgcolor=15-23-42&color=249-115-22&margin=2`;

  return (
    <Card
      className={`p-5 sm:p-6 rounded-3xl border border-border/70 bg-card shadow-xs relative overflow-hidden ${className}`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                Public Developer Handle
              </h3>
              {currentUsername && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Claim your unique handle to share your live portfolio with recruiters worldwide.
            </p>
          </div>

          <div className="text-xs text-muted-foreground font-medium shrink-0">
            Link: <span className="font-mono text-brand font-bold">/u/{activeHandle}</span>
          </div>
        </div>

        {/* Single Unified Input & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-muted-foreground font-bold text-sm">
              @
            </span>
            <Input
              value={inputUsername}
              onChange={(e) =>
                setInputUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))
              }
              placeholder="your-handle"
              maxLength={30}
              className="pl-8 pr-9 h-11 rounded-2xl bg-background border-border/80 font-mono text-sm font-semibold focus-visible:ring-brand"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
              {availability === "checking" && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {availability === "available" && <Check className="h-4 w-4 text-emerald-500 font-bold" />}
              {availability === "taken" && <X className="h-4 w-4 text-destructive font-bold" />}
              {availability === "same" && <ShieldCheck className="h-4 w-4 text-brand" />}
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="flex items-center gap-2 shrink-0">
            {availability === "available" ? (
              <Button
                onClick={handleClaim}
                disabled={saving}
                className="h-11 px-5 rounded-2xl bg-brand hover:bg-brand/90 text-white font-bold text-xs shadow-xs"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Claim Handle"}
              </Button>
            ) : (
              <Button
                disabled
                variant="secondary"
                className="h-11 px-4 rounded-2xl font-bold text-xs text-muted-foreground border border-border/60"
              >
                Handle Claimed ✓
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyPublicUrl}
              className="h-11 w-11 rounded-2xl border-border/80 shrink-0 hover:bg-brand/10 hover:border-brand/40"
              title="Copy Portfolio Link"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4 text-brand" />
              )}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setQrOpen(true)}
              className="h-11 w-11 rounded-2xl border-border/80 shrink-0 hover:bg-secondary"
              title="View QR Code"
            >
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </Button>

            {currentUsername && (
              <Button
                asChild
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-2xl border-border/80 shrink-0 hover:bg-brand/10 hover:border-brand/40"
                title="Preview Live Portfolio"
              >
                <a href={`/u/${currentUsername}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 text-brand" />
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Validation Subtext & Suggestions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="font-medium">
            {availability === "available" && (
              <span className="text-emerald-500 font-semibold">✓ @{inputUsername} is available!</span>
            )}
            {availability === "taken" && (
              <span className="text-destructive font-semibold">✕ @{inputUsername} is already taken</span>
            )}
            {availability === "invalid" && (
              <span className="text-amber-500 font-semibold">! {validationMessage}</span>
            )}
            {availability === "same" && (
              <span className="text-muted-foreground font-medium">✓ Active claimed handle</span>
            )}
          </div>

          <span className="text-[11px] text-muted-foreground">
            Status: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active & Indexed</span>
          </span>
        </div>

        {/* Alternatives */}
        {suggestions.length > 0 && (
          <div className="p-3 rounded-2xl bg-brand/5 border border-brand/15 text-xs space-y-1.5">
            <div className="flex items-center gap-1 font-bold text-brand uppercase text-[10px] tracking-wider">
              <Sparkles className="h-3 w-3" /> Available Suggestions:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setInputUsername(sug)}
                  className="px-2.5 py-1 rounded-lg bg-background border border-brand/20 font-mono font-semibold text-foreground hover:border-brand transition-all text-xs"
                >
                  @{sug}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Dialog Modal */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border/80 rounded-3xl p-6 text-center">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">Portfolio QR Code</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Scan with any mobile camera to open <strong>@{currentUsername}</strong>'s portfolio.
            </DialogDescription>
          </DialogHeader>

          <div className="my-5 flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <img
              src={qrImageUrl}
              alt={`QR Code for ${publicUrl}`}
              className="w-48 h-48 rounded-xl shadow-lg border border-brand/30"
            />
            <p className="mt-2 text-xs font-mono text-slate-400 font-semibold truncate max-w-xs">
              {publicUrl}
            </p>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="flex-1 rounded-xl text-xs font-bold border-border/80"
              onClick={handleCopyPublicUrl}
            >
              <Copy className="h-3.5 w-3.5 mr-1.5 text-brand" /> Copy Link
            </Button>
            <Button
              asChild
              className="flex-1 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-xs"
            >
              <a
                href={qrImageUrl}
                download={`skillverse-${currentUsername}-qr.png`}
                target="_blank"
                rel="noreferrer"
              >
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download QR
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
