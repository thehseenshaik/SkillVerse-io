import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  RefreshCcw,
  Compass,
  Target,
  Zap,
  Code,
  Plus
} from "lucide-react";
import { PageShell } from "@/components/SiteChrome";
import { AuthGate } from "@/components/AuthGate";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/lib/profile-context";
import { usePlatformStore } from "@/lib/platform-store";
import { askAssistant } from "@/lib/assistant.client";
import skillverseLogo from "@/assets/skillverse-logo.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Safe Markdown parser for bold and italic text
function parseMarkdown(text: string | undefined | null) {
  if (!text || typeof text !== "string") return "";
  let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
  parsed = parsed.replace(/\n/g, '<br />');
  return parsed;
}

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "SkillVerse Copilot — AI Career Assistant" },
      {
        name: "description",
        content:
          "Get personalized career guidance using your SkillVerse profile, resume, and developer activity.",
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

const QUICK_ACTIONS = [
  "Analyze my resume",
  "Improve ATS score",
  "Career roadmap",
  "Mock interview",
  "Profile review",
  "Connect platforms"
];

function AssistantPage() {
  const { user } = useAuth();
  const { profile, completion } = useProfile();
  const { githubData, leetcodeData, github, leetcode } = usePlatformStore();

  const firstName = useMemo(() => {
    const name = profile?.fullName || user?.name || "Developer";
    return name.trim().split(" ")[0];
  }, [profile?.fullName, user?.name]);

  // Load chat history safely from localStorage
  const loadChatHistory = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem('skillverse-chat-history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const valid = parsed.filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string');
            if (valid.length > 0) return valid;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load chat history:', e);
    }
    return [
      {
        role: "assistant" as const,
        content: `Hi ${firstName} — I'm your SkillVerse Copilot. I can help you improve your resume, prepare for interviews, build a career roadmap, and analyze your developer activity.`,
        suggestions: ["Analyze my resume", "Career roadmap", "Mock interview", "Profile review"]
      },
    ];
  }, [firstName]);

  const [messages, setMessages] = useState<Msg[]>(() => loadChatHistory());
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Save chat history to localStorage safely
  const saveChatHistory = useCallback((msgs: Msg[]) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem('skillverse-chat-history', JSON.stringify(msgs));
      }
    } catch (e) {
      console.error('Failed to save chat history:', e);
    }
  }, []);

  // Clear chat history safely
  const clearChatHistory = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem('skillverse-chat-history');
      }
    } catch (e) {
      console.error('Failed to clear chat history:', e);
    }
  }, []);

  useEffect(() => {
    try {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    } catch (err) {
      // Ignore scroll errors
    }
  }, [messages, busy]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    const next: Msg[] = [...(Array.isArray(messages) ? messages : []), { role: "user", content: trimmed }];
    setMessages(next);
    saveChatHistory(next);
    setInput("");
    setBusy(true);

    try {
      const history = next.filter(
        (m) => m && (m.role === "user" || m.role === "assistant"),
      );
      const response = await askAssistant({
        messages: history.slice(-12),
        profileContext: {
          name: user?.name,
          role: profile?.role,
          skills: profile?.skills,
          completion: typeof completion === 'number' ? completion : 0,
          githubData: github?.connected && githubData && github?.username ? {
            username: github.username,
            followers: typeof githubData.profile?.followers === 'number' ? githubData.profile.followers : 0,
            repositories: Array.isArray(githubData.repositories) ? githubData.repositories.length : 0,
            languages: githubData.languages || {},
            stars: Array.isArray(githubData.repositories) ? githubData.repositories.reduce((sum, repo) => sum + (repo?.stars || 0), 0) : 0,
          } : undefined,
          leetcodeData: leetcode?.connected && leetcodeData && leetcode?.username ? {
            username: leetcode.username,
            problemsSolved: typeof leetcodeData.stats?.All === 'number' ? leetcodeData.stats.All : 0,
            contestRating: typeof leetcodeData.contest?.rating === 'number' ? leetcodeData.contest.rating : 0,
            acceptanceRate: typeof leetcodeData.acceptanceRate === 'number' ? leetcodeData.acceptanceRate : 0,
            ranking: typeof leetcodeData.contest?.globalRanking === 'number' ? leetcodeData.contest.globalRanking : 0,
          } : undefined,
        },
      });

      setMessages((cur) => {
        const safeCur = Array.isArray(cur) ? cur : [];
        const updated: Msg[] = [
          ...safeCur,
          {
            role: "assistant" as const,
            content: response.reply || "I've reviewed your request. Let me know if you need anything else!",
            suggestions: response.suggestions || ["Career roadmap", "Mock interview", "Profile review"]
          },
        ];
        saveChatHistory(updated);
        return updated;
      });
    } catch (err) {
      setError("Something went wrong. I couldn't complete that request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    const welcomeMessage: Msg = {
      role: "assistant" as const,
      content: `Hi ${firstName} — I'm your SkillVerse Copilot. I can help you improve your resume, prepare for interviews, build a career roadmap, and analyze your developer activity.`,
      suggestions: ["Analyze my resume", "Career roadmap", "Mock interview", "Profile review"]
    };
    setMessages([welcomeMessage]);
    setError(null);
    clearChatHistory();
  };

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-hero min-h-[calc(100vh-3.5rem)] flex flex-col justify-between">
        {/* Soft Ambient Backdrop */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-24 h-[450px] w-[450px] sm:h-[560px] sm:w-[560px] -translate-x-1/2 rounded-full bg-brand/15 blur-[120px] animate-pulse-glow" />
        </div>

        <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-6 sm:py-8 space-y-5 sm:space-y-6 animate-fade-up flex-1 flex flex-col">
          
          {/* Header Title Section */}
          <div className="flex flex-wrap items-end justify-between gap-3 shrink-0">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/50 px-2.5 py-1 text-[10px] sm:text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand backdrop-blur">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
                </span>
                CAREER COPILOT
              </div>
              <h1 className="mt-2 text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Your AI career <span className="text-gradient">copilot</span>.
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Get personalized guidance using your SkillVerse profile, resume, and developer activity.
              </p>
            </div>
          </div>

          {/* Main Workspace Layout (Adaptive across Desktop, Tablet, and Mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch flex-1 min-h-0">
            
            {/* LEFT SIDEBAR (Compact Overview on Mobile / Sticky Sidebar on Desktop) */}
            <div className="lg:col-span-4 flex flex-col justify-between glass rounded-2xl sm:rounded-3xl border border-border/70 bg-card p-4 sm:p-6 shadow-elegant overflow-y-auto space-y-5 lg:h-[calc(100vh-14rem)] lg:min-h-[540px]">
              
              <div className="space-y-5">
                {/* Brand Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={skillverseLogo}
                    alt="SkillVerse"
                    className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
                  />
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-foreground">SkillVerse AI</h2>
                    <p className="text-[11px] sm:text-xs text-muted-foreground">Your personal AI career assistant</p>
                  </div>
                </div>

                {/* Core Capabilities */}
                <div className="space-y-2">
                  <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    CAPABILITIES
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-secondary/40 border border-border/50 space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <Target className="h-3.5 w-3.5 text-brand shrink-0" /> Resume & ATS
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                        Optimize your resume and improve ATS performance.
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-secondary/40 border border-border/50 space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <Compass className="h-3.5 w-3.5 text-brand shrink-0" /> Career Roadmap
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                        Build a practical path toward your target role.
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-secondary/40 border border-border/50 space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <Zap className="h-3.5 w-3.5 text-brand shrink-0" /> Interview Coach
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                        Practice interviews and get personalized feedback.
                      </p>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-secondary/40 border border-border/50 space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <Code className="h-3.5 w-3.5 text-brand shrink-0" /> Developer Growth
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-snug">
                        Use your coding activity to identify growth areas.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Left Sidebar Footer */}
              <div className="pt-3 sm:pt-4 border-t border-border/50 flex items-center justify-between text-xs shrink-0">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-foreground text-xs">AI Ready</span>
                </div>
                <button
                  onClick={reset}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors text-xs font-medium"
                >
                  Reset Chat <RefreshCcw className="h-3 w-3 ml-0.5" />
                </button>
              </div>

            </div>

            {/* RIGHT SIDE: Main Chat Workspace (Fits dynamically across viewport height) */}
            <div className="lg:col-span-8 flex flex-col glass rounded-2xl sm:rounded-3xl border border-border/70 bg-card shadow-elegant overflow-hidden h-[540px] sm:h-[620px] lg:h-[calc(100vh-14rem)] lg:min-h-[540px]">
              
              {/* Workspace Top Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-border/50 bg-background/60 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <img
                    src={skillverseLogo}
                    alt="SkillVerse"
                    className="h-6 w-6 sm:h-7 sm:w-7 object-contain"
                  />
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-foreground">SkillVerse Copilot</h2>
                    <span className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ready to assist
                    </span>
                  </div>
                </div>

                <Button
                  onClick={reset}
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1 sm:gap-1.5 font-medium px-2.5 sm:px-3 h-8 sm:h-9"
                >
                  <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">New Chat</span><span className="sm:hidden">New</span>
                </Button>
              </div>

              {/* Scrollable Conversation Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 relative">
                
                {/* Dynamic Context Header Badge */}
                <div className="flex items-center justify-center">
                  <Badge variant="outline" className="text-[9.5px] sm:text-[10px] font-semibold text-muted-foreground bg-secondary/50 border-border/60 py-0.5 px-2.5 sm:px-3">
                    <Sparkles className="h-3 w-3 text-brand mr-1" /> Using your SkillVerse profile & developer activity
                  </Badge>
                </div>

                {Array.isArray(messages) && messages.map((m, i) => (
                  <div key={i} className="animate-in fade-in duration-300">
                    {m && <Bubble msg={m} userAvatar={user?.avatarUrl || (profile as any)?.photoURL} />}
                    
                    {/* Suggested reply chips */}
                    {m && m.role === "assistant" && Array.isArray(m.suggestions) && m.suggestions.length > 0 && (
                      <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1.5 sm:gap-2 pl-9 sm:pl-11">
                        {m.suggestions.map((s) => (
                          <button
                            key={s}
                            onClick={() => send(s)}
                            className="text-[10.5px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 rounded-full border border-brand/30 bg-brand/5 text-foreground hover:border-brand hover:text-brand transition-all"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {busy && (
                  <div className="flex items-start gap-2.5 sm:gap-3 text-xs text-muted-foreground animate-in fade-in">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-secondary flex items-center justify-center text-foreground shrink-0 border border-border">
                      <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-brand" />
                    </div>
                    <div className="bg-card border border-border/70 p-2.5 sm:p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                      <span className="font-medium text-xs text-foreground">Copilot is thinking</span>
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

              {/* Error Notification Banner */}
              {error && (
                <div className="border-t border-destructive/30 bg-destructive/10 px-3 sm:px-4 py-2 text-xs text-destructive flex items-center justify-between shrink-0">
                  <span className="truncate">{error}</span>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive shrink-0" onClick={() => setError(null)}>
                    Dismiss
                  </Button>
                </div>
              )}

              {/* Sticky Bottom Chat Input */}
              <div className="p-3 sm:p-4 border-t border-border/50 bg-background/90 backdrop-blur-md shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(input);
                  }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send(input);
                      }
                    }}
                    placeholder="Ask your career copilot anything..."
                    className="flex-1 bg-background border-border rounded-xl text-xs sm:text-sm h-10 sm:h-11 px-3 sm:px-4 focus-visible:ring-brand/20"
                    disabled={busy}
                  />
                  <Button
                    type="submit"
                    disabled={busy || !input.trim()}
                    className="bg-brand text-brand-foreground hover:opacity-90 font-semibold px-3.5 sm:px-4 h-10 sm:h-11 rounded-xl text-xs shadow-sm shrink-0 flex items-center gap-1.5"
                  >
                    {busy ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </Button>
                </form>
              </div>

            </div>

          </div>

        </div>
      </section>
    </PageShell>
  );
}

function Bubble({ msg, userAvatar }: { msg: Msg; userAvatar?: string }) {
  if (!msg || !msg.role) return null;
  const isUser = msg.role === "user";
  
  return (
    <div className={"flex gap-2.5 sm:gap-3 " + (isUser ? "flex-row-reverse" : "")}>
      <div className="shrink-0 mt-0.5">
        {isUser ? (
          userAvatar ? (
            <img src={userAvatar} alt="User" className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover ring-2 ring-brand/20" />
          ) : (
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-brand to-brand-strong text-white flex items-center justify-center shadow-sm">
              <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          )
        ) : (
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-secondary border border-border flex items-center justify-center text-brand shadow-sm">
            <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        )}
      </div>

      <div
        className={
          "max-w-[88%] sm:max-w-[80%] leading-relaxed text-xs sm:text-sm p-3.5 sm:p-4 shadow-sm break-words " +
          (isUser
            ? "bg-brand/10 text-foreground border border-brand/20 rounded-2xl rounded-tr-none"
            : "bg-card text-foreground border border-border/70 rounded-2xl rounded-tl-none")
        }
      >
        {isUser ? (msg.content || "") : <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content || "") }} />}
      </div>
    </div>
  );
}
