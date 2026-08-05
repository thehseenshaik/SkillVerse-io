import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  type Auth,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase config — web config values are publishable by design.
 * Security is enforced through Firebase Auth + Firestore Rules.
 * See https://firebase.google.com/docs/projects/api-keys
 */
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyD3H3mTia8b3naCHfFP_JBUa5Mz-qL60v0",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "skillverse-13b58.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "skillverse-13b58",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "skillverse-13b58.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "29304538516",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:29304538516:web:3f9816aa506cbd5fc0bb81",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-8KPX3V3BHK",
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function app(): FirebaseApp {
  if (_app) return _app;
  try {
    _app = getApps()[0] ?? initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    throw error;
  }
  return _app;
}

/** Only call from client code (components/effects). */
export function fbAuth(): Auth {
  if (!_auth) {
    try {
      _auth = getAuth(app());
      // Default to LOCAL persistence for better UX - this keeps user logged in across refreshes
      setPersistence(_auth, browserLocalPersistence).catch((error) => {
        console.error("Failed to set auth persistence:", error);
      });
      
      // Handle Cross-Origin-Opener-Policy for popup authentication
      if (_auth.tenantId === undefined) {
        // Configure auth settings for better popup handling
        _auth.settings = {
          ..._auth.settings,
          appVerificationDisabledForTesting: false,
        };
      }
    } catch (error) {
      console.error("Firebase Auth initialization error:", error);
      throw error;
    }
  }
  return _auth;
}

/**
 * Set session persistence based on "Remember Me" preference
 * @param rememberMe - If true, use LOCAL persistence; otherwise use SESSION
 */
export async function setSessionPersistence(
  rememberMe: boolean,
): Promise<void> {
  const auth = fbAuth();
  try {
    if (rememberMe) {
      await setPersistence(auth, browserLocalPersistence);
    } else {
      await setPersistence(auth, browserSessionPersistence);
    }
  } catch (error) {
    console.error("Failed to set session persistence:", error);
    // Don't throw - allow auth to continue with default
  }
}

export function fbDb(): Firestore {
  if (!_db) {
    try {
      _db = getFirestore(app());
    } catch (error) {
      console.error("Firebase Firestore initialization error:", error);
      throw error;
    }
  }
  return _db;
}

export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
githubProvider.addScope("read:user");
githubProvider.addScope("user:email");
