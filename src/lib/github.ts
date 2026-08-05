/**
 * GitHub public API client — no auth needed for public profile data.
 * Rate limit: 60 req/hr per IP unaunthenticated. We aggressively cache
 * per-username in localStorage (6h TTL) to stay well within budget.
 */

export type GitHubStats = {
  username: string;
  name: string | null;
  avatar: string;
  bio: string | null;
  htmlUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  totalForks: number;
  languages: { name: string; count: number; pct: number }[];
  topRepos: {
    name: string;
    url: string;
    description: string | null;
    stars: number;
    language: string | null;
    updatedAt: string;
  }[];
  createdAt: string;
  fetchedAt: number;
};

const CACHE_TTL = 1000 * 60 * 60 * 6; // 6h
const CACHE_KEY = (u: string) => `sv:gh:${u.toLowerCase()}`;

export function parseGithubUsername(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  // strip URL like https://github.com/foo/
  const urlMatch = raw.match(/github\.com\/([^/?#\s]+)/i);
  const candidate = urlMatch ? urlMatch[1] : raw.replace(/^@/, "");
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/.test(candidate)) return null;
  return candidate;
}

async function ghFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (res.status === 404) throw new Error("GitHub user not found");
  if (res.status === 403)
    throw new Error("GitHub rate limit reached — try again shortly");
  if (!res.ok) throw new Error(`GitHub error (${res.status})`);
  return (await res.json()) as T;
}

type GhUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  html_url: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
};

type GhRepo = {
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
  updated_at: string;
  pushed_at: string;
};

export async function fetchGithubStats(
  username: string,
  opts?: { force?: boolean },
): Promise<GitHubStats> {
  const key = CACHE_KEY(username);
  if (!opts?.force && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const cached = JSON.parse(raw) as GitHubStats;
        if (Date.now() - cached.fetchedAt < CACHE_TTL) return cached;
      }
    } catch {
      /* ignore */
    }
  }

  const [user, repos] = await Promise.all([
    ghFetch<GhUser>(`https://api.github.com/users/${username}`),
    ghFetch<GhRepo[]>(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    ),
  ]);

  const ownRepos = repos.filter((r) => !r.fork);
  const totalStars = ownRepos.reduce((n, r) => n + r.stargazers_count, 0);
  const totalForks = ownRepos.reduce((n, r) => n + r.forks_count, 0);

  const langCount = new Map<string, number>();
  for (const r of ownRepos) {
    if (r.language)
      langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);
  }
  const totalLang =
    Array.from(langCount.values()).reduce((n, v) => n + v, 0) || 1;
  const languages = Array.from(langCount.entries())
    .map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / totalLang) * 100),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const topRepos = [...ownRepos]
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        +new Date(b.pushed_at) - +new Date(a.pushed_at),
    )
    .slice(0, 5)
    .map((r) => ({
      name: r.name,
      url: r.html_url,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
      updatedAt: r.pushed_at,
    }));

  const stats: GitHubStats = {
    username: user.login,
    name: user.name,
    avatar: user.avatar_url,
    bio: user.bio,
    htmlUrl: user.html_url,
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    totalStars,
    totalForks,
    languages,
    topRepos,
    createdAt: user.created_at,
    fetchedAt: Date.now(),
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(stats));
    } catch {
      /* ignore quota */
    }
  }
  return stats;
}

/** Common language → brand color for the mini-legend chips. */
export const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3776AB",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Shell: "#89E051",
  Vue: "#41B883",
  Svelte: "#FF3E00",
  Jupyter: "#DA5B0B",
};
export const langColor = (l: string) => LANG_COLOR[l] ?? "hsl(var(--brand))";
