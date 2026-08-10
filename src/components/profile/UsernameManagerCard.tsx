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
  const [availability, setAvailability] = useState<"available" | "taken" | "checking" | "same" | "invalid" | "idle">("idle");
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
        const fallback = user.email.split("@")[0].toLowerCase().replace(/[^a-z0-9_-]/g, "");
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
      setValidationMessage("This is your current handle");
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
      toast.success(`🎉 Username @${clean} is now officially yours!`);
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
    toast.success("Public portfolio URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  }, [currentUsername, inputUsername]);

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/u/${currentUsername || inputUsername || "username"}`
    : `https://skillverse-io.web.app/u/${currentUsername || inputUsername || "username"}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}&bgcolor=15-23-42&color=249-115-22&margin=2`;

  return (
    <Card className={`p-6 sm:p-7 rounded-3xl border border-border/70 bg-card shadow-xs relative overflow-hidden ${className}`}>
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-brand/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-bold tracking-wider uppercase">
            <AtSign className="h-3.5 w-3.5" />
            Developer Vanity Handle & Portfolio URL
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Your Custom Public URL
            {currentUsername && (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </Badge>
            )}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Claim your unique developer handle to share your live verified skills, coding telemetry, and ATS resume with recruiters worldwide.
          </p>
        </div>

        {/* Action Buttons for Active Handle */}
        {currentUsername && (
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPublicUrl}
              className="h-10 px-4 rounded-xl border-border/80 font-semibold gap-2 hover:border-brand/40 hover:bg-brand/5"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-brand" />}
              {copied ? "Copied Link!" : "Copy Portfolio Link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQrOpen(true)}
              className="h-10 px-3.5 rounded-xl border-border/80 font-semibold gap-1.5 hover:border-brand/40"
            >
              <QrCode className="h-4 w-4 text-muted-foreground" />
              QR Code
            </Button>
            <Button
              asChild
              size="sm"
              className="h-10 px-4 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold gap-2 shadow-xs shadow-brand/20"
            >
              <a href={`/u/${currentUsername}`} target="_blank" rel="noopener noreferrer">
                Preview Live <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* Live Profile Link Bar */}
      <div className="mt-6 p-4 rounded-2xl bg-muted/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden text-sm">
          <span className="text-muted-foreground font-mono shrink-0">Public Link:</span>
          <a
            href={`/u/${currentUsername || inputUsername || "username"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-brand font-bold truncate hover:underline"
          >
            {publicUrl}
          </a>
        </div>
        <div className="text-xs text-muted-foreground shrink-0 font-medium">
          Status: <span className="text-emerald-500 font-semibold">Active & Indexed</span>
        </div>
      </div>

      {/* Handle Customization Form */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-8 relative">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-bold text-muted-foreground font-mono text-base select-none">
                @
              </span>
              <Input
                value={inputUsername}
                onChange={(e) => setInputUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                placeholder="choose-your-handle"
                maxLength={30}
                className="pl-8 pr-10 h-12 rounded-xl bg-background border-border/80 font-mono text-base font-semibold focus-visible:ring-brand"
              />
              <div className="absolute right-3 flex items-center">
                {availability === "checking" && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
                {availability === "available" && <Check className="h-5 w-5 text-emerald-500 font-bold" />}
                {availability === "taken" && <X className="h-5 w-5 text-destructive font-bold" />}
                {availability === "same" && <ShieldCheck className="h-5 w-5 text-brand" />}
              </div>
            </div>

            {/* Validation Message */}
            {validationMessage && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium">
                {availability === "available" && <span className="text-emerald-500 font-semibold">✓ {validationMessage}</span>}
                {availability === "taken" && <span className="text-destructive font-semibold">✕ {validationMessage}</span>}
                {availability === "invalid" && <span className="text-amber-500 font-semibold">! {validationMessage}</span>}
                {availability === "same" && <span className="text-muted-foreground">● {validationMessage}</span>}
                {availability === "checking" && <span className="text-muted-foreground">Checking...</span>}
              </div>
            )}
          </div>

          <div className="md:col-span-4 flex justify-end">
            <Button
              onClick={handleClaim}
              disabled={saving || availability !== "available"}
              className="w-full md:w-auto h-12 px-6 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-sm shadow-xs shadow-brand/20 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : availability === "same" ? (
                "Handle Claimed ✓"
              ) : (
                "Claim Handle"
              )}
            </Button>
          </div>
        </div>

        {/* Smart Handle Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-brand/5 border border-brand/15 animate-fade-in">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              Available Alternatives
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  onClick={() => setInputUsername(sug)}
                  className="px-3 py-1.5 rounded-lg bg-background border border-brand/20 text-xs font-mono font-semibold text-foreground hover:border-brand hover:bg-brand/10 transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <span>@{sug}</span>
                  <span className="text-[10px] text-brand font-bold font-sans">Apply</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Dialog Modal */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border/80 rounded-3xl p-6 sm:p-7 text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">Portfolio QR Code</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Scan with any mobile camera to open <strong>@{currentUsername}</strong>'s live SkillVerse portfolio.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800">
            <img
              src={qrImageUrl}
              alt={`QR Code for ${publicUrl}`}
              className="w-56 h-56 rounded-xl shadow-lg border border-brand/30"
            />
            <p className="mt-3 text-xs font-mono text-slate-400 font-semibold truncate max-w-xs">
              {publicUrl}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 rounded-xl font-semibold border-border/80"
              onClick={handleCopyPublicUrl}
            >
              <Copy className="h-4 w-4 mr-2 text-brand" />
              Copy Link
            </Button>
            <Button
              asChild
              className="flex-1 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold"
            >
              <a href={qrImageUrl} download={`skillverse-${currentUsername}-qr.png`} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download QR
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
