import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  ArrowLeft,
  Search,
  Shield,
  ShieldOff,
  Users,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Github,
  Chrome,
  AtSign,
} from "lucide-react";
import { PageShell, SiteNav, SiteFooter } from "@/components/SiteChrome";
import { PageLoader } from "@/components/PageLoader";
import { useAuth } from "@/lib/auth-context";
import { fbDb } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin · SkillVerse" },
      {
        name: "description",
        content:
          "SkillVerse admin console — manage users, review profiles, and monitor activity.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type UserDoc = {
  id: string;
  email?: string;
  displayName?: string;
  role?: "admin" | "user";
  provider?: "email" | "google" | "github";
  createdAt?: { seconds: number } | null;
  updatedAt?: { seconds: number } | null;
  // profile fields (partial – computed for completion)
  fullName?: string;
  headline?: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills?: string;
  education?: unknown[];
  experience?: unknown[];
  projects?: unknown[];
  links?: {
    github?: string;
    linkedin?: string;
    leetcode?: string;
    website?: string;
  };
};

function fmtDate(ts?: { seconds: number } | null) {
  if (!ts?.seconds) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function computeCompletion(u: UserDoc): number {
  const checks = [
    !!u.fullName?.trim(),
    !!u.headline?.trim(),
    !!u.email?.trim(),
    !!u.phone?.trim(),
    !!u.location?.trim(),
    (u.summary?.trim().length ?? 0) >= 40,
    (u.skills?.split(",").filter((s) => s.trim()).length ?? 0) >= 3,
    (u.education?.length ?? 0) >= 1,
    (u.projects?.length ?? 0) + (u.experience?.length ?? 0) >= 1,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

function ProviderIcon({ p }: { p?: string }) {
  if (p === "google") return <Chrome className="h-3.5 w-3.5" />;
  if (p === "github") return <Github className="h-3.5 w-3.5" />;
  return <AtSign className="h-3.5 w-3.5" />;
}

function AdminPage() {
  const { user, isAdmin, hydrated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserDoc[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Check if user is bootstrap admin
  const isBootstrapAdmin = user?.email === "thehseenshaik@gmail.com";
  const hasAdminAccess = isAdmin || isBootstrapAdmin;

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login", replace: true });
    if (hydrated && user && !hasAdminAccess)
      navigate({ to: "/dashboard", replace: true });
  }, [hydrated, user, hasAdminAccess, navigate]);

  useEffect(() => {
    if (!hasAdminAccess) return;
    const q = query(collection(fbDb(), "users"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setUsers(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<UserDoc, "id">),
          })),
        );
        setError(null);
      },
      (err) => {
        console.error("[admin] users query error", err);
        setError(
          "Could not load users. Check Firestore rules — admins must be allowed to read the users collection.",
        );
      },
    );
    return () => unsub();
  }, [hasAdminAccess]);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.email, u.displayName, u.fullName, u.location].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [users, search]);

  const stats = useMemo(() => {
    if (!users) return null;
    const admins = users.filter((u) => u.role === "admin").length;
    const complete = users.filter((u) => computeCompletion(u) === 100).length;
    const withGithub = users.filter(
      (u) => u.provider === "github" || u.links?.github,
    ).length;
    return { total: users.length, admins, complete, withGithub };
  }, [users]);

  const selected = selectedId ? users?.find((u) => u.id === selectedId) : null;

  async function toggleRole(u: UserDoc) {
    if (u.id === user?.id) return; // don't demote yourself
    setBusy(u.id);
    try {
      const nextRole: "admin" | "user" = u.role === "admin" ? "user" : "admin";
      await updateDoc(doc(fbDb(), "users", u.id), {
        role: nextRole,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("[admin] role update failed", err);
      alert("Failed to update role. Check Firestore rules.");
    } finally {
      setBusy(null);
    }
  }

  if (!hydrated || !user) return <PageLoader label="Loading admin console…" />;
  if (!hasAdminAccess) return <PageLoader label="Redirecting…" />;

  return (
    <PageShell>
      <SiteNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 pb-24 pt-24 md:px-8 md:pt-28">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand">
              <Shield className="h-3 w-3" />
              Admin
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Admin console
            </h1>
            <p className="mt-1.5 text-[14px] text-muted-foreground">
              All users, profile completion, and platform activity — live from
              Firestore.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex h-9 items-center gap-1.5 self-start rounded-md border border-border bg-background px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
          </Link>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Total users" value={stats.total} />
            <StatCard icon={Shield} label="Admins" value={stats.admins} />
            <StatCard
              icon={CheckCircle2}
              label="Profiles 100%"
              value={stats.complete}
            />
            <StatCard
              icon={Github}
              label="GitHub connected"
              value={stats.withGithub}
            />
          </div>
        )}

        {/* Search */}
        <div className="mb-4 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-[13px]"
            />
          </div>
          <div className="text-[12px] text-muted-foreground">
            {users ? `${filtered.length} of ${users.length}` : "Loading…"}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-[13px] text-destructive">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card/50 shadow-elegant">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-border bg-muted/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Provider</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Profile</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {!users && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      Loading users…
                    </td>
                  </tr>
                )}
                {users && filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-muted-foreground"
                    >
                      No users match your search.
                    </td>
                  </tr>
                )}
                {filtered.map((u) => {
                  const completion = computeCompletion(u);
                  const displayName =
                    u.fullName ||
                    u.displayName ||
                    u.email?.split("@")[0] ||
                    "Unnamed";
                  return (
                    <tr
                      key={u.id}
                      className="border-b border-border/60 transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedId(u.id)}
                          className="flex items-center gap-3 text-left"
                        >
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-brand-glow text-[11px] font-semibold uppercase text-white">
                            {displayName.slice(0, 2)}
                          </span>
                          <span>
                            <span className="block font-medium text-foreground">
                              {displayName}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {u.email ?? "—"}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium capitalize">
                          <ProviderIcon p={u.provider} />
                          {u.provider ?? "email"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.role === "admin" ? (
                          <Badge className="bg-brand/15 text-brand hover:bg-brand/20">
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="secondary">User</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-gradient-to-r from-brand to-brand-glow"
                              style={{ width: `${completion}%` }}
                            />
                          </div>
                          <span className="text-[11px] tabular-nums text-muted-foreground">
                            {completion}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {u.location || "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {fmtDate(u.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1.5 px-2 text-[11px]"
                          disabled={busy === u.id || u.id === user.id}
                          onClick={() => toggleRole(u)}
                          title={
                            u.id === user.id
                              ? "You can't change your own role"
                              : ""
                          }
                        >
                          {u.role === "admin" ? (
                            <>
                              <ShieldOff className="h-3 w-3" /> Demote
                            </>
                          ) : (
                            <>
                              <Shield className="h-3 w-3" /> Promote
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail drawer */}
        {selected && (
          <div
            className="fixed inset-0 z-50 flex justify-end bg-background/60 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full max-w-lg overflow-y-auto border-l border-border bg-card p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">
                    {selected.fullName || selected.displayName || "User"}
                  </h2>
                  <p className="text-[13px] text-muted-foreground">
                    {selected.email}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>

              <DetailRow label="UID" value={selected.id} mono />
              <DetailRow label="Role" value={selected.role ?? "user"} />
              <DetailRow
                label="Provider"
                value={selected.provider ?? "email"}
              />
              <DetailRow label="Headline" value={selected.headline || "—"} />
              <DetailRow label="Phone" value={selected.phone || "—"} />
              <DetailRow label="Location" value={selected.location || "—"} />
              <DetailRow
                label="Skills"
                value={
                  selected.skills
                    ?.split(",")
                    .filter((s) => s.trim())
                    .join(" · ") || "—"
                }
              />
              <DetailRow
                label="Education"
                value={String(selected.education?.length ?? 0)}
              />
              <DetailRow
                label="Experience"
                value={String(selected.experience?.length ?? 0)}
              />
              <DetailRow
                label="Projects"
                value={String(selected.projects?.length ?? 0)}
              />
              <DetailRow
                label="Completion"
                value={`${computeCompletion(selected)}%`}
              />
              <DetailRow label="Joined" value={fmtDate(selected.createdAt)} />
              <DetailRow
                label="Last updated"
                value={fmtDate(selected.updatedAt)}
              />

              {selected.summary && (
                <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Summary
                  </div>
                  <p className="text-[13px] leading-relaxed">
                    {selected.summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </PageShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4 shadow-elegant">
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <Icon className="h-4 w-4 text-brand" />
      </div>
      <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 py-2.5 text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`text-right font-medium text-foreground ${mono ? "font-mono text-[11px]" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
