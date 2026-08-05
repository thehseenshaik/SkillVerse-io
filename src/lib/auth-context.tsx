import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword as fbUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendSignInLinkToEmail,
  type User as FbUser,
} from "firebase/auth";
import { doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { fbAuth, fbDb, googleProvider, githubProvider } from "@/lib/firebase";
import { isBootstrapAdmin, type UserRole } from "@/lib/admin";

export type AuthProviderKind = "email" | "google" | "github";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: AuthProviderKind;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  role: UserRole;
  isAdmin: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (name: string, email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInGithub: () => Promise<void>;
  sendReset: (email: string) => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapUser(u: FbUser): AuthUser {
  const providerId = u.providerData[0]?.providerId ?? "";
  const provider: AuthProviderKind =
    providerId === "google.com"
      ? "google"
      : providerId === "github.com"
        ? "github"
        : "email";
  const derived =
    u.email?.split("@")[0].replace(/[._-]+/g, " ") ?? "SkillVerse User";
  return {
    id: u.uid,
    name: u.displayName?.trim() || derived,
    email: u.email ?? "",
    avatarUrl: u.photoURL ?? undefined,
    provider,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [role, setRole] = useState<UserRole>("user");

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Firebase onAuthStateChanged will be called automatically with the current auth state
    // This handles session restoration on page refresh
    const unsub = onAuthStateChanged(fbAuth(), (u) => {
      console.log("[Auth] Auth state changed:", u ? `User: ${u.email}` : "No user");
      setUser(u ? mapUser(u) : null);
      setHydrated(true);
    });
    
    return () => unsub();
  }, []);

  // Ensure hydration is set to true on client (for SSR compatibility)
  useEffect(() => {
    if (typeof window !== "undefined" && !hydrated) {
      console.log("[Auth] Setting hydrated to true on client");
      setHydrated(true);
    }
  }, [hydrated]);

  // Sync role from Firestore users/{uid}.role — auto-bootstrap admin allowlist.
  // Note: User document creation is handled in auth.service.ts to avoid duplicates
  useEffect(() => {
    if (!user) {
      setRole("user");
      return;
    }
    const ref = doc(fbDb(), "users", user.id);
    const unsub = onSnapshot(
      ref,
      async (snap) => {
        const data = snap.data() as
          { role?: UserRole; email?: string } | undefined;
        const shouldBootstrap =
          isBootstrapAdmin(user.email) && data?.role !== "admin";
        if (shouldBootstrap) {
          try {
            await setDoc(
              ref,
              {
                role: "admin",
                email: user.email,
                displayName: user.name,
                provider: user.provider,
                promotedAt: serverTimestamp(),
              },
              { merge: true },
            );
            setRole("admin");
            return;
          } catch (err) {
            console.error("[auth] admin bootstrap failed", err);
          }
        }
        setRole(data?.role === "admin" ? "admin" : "user");
      },
      () => setRole("user"),
    );
    return () => unsub();
  }, [user]);

  const signInEmail = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(fbAuth(), email, password);
  }, []);

  const signUpEmail = useCallback(
    async (name: string, email: string, password: string) => {
      const cred = await createUserWithEmailAndPassword(
        fbAuth(),
        email,
        password,
      );
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
        // trigger a state refresh with the new name
        setUser(mapUser(cred.user));
      }
    },
    [],
  );

  const signInGoogle = useCallback(async () => {
    await signInWithPopup(fbAuth(), googleProvider);
  }, []);

  const signInGithub = useCallback(async () => {
    await signInWithPopup(fbAuth(), githubProvider);
  }, []);

  const sendReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(fbAuth(), email);
  }, []);

  const sendMagicLink = useCallback(async (email: string) => {
    if (typeof window === "undefined") throw new Error("Client only");
    const url = `${window.location.origin}/auth-callback`;
    await sendSignInLinkToEmail(fbAuth(), email, {
      url,
      handleCodeInApp: true,
    });
    window.localStorage.setItem("skillverse.magicEmail", email);
  }, []);

  const changePassword = useCallback(async (current: string, next: string) => {
    const u = fbAuth().currentUser;
    if (!u || !u.email) throw new Error("Not signed in");
    const cred = EmailAuthProvider.credential(u.email, current);
    await reauthenticateWithCredential(u, cred);
    await fbUpdatePassword(u, next);
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(fbAuth());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        hydrated,
        role,
        isAdmin: role === "admin",
        signInEmail,
        signUpEmail,
        signInGoogle,
        signInGithub,
        sendReset,
        sendMagicLink,
        changePassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
