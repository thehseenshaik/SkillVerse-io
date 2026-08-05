/**
 * Comprehensive Sign-Up Form
 * Full registration form with all required fields and validation
 */

import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { z } from "zod";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  MapPin,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import {
  signUp,
  signInWithGoogle,
  signInWithGithub,
  checkUsernameAvailability,
  reserveUsername,
} from "@/services/auth.service";
import {
  signUpSchema,
  passwordStrength as calculatePasswordStrength,
} from "@/lib/validation/auth";
import type { SignUpFormData } from "@/lib/validation/auth";
import { toast } from "sonner";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "India",
  "Singapore",
  "Japan",
  "South Korea",
  "Netherlands",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Switzerland",
  "Ireland",
  "New Zealand",
  "Brazil",
  "Mexico",
  "Spain",
  "Italy",
  "Poland",
  "Ukraine",
  "Russia",
  "China",
  "Hong Kong",
  "Taiwan",
  "Malaysia",
  "Indonesia",
  "Philippines",
  "Thailand",
  "Vietnam",
  "South Africa",
  "Egypt",
  "Nigeria",
  "Kenya",
  "Argentina",
  "Colombia",
  "Chile",
  "Peru",
  "Other",
];

export function SignUpForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    acceptTerms: false,
    newsletter: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState<
    null | "email" | "google" | "github"
  >(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "Very Weak",
    color: "#ef4444",
  });

  const handleInputChange = (
    field: keyof SignUpFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Check username availability
    if (field === "username" && typeof value === "string") {
      if (value.length >= 3) {
        setUsernameChecking(true);
        checkUsernameAvailability(value)
          .then((available) => {
            setUsernameAvailable(available);
            setUsernameChecking(false);
          })
          .catch(() => {
            setUsernameChecking(false);
          });
      } else {
        setUsernameAvailable(null);
      }
    }

    // Update password strength
    if (field === "password" && typeof value === "string") {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const validateForm = (): boolean => {
    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      const formErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        formErrors[path] = issue.message;
      });
      setErrors(formErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    if (usernameAvailable === false) {
      toast.error("Username is already taken");
      return;
    }

    setIsSubmitting("email");
    try {
      // Create account (username reservation is now handled atomically in signUp)
      await signUp(formData);

      toast.success(
        "Account created successfully! Please check your email to verify your account.",
      );
      navigate({ to: "/dashboard", replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
      setErrors({ form: error.message });
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting("google");
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google successfully!");
      navigate({ to: "/dashboard", replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with Google");
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleGithubSignIn = async () => {
    setIsSubmitting("github");
    try {
      await signInWithGithub();
      toast.success("Signed in with GitHub successfully!");
      navigate({ to: "/dashboard", replace: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in with GitHub");
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="glass rounded-3xl p-8 shadow-elegant">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start building your unified career profile in seconds.
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            disabled={!!isSubmitting}
            onClick={handleGoogleSignIn}
            className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-border bg-background text-sm font-medium text-foreground shadow-sm transition-all hover:border-foreground/40 hover:bg-secondary/60 disabled:opacity-60"
          >
            {isSubmitting === "google" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FcGoogle className="h-[18px] w-[18px]" />
            )}
            Continue with Google
          </button>
          <button
            type="button"
            disabled={!!isSubmitting}
            onClick={handleGithubSignIn}
            className="inline-flex h-11 items-center justify-center gap-2.5 rounded-lg border border-[#24292f]/60 bg-[#24292f] text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1b1f24] disabled:opacity-60 dark:border-white/15"
          >
            {isSubmitting === "github" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FaGithub className="h-[18px] w-[18px]" />
            )}
            Continue with GitHub
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            or sign up with email
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First Name"
              icon={<User className="h-4 w-4" />}
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(v) => handleInputChange("firstName", v)}
              error={errors.firstName}
              placeholder="John"
              autoComplete="given-name"
              required
            />
            <FormField
              label="Last Name"
              icon={<User className="h-4 w-4" />}
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(v) => handleInputChange("lastName", v)}
              error={errors.lastName}
              placeholder="Doe"
              autoComplete="family-name"
              required
            />
          </div>

          {/* Username */}
          <FormField
            label="Username"
            icon={<User className="h-4 w-4" />}
            type="text"
            id="username"
            value={formData.username}
            onChange={(v) => handleInputChange("username", v)}
            error={errors.username}
            placeholder="johndoe"
            autoComplete="username"
            required
            suffix={
              usernameChecking ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : usernameAvailable === true ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : usernameAvailable === false ? (
                <X className="h-4 w-4 text-red-500" />
              ) : null
            }
          />

          {/* Email */}
          <FormField
            label="Email"
            icon={<Mail className="h-4 w-4" />}
            type="email"
            id="email"
            value={formData.email}
            onChange={(v) => handleInputChange("email", v)}
            error={errors.email}
            placeholder="john@example.com"
            autoComplete="email"
            required
          />

          {/* Password */}
          <div>
            <FormField
              label="Password"
              icon={<Lock className="h-4 w-4" />}
              type={showPassword ? "text" : "password"}
              id="password"
              value={formData.password}
              onChange={(v) => handleInputChange("password", v)}
              error={errors.password}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            />
            {/* Password Strength */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">
                    Password strength:
                  </span>
                  <span
                    style={{ color: passwordStrength.color }}
                    className="font-medium"
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <FormField
            label="Confirm Password"
            icon={<Lock className="h-4 w-4" />}
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(v) => handleInputChange("confirmPassword", v)}
            error={errors.confirmPassword}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            suffix={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />

          {/* Country */}
          <div>
            <label className="mb-2 block text-xs font-medium text-foreground">
              Country <span className="text-destructive">*</span>
            </label>
            <div className="flex h-11 items-center gap-2 rounded-lg border border-border bg-background px-3 transition-colors focus-within:border-foreground">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <select
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                className="h-full flex-1 bg-transparent text-sm text-foreground outline-none"
                required
              >
                <option value="">Select your country</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
            {errors.country && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" /> {errors.country}
              </p>
            )}
          </div>

          {/* Terms and Newsletter */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) =>
                  handleInputChange("acceptTerms", e.target.checked)
                }
                className="mt-0.5 h-4 w-4 rounded border-border bg-background text-brand focus:ring-brand focus:ring-offset-0"
                required
              />
              <span className="text-xs text-muted-foreground">
                I accept the{" "}
                <a href="/terms" className="text-brand hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" className="text-brand hover:underline">
                  Privacy Policy
                </a>
                <span className="text-destructive ml-1">*</span>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" /> {errors.acceptTerms}
              </p>
            )}

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.newsletter}
                onChange={(e) =>
                  handleInputChange("newsletter", e.target.checked)
                }
                className="mt-0.5 h-4 w-4 rounded border-border bg-background text-brand focus:ring-brand focus:ring-offset-0"
              />
              <span className="text-xs text-muted-foreground">
                Subscribe to newsletter for career tips and updates (optional)
              </span>
            </label>
          </div>

          {/* Form Error */}
          {errors.form && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span>{errors.form}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting === "email" || usernameAvailable === false}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-gradient text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting === "email" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating account...
              </>
            ) : (
              "Create account"
            )}
          </button>

          {/* Security Notice */}
          <div className="flex items-start gap-2 rounded-lg border border-border/70 bg-secondary/40 p-3 text-[11px] text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-brand" />
            <span>
              Secured with Firebase Authentication. Your credentials never touch
              our servers.
            </span>
          </div>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-foreground hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  type: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  suffix?: React.ReactNode;
}

function FormField({
  label,
  icon,
  type,
  id,
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  required,
  suffix,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-medium text-foreground"
      >
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      <div
        className={`flex h-11 items-center gap-2 rounded-lg border bg-background px-3 transition-colors focus-within:border-foreground ${
          error ? "border-destructive" : "border-border"
        }`}
      >
        <span className="text-muted-foreground">{icon}</span>
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
        />
        {suffix && <span className="text-muted-foreground">{suffix}</span>}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive"
        >
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}
