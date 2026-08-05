import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { FirebaseError } from "firebase/app";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/change-password")({
  head: () => ({
    meta: [
      { title: "Change password — SkillVerse" },
      {
        name: "description",
        content: "Update your SkillVerse account password securely.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Change password — SkillVerse" },
      {
        property: "og:description",
        content: "Rotate your password. Zero downtime.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <ChangePasswordPage />
    </AuthGate>
  ),
});

const strong = z
  .string()
  .min(8, "At least 8 characters")
  .max(128, "Too long")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[0-9]/, "Include a number");

const schema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: strong,
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, {
    path: ["confirm"],
    message: "Passwords don't match",
  })
  .refine((v) => v.current !== v.next, {
    path: ["next"],
    message: "Choose a new, different password",
  });

function strength(pw: string): { score: number; label: string } {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const label = ["Too short", "Weak", "Fair", "Good", "Strong", "Excellent"][s];
  return { score: s, label };
}

function ChangePasswordPage() {
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const s = strength(next);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ current, next, confirm });
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      for (const i of parsed.error.issues) {
        const k = String(i.path[0] ?? "form");
        if (!flat[k]) flat[k] = i.message;
      }
      setErrors(flat);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await changePassword(current, next);
      setDone(true);
      setTimeout(() => navigate({ to: "/settings", replace: true }), 1400);
    } catch (err) {
      let msg = "Could not update password.";
      if (err instanceof FirebaseError) {
        if (
          err.code === "auth/invalid-credential" ||
          err.code === "auth/wrong-password"
        ) {
          msg = "Current password is incorrect.";
        } else if (err.code === "auth/weak-password") {
          msg = "New password is too weak.";
        } else if (err.code === "auth/requires-recent-login") {
          msg = "Please sign out and back in, then try again.";
        } else {
          msg = err.message.replace(/^Firebase:\s*/, "");
        }
      }
      setErrors({ current: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <section className="mx-auto max-w-md px-6 py-14">
        <div className="rounded-2xl border border-border/70 bg-background p-6 shadow-elegant">
          <button
            type="button"
            onClick={() => navigate({ to: "/settings" })}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to settings
          </button>

          <div className="mt-4 flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-white shadow-glow">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold tracking-tight">
                Change password
              </h1>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Use a strong password you haven't used elsewhere.
              </p>
            </div>
          </div>

          {done ? (
            <div className="mt-6 rounded-md border border-brand/30 bg-brand/5 p-4 text-center">
              <CheckCircle2 className="mx-auto h-6 w-6 text-brand" />
              <p className="mt-2 text-[13px] font-semibold">Password updated</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Redirecting to settings…
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-5 space-y-3" noValidate>
              <PwField
                label="Current password"
                value={current}
                onChange={setCurrent}
                show={show}
                onToggle={() => setShow((v) => !v)}
                error={errors.current}
                autoComplete="current-password"
              />
              <PwField
                label="New password"
                value={next}
                onChange={setNext}
                show={show}
                onToggle={() => setShow((v) => !v)}
                error={errors.next}
                autoComplete="new-password"
              />
              {next && (
                <div>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={
                          "h-1 flex-1 rounded-full " +
                          (i < s.score
                            ? s.score <= 2
                              ? "bg-destructive"
                              : s.score === 3
                                ? "bg-brand/70"
                                : "bg-brand"
                            : "bg-secondary")
                        }
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                    Strength: {s.label}
                  </p>
                </div>
              )}
              <PwField
                label="Confirm new password"
                value={confirm}
                onChange={setConfirm}
                show={show}
                onToggle={() => setShow((v) => !v)}
                error={errors.confirm}
                autoComplete="new-password"
              />

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-foreground text-[13px] font-semibold text-background shadow-elegant hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update password"
                )}
              </button>

              <div className="flex items-start gap-2 rounded-md border border-border/70 bg-secondary/40 p-2.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand" />
                <span>
                  All other sessions stay signed in for this demo. Cloud auth
                  will revoke them on change.
                </span>
              </div>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function PwField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  error?: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-foreground">
        {props.label}
      </label>
      <div
        className={
          "flex h-10 items-center gap-2 rounded-md border bg-background px-2.5 focus-within:border-foreground " +
          (props.error ? "border-destructive" : "border-border")
        }
      >
        <Lock className="h-4 w-4 text-muted-foreground" />
        <input
          type={props.show ? "text" : "password"}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          maxLength={128}
          autoComplete={props.autoComplete}
          className="h-full flex-1 bg-transparent text-[13px] outline-none"
        />
        <button
          type="button"
          onClick={props.onToggle}
          className="text-muted-foreground hover:text-foreground"
          aria-label={props.show ? "Hide password" : "Show password"}
        >
          {props.show ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {props.error && (
        <p className="mt-1 text-[11px] text-destructive">{props.error}</p>
      )}
    </div>
  );
}
