/**
 * Welcome Experience Component
 * Displays welcome screen after account creation with next steps guidance
 */

import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronRight,
  Sparkles,
  GraduationCap,
  FileText,
  Globe,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

type Step = "welcome" | "next-steps" | "complete";

export function WelcomeExperience() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("welcome");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleNextStep = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setCurrentStep("next-steps");
      setIsAnimating(true);
    }, 300);
  };

  const handleComplete = () => {
    navigate({ to: "/dashboard", replace: true });
  };

  const handleStartOnboarding = () => {
    // Onboarding will be integrated into dashboard flow
    navigate({ to: "/dashboard", replace: true });
  };

  const handleSkipOnboarding = () => {
    navigate({ to: "/dashboard", replace: true });
  };

  // Welcome Step
  if (currentStep === "welcome") {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <div className="glass rounded-3xl p-8 shadow-elegant text-center">
          <div
            className={`transition-all duration-500 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {/* Celebration Icon */}
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-brand-gradient text-white animate-bounce">
              <Sparkles className="h-12 w-12" />
            </div>

            {/* Welcome Message */}
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Welcome to SkillVerse, {user?.name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your career command center is ready. Let's make your professional
              journey extraordinary.
            </p>

            {/* Success Checkmarks */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <SuccessItem
                icon={<CheckCircle className="h-5 w-5" />}
                text="Account created"
              />
              <SuccessItem
                icon={<CheckCircle className="h-5 w-5" />}
                text="Email verified"
              />
              <SuccessItem
                icon={<CheckCircle className="h-5 w-5" />}
                text="Profile initialized"
              />
              <SuccessItem
                icon={<CheckCircle className="h-5 w-5" />}
                text="Ready to go"
              />
            </div>

            {/* CTA Button */}
            <button
              onClick={handleNextStep}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-gradient px-8 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02]"
            >
              Get Started <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Next Steps Step
  if (currentStep === "next-steps") {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <div className="glass rounded-3xl p-8 shadow-elegant">
          <div
            className={`transition-all duration-500 ${isAnimating ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">What's Next?</h2>
              <p className="text-muted-foreground">
                Complete these steps to unlock your full potential
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <NextStepCard
                icon={<GraduationCap className="h-6 w-6" />}
                title="Complete Your Profile"
                description="Add your education, experience, and skills to build a comprehensive profile"
                status="recommended"
                onClick={handleStartOnboarding}
              />
              <NextStepCard
                icon={<FileText className="h-6 w-6" />}
                title="Build Your Resume"
                description="Create a professional resume using our AI-powered resume builder"
                status="coming-soon"
                onClick={() => toast.info("Resume builder coming soon!")}
              />
              <NextStepCard
                icon={<Globe className="h-6 w-6" />}
                title="Create Portfolio"
                description="Showcase your projects and work with a beautiful portfolio"
                status="coming-soon"
                onClick={() => toast.info("Portfolio builder coming soon!")}
              />
              <NextStepCard
                icon={<Users className="h-6 w-6" />}
                title="Join Community"
                description="Connect with peers, mentors, and industry professionals"
                status="coming-soon"
                onClick={() => toast.info("Community features coming soon!")}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSkipOnboarding}
                className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background text-sm font-medium text-muted-foreground transition-all hover:border-foreground/40 hover:bg-secondary/60"
              >
                Skip for now
              </button>
              <button
                onClick={handleStartOnboarding}
                className="flex-1 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-gradient text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.01]"
              >
                Start Onboarding <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function SuccessItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-brand/20 bg-brand/5 p-3">
      <span className="text-brand">{icon}</span>
      <span className="text-sm font-medium text-foreground">{text}</span>
    </div>
  );
}

function NextStepCard({
  icon,
  title,
  description,
  status,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "recommended" | "coming-soon";
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={status === "coming-soon"}
      className={`w-full text-left rounded-xl border p-4 transition-all hover:scale-[1.01] ${
        status === "recommended"
          ? "border-brand/30 bg-brand/5 hover:border-brand/50 hover:bg-brand/10"
          : "border-border/70 bg-secondary/30 opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${
            status === "recommended"
              ? "bg-brand/10 text-brand"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {status === "coming-soon" && (
              <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Soon
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {status === "recommended" && (
          <ChevronRight className="h-5 w-5 text-muted-foreground mt-1" />
        )}
      </div>
    </button>
  );
}
