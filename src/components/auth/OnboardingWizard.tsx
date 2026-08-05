/**
 * Onboarding Wizard Component
 * Multi-step wizard to collect user information after first login
 */

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import {
  ArrowRight,
  ArrowLeft,
  Camera,
  Check,
  GraduationCap,
  Briefcase,
  Target,
  Heart,
  Building2,
  Loader2,
  X,
} from "lucide-react";
import { updateUserProfile } from "@/services/auth.service";
import { onboardingSchema } from "@/lib/validation/auth";
import type { OnboardingFormData } from "@/lib/validation/auth";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

const INTERESTS = [
  "Software Development",
  "Data Science",
  "Machine Learning",
  "Web Development",
  "Mobile Development",
  "Cloud Computing",
  "Cybersecurity",
  "DevOps",
  "UI/UX Design",
  "Product Management",
  "Blockchain",
  "AI/ML",
  "Game Development",
  "IoT",
  "Robotics",
];

const DOMAINS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Entertainment",
  "Social Media",
  "Travel",
  "Food",
  "Sports",
  "Fashion",
  "Automotive",
  "Real Estate",
  "Energy",
  "Manufacturing",
];

const COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Apple",
  "Meta",
  "Netflix",
  "Tesla",
  "SpaceX",
  "OpenAI",
  "Stripe",
  "Airbnb",
  "Uber",
  "LinkedIn",
  "Twitter",
  "Salesforce",
];

