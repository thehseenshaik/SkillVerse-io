import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  RefreshCcw,
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { usePlatformStore } from "@/lib/platform-store";
import { askAssistant } from "@/lib/assistant.client";
import skillverseLogo from "@/assets/skillverse-logo.png";

// Simple markdown parser for bold and italic
function parseMarkdown(text: string) {
  // Parse bold: **text** -> <strong>text</strong>
  let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Parse italic: *text* -> <em>text</em>
  parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Convert newlines to breaks
  parsed = parsed.replace(/\n/g, '<br />');
  return parsed;
}

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Career Assistant — SkillVerse" },
      {
        name: "description",
        content:
          "Chat with SkillVerse Copilot for personalized career, interview and resume coaching.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "AI Career Assistant — SkillVerse" },
      {
        property: "og:description",
        content: "Your on-demand AI career coach.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <AssistantPage />
    </AuthGate>
  ),
});

type Msg = { role: "user" | "assistant"; content: string; suggestions?: string[] };

const WELCOME_SUGGESTIONS = [
  "Analyze my resume",
  "Improve ATS Score",
  "Career Roadmap",
  "Mock Interview",
  "Connect GitHub",
  "Portfolio Help",
  "Profile Setup",
  "Company Match"
];

function AssistantPage() {
  const { user } = useAuth();
  const { profile, completion } = useProfile();
  const { githubData, leetcodeData, github, leetcode } = usePlatformStore();
  
  // Load chat history from localStorage
  const loadChatHistory = useCallback(() => {
    try {
      const saved = localStorage.getItem('skillverse-chat-history');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
    return [
      {
        role: "assistant",
        content: `👋 Welcome to SkillVerse AI! I can help you navigate SkillVerse and improve your career. What would you like to do today?`,
      },
    ];
  }, []);
  
  const [messages, setMessages] = useState<Msg[]>(loadChatHistory());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  
  // Save chat history to localStorage
  const saveChatHistory = useCallback((msgs: Msg[]) => {
    try {
      localStorage.setItem('skillverse-chat-history', JSON.stringify(msgs));
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  }, []);
  
  // Clear chat history
  const clearChatHistory = useCallback(() => {
    try {
      localStorage.removeItem('skillverse-chat-history');
    } catch (e) {
      console.error('Failed to clear chat history:', e);
    }
  }, []);
  
  // Auto-close timer
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 2 * 60 * 1000; // 2 minutes
  
  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      // Auto-redirect to dashboard after 2 minutes of inactivity
      console.log('Auto-redirecting to dashboard due to inactivity');
      window.location.href = '/dashboard';
    }, INACTIVITY_TIMEOUT);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);
  
  // Initialize inactivity timer
  useEffect(() => {
    resetInactivityTimer();
    
    // Reset timer on user activity
    const handleActivity = () => {
      resetInactivityTimer();
    };
    
    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    
    // Cleanup
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [resetInactivityTimer]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    resetInactivityTimer(); // Reset timer on user activity
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    saveChatHistory(next); // Save to localStorage
    setInput("");
    setBusy(true);
    try {
      const history = next.filter(
        (m) => m.role === "user" || m.role === "assistant",
      );
      const response = await askAssistant({
        messages: history.slice(-12),
        profileContext: {
          name: user?.name,
          role: profile.role,
          skills: profile.skills,
          completion,
          githubData: github.connected && githubData && github.username ? {
            username: github.username,
            followers: githubData.profile.followers,
            repositories: githubData.repositories.length,
            languages: githubData.languages,
            stars: githubData.repositories.reduce((sum, repo) => sum + repo.stars, 0),
          } : undefined,
          leetcodeData: leetcode.connected && leetcodeData && leetcode.username ? {
            username: leetcode.username,
            problemsSolved: leetcodeData.stats.All,
            contestRating: leetcodeData.contest.rating,
            acceptanceRate: leetcodeData.acceptanceRate,
            ranking: leetcodeData.contest.globalRanking,
          } : undefined,
        },
      });
      setMessages((cur) => {
        const updated: Msg[] = [
          ...cur,
          { 
            role: "assistant" as const,
            content: response.reply || "…",
            suggestions: response.suggestions || []
          },
        ];
        saveChatHistory(updated); // Save updated history
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    const welcomeMessage: Msg = {
      role: "assistant" as const,
      content: "👋 Welcome to SkillVerse AI! I can help you navigate SkillVerse and improve your career. What would you like to do today?",
    };
    setMessages([welcomeMessage]);
    setError(null);
    clearChatHistory(); // Clear saved history
    resetInactivityTimer(); // Reset timer
  };

  return (
    <PageShell>
      <div className="flex min-h-screen bg-gradient-to-br from-background via-brand/5 to-background">
        {/* Left Side - Animated Content */}
        <div className="hidden lg:flex lg:w-1/3 items-center justify-center p-12 relative overflow-hidden">
          {/* Ambient background matching website theme */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18] animate-grid-pan"
              style={{
                backgroundImage:
                  "linear-gradient(to right, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 8%, transparent) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
                maskImage:
                  "radial-gradient(ellipse 90% 60% at 50% 20%, black 40%, transparent 85%)",
              }}
            />
            <div
              className="absolute -top-32 -left-24 h-[520px] w-[520px] rounded-full blur-3xl opacity-60 dark:opacity-40 animate-aurora"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--brand) 55%, transparent), transparent 70%)",
              }}
            />
            <div
              className="absolute top-24 -right-24 h-[560px] w-[560px] rounded-full blur-3xl opacity-50 dark:opacity-35 animate-aurora-2"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--accent-2) 60%, transparent), transparent 70%)",
              }}
            />
          </div>
          
          <div className="relative z-10 text-center space-y-8">
            <div className="inline-flex items-center gap-3 animate-fade-up">
              <img
                src={skillverseLogo}
                alt="SkillVerse"
                className="h-16 w-16 object-contain"
              />
              <h1 className="text-4xl font-extrabold text-gradient">SkillVerse AI</h1>
            </div>
            
            <div className="space-y-6 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <p className="text-xl text-foreground/80">
                Your AI Career Coach
              </p>
              <div className="space-y-4 text-left max-w-sm mx-auto">
                <div className="flex items-center gap-3 text-foreground/70">
                  <div className="h-2 w-2 rounded-full bg-brand animate-pulse" />
                  <span className="text-sm font-medium">Resume Analysis</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/70">
                  <div className="h-2 w-2 rounded-full bg-brand animate-pulse" style={{ animationDelay: "0.5s" }} />
                  <span className="text-sm font-medium">Interview Preparation</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/70">
                  <div className="h-2 w-2 rounded-full bg-brand animate-pulse" style={{ animationDelay: "1s" }} />
                  <span className="text-sm font-medium">Career Guidance</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/70">
                  <div className="h-2 w-2 rounded-full bg-brand animate-pulse" style={{ animationDelay: "1.5s" }} />
                  <span className="text-sm font-medium">Skill Development</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Chat Box */}
        <div className="flex-1 flex items-center justify-end p-6 lg:p-12">
          <div className="w-full max-w-[540px] h-[700px] glass rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-border/30 relative">
            {/* Cool glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 via-transparent to-accent-2/5 pointer-events-none" />
            <div className="absolute -inset-1 bg-gradient-to-r from-brand/10 via-transparent to-accent-2/10 pointer-events-none blur-sm" />
            
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent animate-border-glow pointer-events-none" />
            {/* Simple Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <img
                    src={skillverseLogo}
                    alt="SkillVerse"
                    className="h-5 w-5 object-contain"
                  />
                  <span className="text-sm font-bold text-foreground">
                    SkillVerse AI
                  </span>
                </div>
                <div className="h-4 w-px bg-border/40" />
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={reset}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border/60 bg-background/50 backdrop-blur-sm px-3 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  <RefreshCcw className="h-3.5 w-3.5" /> New chat
                </button>
              </div>
            </div>

          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 relative">
            {messages.map((m, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-bottom duration-300">
                <Bubble msg={m} />
                {m.role === "assistant" && m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2 pl-11 animate-in fade-in slide-in-from-bottom duration-300 delay-100">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-brand/30 bg-gradient-to-r from-brand/10 to-accent-2/10 px-3 py-1.5 text-[11px] font-medium text-foreground transition-all hover:border-brand/50 hover:text-brand hover:scale-105 hover:shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {busy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in">
                <Bot className="h-3.5 w-3.5" />
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand shadow-[0_0_10px_rgba(139,92,246,0.5)] [animation-delay:120ms]" />
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand shadow-[0_0_10px_rgba(139,92,246,0.5)] [animation-delay:240ms]" />
                </span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Error Display */}
          {error && (
            <div className="border-t border-destructive/30 bg-destructive/5 px-5 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-border/30 p-4 bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-end gap-2"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder="Ask about SkillVerse features..."
                className="max-h-32 flex-1 resize-none rounded-lg border border-border/60 bg-background/80 backdrop-blur-sm px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-brand/50 focus:ring-2 focus:ring-brand/20 transition-all"
                disabled={busy}
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="inline-flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-xs font-semibold text-white disabled:opacity-60 transition-colors"
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </PageShell>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={"flex gap-3 " + (isUser ? "flex-row-reverse" : "")}>
      <div
        className={
          "grid h-8 w-8 flex-shrink-0 place-items-center rounded-full text-xs font-semibold " +
          (isUser
            ? "bg-foreground text-background"
            : "bg-muted text-foreground")
        }
      >
        {isUser ? (
          <UserIcon className="h-3.5 w-3.5" />
        ) : (
          <Bot className="h-3.5 w-3.5" />
        )}
      </div>
      <div
        className={
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
          (isUser
            ? "bg-foreground text-background"
            : "border border-border/60 bg-background text-foreground")
        }
      >
        {isUser ? msg.content : <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />}
      </div>
    </div>
  );
}
