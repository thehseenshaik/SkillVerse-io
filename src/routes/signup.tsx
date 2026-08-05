import { createFileRoute, Link } from "@tanstack/react-router";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import skillverseLogo from "@/assets/skillverse-logo.png";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — SkillVerse" },
      {
        name: "description",
        content:
          "Sign up for SkillVerse and build one unified career profile from LinkedIn, GitHub, LeetCode and more.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Create your account — SkillVerse" },
      {
        property: "og:description",
        content: "Start building your unified career profile in seconds.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Premium unified background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-brand/10 to-brand/5" />
      <div className="absolute inset-0">
        {/* Circular design elements spread across entire page */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-brand/30 animate-aurora" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full border border-brand/20 animate-aurora-2" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 rounded-full border border-brand/25 animate-float" />
        <div
          className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full border border-brand/15 animate-float"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Shines and glows */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand/40 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-brand/30 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-brand/35 rounded-full blur-3xl animate-pulse-glow" />
        <div
          className="absolute top-1/4 right-1/3 w-48 h-48 bg-brand/25 rounded-full blur-2xl animate-float"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Navigation Bar - matching homepage size */}
      <nav className="absolute top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={skillverseLogo}
              alt="SkillVerse"
              className="h-6 w-6 object-contain"
            />
            <span className="text-xl font-bold text-foreground">
              SkillVerse
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex w-full pt-14">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8">
          <div className="text-center max-w-lg">
            <h1 className="text-5xl font-extrabold text-gradient mb-3 animate-fade-up">
              SkillVerse
            </h1>
            <p
              className="text-base text-foreground/90 mb-8 animate-fade-up"
              style={{ animationDelay: "0.15s" }}
            >
              Your Complete Career Operating System
            </p>
            <div
              className="space-y-4 text-left animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="flex items-center gap-3 text-foreground/80">
                <div className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse flex-shrink-0" />
                <span className="text-sm font-medium">
                  LinkedIn Integration
                </span>
              </div>
              <div className="flex items-center gap-3 text-foreground/80">
                <div
                  className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse flex-shrink-0"
                  style={{ animationDelay: "0.5s" }}
                />
                <span className="text-sm font-medium">GitHub Sync</span>
              </div>
              <div className="flex items-center gap-3 text-foreground/80">
                <div
                  className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse flex-shrink-0"
                  style={{ animationDelay: "1s" }}
                />
                <span className="text-sm font-medium">AI Career Assistant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Signup Form */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-6 text-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <img
                  src={skillverseLogo}
                  alt="SkillVerse"
                  className="h-6 w-6 object-contain"
                />
                <h1 className="text-xl font-bold text-foreground">
                  SkillVerse
                </h1>
              </div>
              <p className="text-xs text-muted-foreground">
                Your Complete Career Operating System
              </p>
            </div>
            <SignUpForm />
          </div>
        </div>
      </div>
    </div>
  );
}
