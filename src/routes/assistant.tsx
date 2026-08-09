import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  RefreshCcw,
  Compass,
  MessageSquare,
  Zap,
  Target,
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
  let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
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
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
    return [
      {
        role: "assistant",
        content: `👋 Welcome to SkillVerse AI Copilot! I am your personal career coach. How can I assist your career growth today?`,
        suggestions: ["Analyze my resume", "Career Roadmap", "Mock Interview", "Connect Platforms"]
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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    saveChatHistory(next);
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
        saveChatHistory(updated);
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
      content: "👋 Welcome to SkillVerse AI Copilot! How can I assist your career growth today?",
      suggestions: ["Analyze my resume", "Career Roadmap", "Mock Interview", "Connect Platforms"]
    };
    setMessages([welcomeMessage]);
    setError(null);
    clearChatHistory();
  };

  return (
    <PageShell>
      <div className="w-full h-[calc(100vh-5rem)] max-w-7xl mx-auto p-2 sm:p-4 md:p-6 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-hidden">
        {/* Left Side Panel - Desktop & Large Displays */}
        <div className="hidden lg:flex lg:w-80 xl:w-96 flex-col justify-between p-6 glass rounded-3xl border border-border/30 relative overflow-hidden flex-shrink-0">
          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div
              className="absolute -top-24 -left-20 h-72 w-72 rounded-full blur-3xl opacity-40 dark:opacity-20 animate-aurora"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--brand) 60%, transparent), transparent 70%)",
              }}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img
                src={skillverseLogo}
                alt="SkillVerse"
                className="h-10 w-10 object-contain"
              />
              <div>
                <h2 className="text-xl font-bold text-gradient leading-tight">SkillVerse AI</h2>
                <p className="text-xs text-muted-foreground">Career & Interview Copilot</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-foreground/80 p-2.5 rounded-xl bg-background/50 border border-border/40">
                <Target className="h-4 w-4 text-brand flex-shrink-0" />
                <span>Resume & ATS Score Optimization</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-foreground/80 p-2.5 rounded-xl bg-background/50 border border-border/40">
                <Zap className="h-4 w-4 text-brand flex-shrink-0" />
                <span>Interactive Mock Interview Coach</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-foreground/80 p-2.5 rounded-xl bg-background/50 border border-border/40">
                <Compass className="h-4 w-4 text-brand flex-shrink-0" />
                <span>Personalized Career Roadmaps</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border/30">
              <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-brand" /> Quick Topics
              </p>
              <div className="flex flex-wrap gap-2">
                {WELCOME_SUGGESTIONS.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => send(topic)}
                    className="text-[11px] px-3 py-1.5 rounded-lg border border-border/50 bg-background/60 text-foreground hover:border-brand/50 hover:text-brand hover:bg-brand/5 transition-all text-left"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">AI Active</span>
            </div>
            <button
              onClick={reset}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RefreshCcw className="h-3 w-3" /> Reset Chat
            </button>
          </div>
        </div>

        {/* Right Side / Main Container - Chat Box for ALL Dimensions */}
        <div className="flex-1 w-full h-full flex flex-col glass rounded-2xl sm:rounded-3xl shadow-2xl border border-border/30 overflow-hidden relative">
          {/* Top Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border/30 bg-background/60 backdrop-blur-md flex-shrink-0">
            <div className="flex items-center gap-3">
              <img
                src={skillverseLogo}
                alt="SkillVerse"
                className="h-7 w-7 object-contain"
              />
              <div>
                <h1 className="text-sm font-bold text-foreground leading-none">
                  SkillVerse Copilot
                </h1>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready to assist
                </span>
              </div>
            </div>
            <button
              onClick={reset}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/60 bg-background/60 px-3 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <RefreshCcw className="h-3.5 w-3.5" /> <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>

          {/* Scrollable Messages Stream */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 relative">
            {messages.map((m, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Bubble msg={m} />
                {m.role === "assistant" && m.suggestions && m.suggestions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 sm:gap-2 pl-9 sm:pl-11">
                    {m.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-brand/30 bg-gradient-to-r from-brand/10 to-accent-2/10 px-3 py-1 text-[11px] font-medium text-foreground transition-all hover:border-brand/50 hover:text-brand hover:scale-105"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground p-2 animate-in fade-in">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-muted text-foreground flex-shrink-0">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1.5 bg-muted/50 px-3 py-2 rounded-2xl border border-border/40">
                  <span className="text-xs font-medium">Copilot is thinking</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:0.4s]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Error Message if any */}
          {error && (
            <div className="border-t border-destructive/30 bg-destructive/10 px-4 py-2 text-xs text-destructive flex-shrink-0">
              {error}
            </div>
          )}

          {/* Bottom Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-border/30 bg-background/70 backdrop-blur-md flex-shrink-0">
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
                placeholder="Ask Copilot anything..."
                className="max-h-32 flex-1 resize-none rounded-xl border border-border/60 bg-background px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                disabled={busy}
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 text-xs font-semibold text-white hover:bg-brand-strong disabled:opacity-50 transition-all flex-shrink-0"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={"flex gap-2.5 sm:gap-3 " + (isUser ? "flex-row-reverse" : "")}>
      <div
        className={
          "grid h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 place-items-center rounded-full text-xs font-semibold mt-0.5 " +
          (isUser
            ? "bg-brand text-white shadow-sm"
            : "bg-muted text-foreground border border-border/50")
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
          "max-w-[85%] sm:max-w-[78%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm " +
          (isUser
            ? "bg-brand text-white rounded-tr-none"
            : "border border-border/60 bg-background/80 text-foreground rounded-tl-none")
        }
      >
        {isUser ? msg.content : <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }} />}
      </div>
    </div>
  );
}
