import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { fbDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";

/**
 * Profile store — synced to Firestore per user (users/{uid}).
 * Local edits debounce-flush to Firestore (~800ms). A one-time localStorage
 * cache keyed by uid keeps the UI instant on reload before the snapshot lands.
 */

export type Education = {
  id: string;
  school: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  grade?: string;
};

export type Experience = {
  id: string;
  company: string;
  role: string;
  start: string;
  end: string;
  summary: string;
};

export type ProjectItem = {
  id: string;
  name: string;
  stack: string;
  link?: string;
  summary: string;
};

export type ResumeProfile = {
  fullName: string;
  headline: string;
  role: string;
  gender: string;
  pronouns: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  links: {
    website: string;
    linkedin: string;
    github: string;
    leetcode: string;
  };
  skills: string;
  education: Education[];
  experience: Experience[];
  projects: ProjectItem[];
  achievements: string;
};

export const EMPTY_PROFILE: ResumeProfile = {
  fullName: "",
  headline: "",
  role: "Student",
  gender: "",
  pronouns: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  links: { website: "", linkedin: "", github: "", leetcode: "" },
  skills: "",
  education: [],
  experience: [],
  projects: [],
  achievements: "",
};

export type SyncStatus = "idle" | "saving" | "saved" | "error";

type Ctx = {
  profile: ResumeProfile;
  hydrated: boolean;
  syncStatus: SyncStatus;
  update: (patch: Partial<ResumeProfile>) => void;
  updateLinks: (patch: Partial<ResumeProfile["links"]>) => void;
  setEducation: (rows: Education[]) => void;
  setExperience: (rows: Experience[]) => void;
  setProjects: (rows: ProjectItem[]) => void;
  completion: number;
  missing: { label: string; section: string }[];
};

const ProfileContext = createContext<Ctx | null>(null);
const cacheKey = (uid: string) => `sv-profile-${uid}`;

function computeCompletion(p: ResumeProfile): {
  pct: number;
  missing: { label: string; section: string }[];
} {
  const checks: { label: string; ok: boolean; section: string }[] = [
    { label: "Full name", ok: !!p.fullName.trim(), section: "basics" },
    { label: "Headline", ok: !!p.headline.trim(), section: "basics" },
    { label: "Email", ok: !!p.email.trim(), section: "basics" },
    { label: "Phone", ok: !!p.phone.trim(), section: "basics" },
    { label: "Location", ok: !!p.location.trim(), section: "basics" },
    {
      label: "Professional summary (40+ chars)",
      ok: p.summary.trim().length >= 40,
      section: "basics",
    },
    {
      label: "Skills (add at least 3)",
      ok: p.skills.split(",").filter((s) => s.trim()).length >= 3,
      section: "basics",
    },
    {
      label: "At least 1 education entry",
      ok: p.education.length >= 1,
      section: "education",
    },
    {
      label: "At least 1 project or experience",
      ok: p.projects.length + p.experience.length >= 1,
      section: "experience",
    },
  ];
  const done = checks.filter((c) => c.ok).length;
  const missing = checks
    .filter((c) => !c.ok)
    .map(({ label, section }) => ({ label, section }));
  return { pct: Math.round((done / checks.length) * 100), missing };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, hydrated: authHydrated } = useAuth();
  const uid = user?.id ?? null;
  const [profile, setProfile] = useState<ResumeProfile>(EMPTY_PROFILE);
  const [hydrated, setHydrated] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const suppressWriteRef = useRef(false); // ignore snapshot echoes
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUidRef = useRef<string | null>(null);
  const isDirtyRef = useRef(false);

  // Ensure hydration is set to true on client
  useEffect(() => {
    if (typeof window !== "undefined" && !hydrated) {
      setHydrated(true);
    }
  }, [hydrated]);

  // Subscribe to the user's profile doc (with local cache hydration).
  useEffect(() => {
    if (!authHydrated) return;
    currentUidRef.current = uid;
    isDirtyRef.current = false;
    if (!uid) {
      setProfile(EMPTY_PROFILE);
      setHydrated(true);
      return;
    }

    // Ensure hydration is set to true on client
    if (typeof window !== "undefined" && !hydrated) {
      setHydrated(true);
    }

    // Hydrate from local cache first for instant UI.
    try {
      const raw = localStorage.getItem(cacheKey(uid));
      if (raw)
        setProfile({ ...EMPTY_PROFILE, ...(JSON.parse(raw) as ResumeProfile) });
    } catch {
      /* ignore */
    }

    const ref = doc(fbDb(), "users", uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<ResumeProfile>;
          suppressWriteRef.current = true;
          const next = { ...EMPTY_PROFILE, ...data };
          setProfile(next);
          try {
            localStorage.setItem(cacheKey(uid), JSON.stringify(next));
          } catch {
            /* ignore */
          }
        }
        setHydrated(true);
      },
      (err) => {
        console.error("[profile] snapshot error", err);
        setHydrated(true);
      },
    );
    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [uid, authHydrated]);

  // Debounced write on every profile change (after hydration).
  useEffect(() => {
    if (!hydrated || !uid) return;
    if (suppressWriteRef.current) {
      suppressWriteRef.current = false;
      return;
    }
    if (!isDirtyRef.current) return;
    // update local cache immediately
    try {
      localStorage.setItem(cacheKey(uid), JSON.stringify(profile));
    } catch {
      /* ignore */
    }
    setSyncStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        await setDoc(
          doc(fbDb(), "users", uid),
          { ...profile, updatedAt: serverTimestamp() },
          { merge: true },
        );
        isDirtyRef.current = false;
        // Only flip to "saved" if this write is still for the current uid.
        if (currentUidRef.current === uid) {
          setSyncStatus("saved");
          setTimeout(
            () => setSyncStatus((s) => (s === "saved" ? "idle" : s)),
            1500,
          );
        }
      } catch (err) {
        console.error("[profile] save error", err);
        setSyncStatus("error");
      }
    }, 800);
  }, [profile, hydrated, uid]);

  const update = useCallback((patch: Partial<ResumeProfile>) => {
    isDirtyRef.current = true;
    setProfile((p) => ({ ...p, ...patch }));
  }, []);
  const updateLinks = useCallback((patch: Partial<ResumeProfile["links"]>) => {
    isDirtyRef.current = true;
    setProfile((p) => ({ ...p, links: { ...p.links, ...patch } }));
  }, []);
  const setEducation = useCallback((rows: Education[]) => {
    isDirtyRef.current = true;
    setProfile((p) => ({ ...p, education: rows }));
  }, []);
  const setExperience = useCallback((rows: Experience[]) => {
    isDirtyRef.current = true;
    setProfile((p) => ({ ...p, experience: rows }));
  }, []);
  const setProjects = useCallback((rows: ProjectItem[]) => {
    isDirtyRef.current = true;
    setProfile((p) => ({ ...p, projects: rows }));
  }, []);

  const { pct, missing } = useMemo(() => computeCompletion(profile), [profile]);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        hydrated,
        syncStatus,
        update,
        updateLinks,
        setEducation,
        setExperience,
        setProjects,
        completion: pct,
        missing,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider");
  return ctx;
}

export function newId() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}
