import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import {
  AlertCircle,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Wand2,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaApple } from "react-icons/fa";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email")
  .max(254);
const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(128, "Too long")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[0-9]/, "Include a number")
  .regex(/[^A-Za-z0-9]/, "Include a special character");
const nameSchema = z.string().trim().min(2, "At least 2 characters").max(60);

const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});
const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password required").max(128),
});

type Mode = "login" | "signup";

function friendlyAuthError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Wrong email or password.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password is too weak.";
      case "auth/invalid-email":
        return "That email address looks invalid.";
      case "auth/popup-closed-by-user":
      case "auth/cancelled-popup-request":
        return "Sign-in was cancelled.";
      case "auth/popup-blocked":
        return "Popup blocked — allow popups and try again.";
      case "auth/account-exists-with-different-credential":
        return "This email is already linked with a different sign-in method.";
      case "auth/network-request-failed":
        return "Network error — check your connection.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again in a minute.";
      case "auth/unauthorized-domain":
        return "This domain isn't authorized in Firebase. Add it under Auth → Settings → Authorized domains.";
      default:
        return err.message.replace(/^Firebase:\s*/, "");
    }
  }
  return "Something went wrong. Please try again.";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const {
    signInEmail,
    signUpEmail,
    signInGoogle,
    signInGithub,
    sendMagicLink,
  } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<
    null | "email" | "google" | "github" | "magic"
  >(null);
  const [magicSent, setMagicSent] = useState(false);

  const goDashboard = () => navigate({ to: "/dashboard", replace: true });

  const onMagicLink = async () => {
    setErrors({});
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setErrors({
        email: parsed.error.issues[0]?.message ?? "Enter a valid email",
      });
      return;
    }
    setSubmitting("magic");
    try {
      await sendMagicLink(parsed.data);
      setMagicSent(true);
      toast.success("Magic link sent! Check your email to sign in.");
    } catch (err) {
      setErrors({ form: friendlyAuthError(err) });
    } finally {
      setSubmitting(null);
    }
  };

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed =
      mode === "signup"
        ? signupSchema.safeParse({ name, email, password })
        : loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const flat: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const k = String(issue.path[0] ?? "form");
        if (!flat[k]) flat[k] = issue.message;
      }
      setErrors(flat);
      return;
    }
    setSubmitting("email");
    try {
      if (mode === "signup") {
        await signUpEmail(name.trim(), parsed.data.email, password);
      } else {
        await signInEmail(parsed.data.email, password);
      }
      goDashboard();
    } catch (err) {
      setErrors({ form: friendlyAuthError(err) });
    } finally {
      setSubmitting(null);
    }
  };

  const onOAuth = async (provider: "google" | "github") => {
    setErrors({});
    setSubmitting(provider);
    try {
      if (provider === "google") await signInGoogle();
      else await signInGithub();
      goDashboard();
    } catch (err) {
      setErrors({ form: friendlyAuthError(err) });
    } finally {
      setSubmitting(null);
    }
  };

  const isLogin = mode === "login";
  const title = isLogin ? "Welcome back" : "Create your account";
  const subtitle = isLogin
    ? "Log in to your Career Command Center."
    : "Start building your unified career profile in seconds.";

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="glass rounded-3xl p-8 shadow-elegant">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="mt-6 grid gap-2.5">
          <button
            type="button"
            disabled={!!submitting}
            onClick={() => onOAuth("google")}
            className="group inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground shadow-sm transition-all hover:border-foreground/40 hover:bg-secondary/60 disabled:opacity-60"
          >
            {submitting === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FcGoogle className="h-[18px] w-[18px]" />
            )}
            Continue with Google
          </button>
          <button
            type="button"
            disabled={!!submitting}
            onClick={() => onOAuth("github")}
            className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-[#24292f]/60 bg-[#24292f] text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1b1f24] disabled:opacity-60 dark:border-white/15"
          >
            {submitting === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FaGithub className="h-[18px] w-[18px]" />
            )}
            Continue with GitHub
          </button>
          <button
            type="button"
            disabled
            title="Coming soon"
            className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2.5 rounded-lg border border-border bg-background text-sm font-medium text-muted-foreground opacity-70"
          >
            <FaApple className="h-[18px] w-[18px]" />
            Continue with Apple
            <span className="ml-1 rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-widest">
              Soon
            </span>
          </button>
        </div>

        <div className="mt-4">
          {magicSent ? (
            <div className="flex items-start gap-2 rounded-lg border border-brand/40 bg-brand/5 p-3 text-xs">
              <Mail className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand" />
              <span>
                Magic link sent to <b>{email}</b>. Open your inbox and tap the
                link to sign in.
                <button
                  type="button"
                  onClick={() => setMagicSent(false)}
                  className="ml-1 underline"
                >
                  Use a different email
                </button>
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onMagicLink}
              disabled={!!submitting}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-dashed border-brand/50 bg-brand/5 text-xs font-semibold text-brand transition-colors hover:bg-brand/10 disabled:opacity-60"
            >
              {submitting === "magic" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Wand2 className="h-3.5 w-3.5" />
              )}
              Email me a magic link (passwordless)
            </button>
          )}
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            or
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={onEmailSubmit} className="space-y-4" noValidate>
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <Field
                id="name"
                label="Full name"
                icon={<User className="h-4 w-4" />}
                type="text"
                autoComplete="name"
                value={name}
                onChange={setName}
                error={errors.name}
                maxLength={60}
                placeholder="Ada Lovelace"
              />
              <Field
                id="email"
                label="Email"
                icon={<Mail className="h-4 w-4" />}
                type="email"
                autoComplete="email"
                value={email}
                onChange={setEmail}
                error={errors.email}
                maxLength={254}
                placeholder="you@school.edu"
              />
            </div>
          )}
          {isLogin && (
            <Field
              id="email"
              label="Email"
              icon={<Mail className="h-4 w-4" />}
              type="email"
              autoComplete="email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              maxLength={254}
              placeholder="you@school.edu"
            />
          )}
          <Field
            id="password"
            label="Password"
            icon={<Lock className="h-4 w-4" />}
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            value={password}
            onChange={setPassword}
            error={errors.password}
            maxLength={128}
            placeholder={
              isLogin ? "Your password" : "8+ chars, mixed case & number"
            }
          />

          {isLogin && (
            <div className="-mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {errors.form && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2.5 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={!!submitting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand-gradient text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
          >
            {submitting === "email" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isLogin ? (
              "Log in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <div className="mt-5 flex items-start gap-2 rounded-lg border border-border/70 bg-secondary/40 p-3 text-[11px] text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand" />
          <span>
            Secured with Firebase Authentication. Your credentials never touch
            our servers.
          </span>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isLogin ? "New to SkillVerse? " : "Already have an account? "}
          <Link
            to={isLogin ? "/signup" : "/login"}
            className="font-semibold text-foreground hover:underline"
          >
            {isLogin ? "Create an account" : "Log in"}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field(props: {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: string;
  autoComplete: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  maxLength: number;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={props.id}
        className="mb-1.5 block text-xs font-medium text-foreground"
      >
        {props.label}
      </label>
      <div
        className={
          "flex h-11 items-center gap-2 rounded-md border bg-background px-3 transition-colors focus-within:border-foreground " +
          (props.error ? "border-destructive" : "border-border")
        }
      >
        <span className="text-muted-foreground">{props.icon}</span>
        <input
          id={props.id}
          name={props.id}
          type={props.type}
          autoComplete={props.autoComplete}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          maxLength={props.maxLength}
          placeholder={props.placeholder}
          className="h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          aria-invalid={!!props.error}
          aria-describedby={props.error ? `${props.id}-error` : undefined}
        />
      </div>
      {props.error && (
        <p
          id={`${props.id}-error`}
          className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive"
        >
          <AlertCircle className="h-3 w-3" /> {props.error}
        </p>
      )}
    </div>
  );
}
