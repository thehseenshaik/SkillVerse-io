import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { Loader2, MailCheck, AlertCircle } from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { fbAuth } from "@/lib/firebase";

export const Route = createFileRoute("/auth-callback")({
  head: () => ({
    meta: [
      { title: "Signing you in — SkillVerse" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallback,
});

const STORAGE_KEY = "skillverse.magicEmail";

function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "working" | "need-email" | "error" | "done"
  >("working");
  const [message, setMessage] = useState<string>("Verifying your magic link…");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const auth = fbAuth();
    const href = window.location.href;

    if (!isSignInWithEmailLink(auth, href)) {
      setStatus("error");
      setMessage("This link is invalid or has already been used.");
      return;
    }

    // Check both localStorage and sessionStorage for the email
    const stored =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      complete(stored, href);
    } else {
      setStatus("need-email");
      setMessage("Confirm the email you used to request the link.");
    }
  }, []);

  const complete = async (mail: string, href: string) => {
    try {
      setStatus("working");
      setMessage("Signing you in…");
      await signInWithEmailLink(fbAuth(), mail, href);
      // Clean up both storage locations
      window.localStorage.removeItem(STORAGE_KEY);
      window.sessionStorage.removeItem(STORAGE_KEY);
      setStatus("done");
      setTimeout(() => navigate({ to: "/dashboard", replace: true }), 400);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Sign-in failed.");
    }
  };

  return (
    <PageShell>
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 py-16">
        <div className="glass w-full rounded-3xl p-8 text-center shadow-elegant">
          {status === "working" && (
            <>
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand" />
              <h1 className="mt-4 text-xl font-bold">One moment…</h1>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            </>
          )}
          {status === "done" && (
            <>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-gradient text-white shadow-glow">
                <MailCheck className="h-5 w-5" />
              </div>
              <h1 className="mt-4 text-xl font-bold">You're in.</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Redirecting to your dashboard…
              </p>
            </>
          )}
          {status === "need-email" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) complete(email.trim(), window.location.href);
              }}
            >
              <h1 className="text-xl font-bold">Confirm your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="mt-4 h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/50"
              />
              <button
                type="submit"
                className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-md bg-brand-gradient text-sm font-semibold text-white shadow-glow"
              >
                Continue
              </button>
            </form>
          )}
          {status === "error" && (
            <>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h1 className="mt-4 text-xl font-bold">
                We couldn't sign you in
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              <button
                onClick={() => navigate({ to: "/login" })}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-secondary"
              >
                Back to sign in
              </button>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}