type Step =
  | "welcome"
  | "education"
  | "career"
  | "interests"
  | "domains"
  | "companies"
  | "complete";

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [formData, setFormData] = useState<OnboardingFormData>({
    profilePhoto: "",
    college: "",
    degree: "",
    branch: "",
    graduationYear: "",
    currentRole: "",
    careerGoal: "",
    interests: [],
    preferredDomains: [],
    preferredCompanies: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    const steps: Step[] = [
      "welcome",
      "education",
      "career",
      "interests",
      "domains",
      "companies",
      "complete",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    const steps: Step[] = [
      "welcome",
      "education",
      "career",
      "interests",
      "domains",
      "companies",
      "complete",
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleSkip = () => {
    setCurrentStep("complete");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate form data
      const result = onboardingSchema.safeParse(formData);
      if (!result.success) {
        toast.error("Please fill in the required fields");
        return;
      }

      // Update user profile
      await updateUserProfile({
        metadata: {
          onboardingCompleted: true,
        } as any,
      });

      toast.success("Onboarding completed successfully!");

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate({ to: "/dashboard", replace: true });
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: (prev.interests || []).includes(interest)
        ? (prev.interests || []).filter((i) => i !== interest)
        : [...(prev.interests || []), interest],
    }));
  };

  const toggleDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredDomains: (prev.preferredDomains || []).includes(domain)
        ? (prev.preferredDomains || []).filter((d) => d !== domain)
        : [...(prev.preferredDomains || []), domain],
    }));
  };

  const toggleCompany = (company: string) => {
    setFormData((prev) => ({
      ...prev,
      preferredCompanies: (prev.preferredCompanies || []).includes(company)
        ? (prev.preferredCompanies || []).filter((c) => c !== company)
        : [...(prev.preferredCompanies || []), company],
    }));
  };

  // Welcome Step
  if (currentStep === "welcome") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="glass rounded-3xl p-8 shadow-elegant text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-gradient text-white">
            <GraduationCap className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to SkillVerse!
          </h1>
          <p className="mt-3 text-muted-foreground">
            Let's personalize your experience to help you achieve your career
            goals.
          </p>
          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-secondary/40 p-4 text-left">
              <Target className="mt-0.5 h-5 w-5 text-brand flex-shrink-0" />
              <div>
                <p className="font-semibold">Personalized Recommendations</p>
                <p className="text-sm text-muted-foreground">
                  Get tailored career advice and opportunities.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-secondary/40 p-4 text-left">
              <Briefcase className="mt-0.5 h-5 w-5 text-brand flex-shrink-0" />
              <div>
                <p className="font-semibold">Career Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Track your progress towards your dream companies.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-secondary/40 p-4 text-left">
              <Heart className="mt-0.5 h-5 w-5 text-brand flex-shrink-0" />
              <div>
                <p className="font-semibold">Community Connection</p>
                <p className="text-sm text-muted-foreground">
                  Connect with like-minded professionals.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background text-sm font-medium text-muted-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
            >
              Skip for now
            </button>
            <button
              onClick={handleNext}
              className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-gradient text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01]"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Education Step
  if (currentStep === "education") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="glass rounded-3xl p-8 shadow-elegant">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-6 w-6 text-brand" />
              <h2 className="text-2xl font-bold">Education</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Tell us about your educational background (optional).
            </p>
          </div>

          <div className="space-y-4">
            <FormField
              label="College/University"
              value={formData.college || ""}
              onChange={(v) => setFormData((prev) => ({ ...prev, college: v }))}
              placeholder="e.g., MIT, Stanford, IIT"
            />
            <FormField
              label="Degree"
              value={formData.degree || ""}
              onChange={(v) => setFormData((prev) => ({ ...prev, degree: v }))}
              placeholder="e.g., B.Tech, B.S., M.S., Ph.D."
            />
            <FormField
              label="Branch/Major"
              value={formData.branch || ""}
              onChange={(v) => setFormData((prev) => ({ ...prev, branch: v }))}
              placeholder="e.g., Computer Science, Electrical Engineering"
            />
            <FormField
              label="Graduation Year"
              value={formData.graduationYear || ""}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, graduationYear: v }))
              }
              placeholder="e.g., 2024"
              maxLength={4}
            />
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handlePrevious}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex-1" />
            <button
              onClick={handleSkip}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-6 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-gradient px-6 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01]"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Career Step
  if (currentStep === "career") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="glass rounded-3xl p-8 shadow-elegant">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-6 w-6 text-brand" />
              <h2 className="text-2xl font-bold">Career</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Help us understand your career goals.
            </p>
          </div>

          <div className="space-y-4">
            <FormField
              label="Current Role"
              value={formData.currentRole || ""}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, currentRole: v }))
              }
              placeholder="e.g., Software Engineer, Student, Freelancer"
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Career Goal
              </label>
              <textarea
                value={formData.careerGoal || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    careerGoal: e.target.value,
                  }))
                }
                placeholder="Describe your career aspirations..."
                rows={4}
                className="w-full rounded-lg border border-border bg-background p-3 text-sm text-foreground outline-none focus:border-foreground resize-none"
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handlePrevious}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex-1" />
            <button
              onClick={handleSkip}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-6 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-gradient px-6 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01]"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interests Step
  if (currentStep === "interests") {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="glass rounded-3xl p-8 shadow-elegant">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-6 w-6 text-brand" />
              <h2 className="text-2xl font-bold">Interests</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Select your areas of interest (select at least one).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`inline-flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                  (formData.interests || []).includes(interest)
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-background text-foreground hover:border-foreground/40"
                }`}
              >
                {(formData.interests || []).includes(interest) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4 rounded border border-border" />
                )}
                {interest}
              </button>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handlePrevious}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex-1" />
            <button
              onClick={handleSkip}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-6 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              disabled={(formData.interests || []).length === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-gradient px-6 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Domains Step
  if (currentStep === "domains") {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="glass rounded-3xl p-8 shadow-elegant">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-6 w-6 text-brand" />
              <h2 className="text-2xl font-bold">Preferred Domains</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Select industries you'd like to work in (select at least one).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DOMAINS.map((domain) => (
              <button
                key={domain}
                type="button"
                onClick={() => toggleDomain(domain)}
                className={`inline-flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                  (formData.preferredDomains || []).includes(domain)
                    ? "border-brand bg-background/10 text-brand"
                    : "border-border bg-background text-foreground hover:border-foreground/40"
                }`}
              >
                {(formData.preferredDomains || []).includes(domain) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4 rounded border border-border" />
                )}
                {domain}
              </button>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handlePrevious}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex-1" />
            <button
              onClick={handleSkip}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-6 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              disabled={(formData.preferredDomains || []).length === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-gradient px-6 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Companies Step
  if (currentStep === "companies") {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="glass rounded-3xl p-8 shadow-elegant">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-6 w-6 text-brand" />
              <h2 className="text-2xl font-bold">Dream Companies</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Select companies you'd like to work for (optional).
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COMPANIES.map((company) => (
              <button
                key={company}
                type="button"
                onClick={() => toggleCompany(company)}
                className={`inline-flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                  (formData.preferredCompanies || []).includes(company)
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border bg-background text-foreground hover:border-foreground/40"
                }`}
              >
                {(formData.preferredCompanies || []).includes(company) ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <div className="h-4 w-4 rounded border border-border" />
                )}
                {company}
              </button>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={handlePrevious}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 text-sm font-medium text-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex-1" />
            <button
              onClick={handleSkip}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background px-6 text-sm font-medium text-muted-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
            >
              Skip
            </button>
            <button
              onClick={handleNext}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-gradient px-6 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01]"
            >
              Complete <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Complete Step
  if (currentStep === "complete") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="glass rounded-3xl p-8 shadow-elegant text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <Check className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">You're all set!</h1>
          <p className="mt-3 text-muted-foreground">
            Your profile has been set up. Let's start building your career.
          </p>

          <div className="mt-8 space-y-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-gradient text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Go to Dashboard"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: FormFieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-foreground transition-colors"
      />
    </div>
  );
}
