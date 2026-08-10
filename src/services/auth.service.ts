/**
 * Authentication Service
 * Comprehensive service layer for all authentication operations
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  verifyPasswordResetCode as fbVerifyPasswordResetCode,
  confirmPasswordReset as fbConfirmPasswordReset,
  updatePassword as fbUpdatePassword,
  updateEmail as fbUpdateEmail,
  updateProfile as fbUpdateProfile,
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  type User as FbUser,
  type AuthCredential,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  runTransaction,
} from "firebase/firestore";
import { fbAuth, fbDb, googleProvider, githubProvider } from "@/lib/firebase";
import type {
  AuthUser,
  UserDocument,
  SignUpFormData,
  LoginFormData,
  UserRole,
  AuthProvider,
} from "@/types/user";

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: any,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const handleAuthError = (error: any): AuthError => {
  const code = error.code || "unknown";
  const message = getErrorMessage(code);
  return new AuthError(message, code, error);
};

const getErrorMessage = (code: string): string => {
  const errorMessages: Record<string, string> = {
    "auth/invalid-email": "Invalid email address",
    "auth/user-disabled": "This account has been disabled",
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/email-already-in-use": "An account with this email already exists",
    "auth/weak-password": "Password is too weak",
    "auth/invalid-credential": "Invalid credentials",
    "auth/popup-closed-by-user": "Sign-in was cancelled",
    "auth/popup-blocked": "Popup was blocked by the browser",
    "auth/account-exists-with-different-credential":
      "An account already exists with the same email",
    "auth/network-request-failed":
      "Network error. Please check your connection",
    "auth/too-many-requests": "Too many attempts. Please try again later",
    "auth/unauthorized-domain": "This domain is not authorized",
    "auth/invalid-action-code": "Invalid or expired action code",
    "auth/expired-action-code": "Action code has expired",
    "auth/invalid-verification-code": "Invalid verification code",
    "auth/missing-email": "Email is required",
    "auth/missing-password": "Password is required",
    "auth/requires-recent-login": "Please log in again to perform this action",
    "auth/credential-already-in-use":
      "This credential is already associated with a user account",
    "auth/operation-not-allowed": "This operation is not allowed",
    "auth/timeout": "The operation has timed out",
  };
  return errorMessages[code] || "An unexpected error occurred";
};

// ============================================================================
// USER MAPPING
// ============================================================================

const mapAuthUser = (fbUser: FbUser): AuthUser => {
  const providerId = fbUser.providerData[0]?.providerId ?? "";
  const provider: AuthProvider =
    providerId === "google.com"
      ? "google"
      : providerId === "github.com"
        ? "github"
        : providerId === "linkedin.com"
          ? "linkedin"
          : providerId === "apple.com"
            ? "apple"
            : "email";

  const derivedName =
    fbUser.email?.split("@")[0].replace(/[._-]+/g, " ") ?? "SkillVerse User";

  return {
    id: fbUser.uid,
    email: fbUser.email ?? "",
    emailVerified: fbUser.emailVerified,
    displayName: fbUser.displayName?.trim() || derivedName,
    avatarUrl: fbUser.photoURL ?? undefined,
    provider,
    createdAt: fbUser.metadata.creationTime
      ? new Date(fbUser.metadata.creationTime).getTime()
      : Date.now(),
    lastLoginAt: fbUser.metadata.lastSignInTime
      ? new Date(fbUser.metadata.lastSignInTime).getTime()
      : Date.now(),
  };
};

// ============================================================================
// INITIAL USER DOCUMENT
// ============================================================================

const createInitialUserDocument = async (
  authUser: AuthUser,
  formData?: SignUpFormData,
): Promise<void> => {
  const userRef = doc(fbDb(), "users", authUser.id);
  const existingDoc = await getDoc(userRef);

  if (existingDoc.exists()) {
    return; // User document already exists
  }

  const now = Date.now();
  const initialDoc: Partial<UserDocument> = {
    basicInfo: {
      firstName:
        formData?.firstName || authUser.displayName.split(" ")[0] || "",
      lastName:
        formData?.lastName ||
        authUser.displayName.split(" ").slice(1).join(" ") ||
        "",
      username: formData?.username || authUser.email.split("@")[0],
      displayName: authUser.displayName,
      avatarUrl: authUser.avatarUrl,
      country: formData?.country || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: "en",
    },
    authInfo: {
      email: authUser.email,
      emailVerified: authUser.emailVerified,
      provider: authUser.provider,
      providers: [authUser.provider],
      lastPasswordChange: now,
    },
    profile: {
      firstName:
        formData?.firstName || authUser.displayName.split(" ")[0] || "",
      lastName:
        formData?.lastName ||
        authUser.displayName.split(" ").slice(1).join(" ") ||
        "",
      username: formData?.username || authUser.email.split("@")[0],
      displayName: authUser.displayName,
      avatarUrl: authUser.avatarUrl,
      country: formData?.country || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: "en",
    },
    settings: {
      theme: "system",
      notifications: {
        email: true,
        push: true,
        marketing: false,
        security: true,
        updates: true,
      },
      privacy: {
        profileVisibility: "private",
        showEmail: false,
        showLocation: false,
        allowMessages: true,
      },
      accessibility: {
        fontSize: "medium",
        reducedMotion: false,
        highContrast: false,
      },
      language: "en",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    privacy: {
      profileVisibility: "private",
      showEmail: false,
      showLocation: false,
      allowMessages: true,
      dataSharing: false,
    },
    connectedPlatforms: {},
    aiData: {},
    resumeData: {
      templates: [],
      downloads: 0,
      versions: [],
    },
    portfolioData: {
      enabled: false,
      theme: "default",
      projects: [],
    },
    communityData: {
      posts: 0,
      comments: 0,
      likes: 0,
      followers: 0,
      following: 0,
      reputation: 0,
      badges: [],
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      lastActiveAt: now,
      emailVerified: authUser.emailVerified,
      emailVerifiedAt: authUser.emailVerified ? now : undefined,
      onboardingCompleted: false,
      accountStatus: "active",
      referralCount: 0,
    },
    role: "user",
  };

  await setDoc(userRef, initialDoc, { merge: true });

  // Automatically dispatch SkillVerse Welcome Email to new user
  if (authUser.email) {
    const API_BASE = import.meta.env.VITE_API_URL || 'https://skillverse-io.onrender.com';
    fetch(`${API_BASE}/api/email/welcome`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: authUser.email.trim(),
        name: authUser.displayName || formData?.firstName || authUser.email.split('@')[0],
        username: formData?.username || authUser.email.split('@')[0],
      }),
    }).catch((err) => console.warn('[email] automatic welcome email trigger failed', err));
  }
};

// ============================================================================
// SIGN UP
// ============================================================================

export const signUp = async (formData: SignUpFormData): Promise<AuthUser> => {
  try {
    const { email, password, firstName, lastName, username } = formData;

    // Create Firebase Auth user first
    const cred = await createUserWithEmailAndPassword(
      fbAuth(),
      email,
      password,
    );

    // Update display name
    if (firstName || lastName) {
      const displayName = `${firstName} ${lastName}`.trim();
      await fbUpdateProfile(cred.user, { displayName });
    }

    const authUser = mapAuthUser(cred.user);

    // Reserve username first
    const db = fbDb();
    const usernameRef = doc(db, "usernames", username.toLowerCase());
    const usernameDoc = await getDoc(usernameRef);

    if (usernameDoc.exists()) {
      throw new AuthError("Username already taken", "username-taken");
    }

    await setDoc(usernameRef, {
      userId: authUser.id,
      reservedAt: Date.now(),
    });

    // Create user document
    const userRef = doc(db, "users", authUser.id);
    const existingDoc = await getDoc(userRef);

    if (!existingDoc.exists()) {
      const now = Date.now();
      const initialDoc: Partial<UserDocument> = {
        basicInfo: {
          firstName:
            formData.firstName || authUser.displayName.split(" ")[0] || "",
          lastName:
            formData.lastName ||
            authUser.displayName.split(" ").slice(1).join(" ") ||
            "",
          username: formData.username || authUser.email.split("@")[0],
          displayName: authUser.displayName,
          avatarUrl: authUser.avatarUrl,
          country: formData.country || "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: "en",
        },
        authInfo: {
          email: authUser.email,
          emailVerified: authUser.emailVerified,
          provider: authUser.provider,
          providers: [authUser.provider],
          lastPasswordChange: now,
        },
        profile: {
          firstName:
            formData.firstName || authUser.displayName.split(" ")[0] || "",
          lastName:
            formData.lastName ||
            authUser.displayName.split(" ").slice(1).join(" ") ||
            "",
          username: formData.username || authUser.email.split("@")[0],
          displayName: authUser.displayName,
          avatarUrl: authUser.avatarUrl,
          country: formData.country || "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: "en",
        },
        settings: {
          theme: "system",
          notifications: {
            email: true,
            push: true,
            marketing: false,
            security: true,
            updates: true,
          },
          privacy: {
            profileVisibility: "private",
            showEmail: false,
            showLocation: false,
            allowMessages: true,
          },
          accessibility: {
            fontSize: "medium",
            reducedMotion: false,
            highContrast: false,
          },
          language: "en",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        privacy: {
          profileVisibility: "private",
          showEmail: false,
          showLocation: false,
          allowMessages: true,
          dataSharing: false,
        },
        connectedPlatforms: {},
        aiData: {},
        resumeData: {
          templates: [],
          downloads: 0,
          versions: [],
        },
        portfolioData: {
          enabled: false,
          theme: "default",
          projects: [],
        },
        communityData: {
          posts: 0,
          comments: 0,
          likes: 0,
          followers: 0,
          following: 0,
          reputation: 0,
          badges: [],
        },
        metadata: {
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
          lastActiveAt: now,
          emailVerified: authUser.emailVerified,
          emailVerifiedAt: authUser.emailVerified ? now : undefined,
          onboardingCompleted: false,
          accountStatus: "active",
          referralCount: 0,
        },
        role: "user",
      };
      await setDoc(userRef, initialDoc);
    }

    // Send verification email safely without blocking account creation
    try {
      await sendEmailVerification(cred.user);
    } catch {
      // ignore
    }

    return authUser;
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// SIGN IN
// ============================================================================

export const signIn = async (formData: LoginFormData): Promise<AuthUser> => {
  try {
    const { email, password, rememberMe } = formData;

    // Set session persistence before sign in
    const { setSessionPersistence } = await import("@/lib/firebase");
    await setSessionPersistence(rememberMe);

    const cred = await signInWithEmailAndPassword(fbAuth(), email, password);
    const authUser = mapAuthUser(cred.user);

    // Update last login
    const userRef = doc(fbDb(), "users", authUser.id);
    await updateDoc(userRef, {
      "metadata.lastLoginAt": Date.now(),
      "metadata.lastActiveAt": Date.now(),
    });

    // Handle remember me
    if (rememberMe) {
      localStorage.setItem("skillverse.rememberMe", "true");
    } else {
      localStorage.removeItem("skillverse.rememberMe");
    }

    return authUser;
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// OAUTH SIGN IN
// ============================================================================

export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const cred = await signInWithPopup(fbAuth(), googleProvider);
    const authUser = mapAuthUser(cred.user);

    // Create or update user document
    const userRef = doc(fbDb(), "users", authUser.id);
    const existingDoc = await getDoc(userRef);

    if (!existingDoc.exists()) {
      await createInitialUserDocument(authUser);
    } else {
      // Update last login and add provider if not exists
      await updateDoc(userRef, {
        "metadata.lastLoginAt": Date.now(),
        "metadata.lastActiveAt": Date.now(),
        "authInfo.providers": arrayUnion("google"),
      });
    }

    return authUser;
  } catch (error) {
    throw handleAuthError(error);
  }
};

export const signInWithGithub = async (): Promise<AuthUser> => {
  try {
    const cred = await signInWithPopup(fbAuth(), githubProvider);
    const authUser = mapAuthUser(cred.user);

    // Create or update user document
    const userRef = doc(fbDb(), "users", authUser.id);
    const existingDoc = await getDoc(userRef);

    if (!existingDoc.exists()) {
      await createInitialUserDocument(authUser);
    } else {
      // Update last login and add provider if not exists
      await updateDoc(userRef, {
        "metadata.lastLoginAt": Date.now(),
        "metadata.lastActiveAt": Date.now(),
        "authInfo.providers": arrayUnion("github"),
      });
    }

    return authUser;
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// MAGIC LINK
// ============================================================================

export const sendMagicLink = async (email: string): Promise<void> => {
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth-callback`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(fbAuth(), email, actionCodeSettings);

    // Store email for completion
    localStorage.setItem("skillverse.magicEmail", email);

    // Also store in sessionStorage as backup
    sessionStorage.setItem("skillverse.magicEmail", email);
  } catch (error) {
    throw handleAuthError(error);
  }
};

export const completeMagicLink = async (): Promise<AuthUser> => {
  try {
    if (isSignInWithEmailLink(fbAuth(), window.location.href)) {
      const email =
        localStorage.getItem("skillverse.magicEmail") ||
        sessionStorage.getItem("skillverse.magicEmail");
      if (!email) {
        throw new AuthError(
          "No email found for magic link completion",
          "missing-email",
        );
      }

      const cred = await signInWithEmailLink(
        fbAuth(),
        email,
        window.location.href,
      );
      // Clean up both storage locations
      localStorage.removeItem("skillverse.magicEmail");
      sessionStorage.removeItem("skillverse.magicEmail");

      const authUser = mapAuthUser(cred.user);

      // Update last login
      const userRef = doc(fbDb(), "users", authUser.id);
      await updateDoc(userRef, {
        "metadata.lastLoginAt": Date.now(),
        "metadata.lastActiveAt": Date.now(),
      });

      return authUser;
    }

    throw new AuthError("Invalid magic link", "invalid-action-code");
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

export const sendVerificationEmail = async (): Promise<void> => {
  try {
    const user = fbAuth().currentUser;
    if (!user) {
      throw new AuthError("No user signed in", "no-user");
    }

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      };
      await sendEmailVerification(user, actionCodeSettings);
    } catch {
      // Fallback dispatch without custom continue URL if domain check fails
      await sendEmailVerification(user);
    }
  } catch (error) {
    throw handleAuthError(error);
  }
};

export const verifyEmail = async (actionCode: string): Promise<void> => {
  try {
    await applyActionCode(fbAuth(), actionCode);

    // Update user document
    const user = fbAuth().currentUser;
    if (user) {
      const userRef = doc(fbDb(), "users", user.uid);
      await updateDoc(userRef, {
        "authInfo.emailVerified": true,
        "metadata.emailVerified": true,
        "metadata.emailVerifiedAt": Date.now(),
      });
    }
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// PASSWORD RESET
// ============================================================================

export const sendPasswordReset = async (email: string): Promise<void> => {
  try {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/forgot-password`,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(fbAuth(), email, actionCodeSettings);
    } catch {
      await sendPasswordResetEmail(fbAuth(), email);
    }
  } catch (error) {
    throw handleAuthError(error);
  }
};

export const verifyPasswordResetCode = async (
  code: string,
): Promise<string> => {
  try {
    const email = await fbVerifyPasswordResetCode(fbAuth(), code);
    return email;
  } catch (error) {
    throw handleAuthError(error);
  }
};

export const confirmPasswordReset = async (
  code: string,
  newPassword: string,
): Promise<void> => {
  try {
    await fbConfirmPasswordReset(fbAuth(), code, newPassword);

    // Update last password change
    const user = fbAuth().currentUser;
    if (user) {
      const userRef = doc(fbDb(), "users", user.uid);
      await updateDoc(userRef, {
        "authInfo.lastPasswordChange": Date.now(),
      });
    }
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// CHANGE PASSWORD
// ============================================================================

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  try {
    const user = fbAuth().currentUser;
    if (!user || !user.email) {
      throw new AuthError("No user signed in", "no-user");
    }

    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword,
    );
    await reauthenticateWithCredential(user, credential);
    await fbUpdatePassword(user, newPassword);

    // Update last password change
    const userRef = doc(fbDb(), "users", user.uid);
    await updateDoc(userRef, {
      "authInfo.lastPasswordChange": Date.now(),
    });
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// CHANGE EMAIL
// ============================================================================

export const changeEmail = async (
  newEmail: string,
  password: string,
): Promise<void> => {
  try {
    const user = fbAuth().currentUser;
    if (!user || !user.email) {
      throw new AuthError("No user signed in", "no-user");
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    await fbUpdateEmail(user, newEmail);

    // Update user document
    const userRef = doc(fbDb(), "users", user.uid);
    await updateDoc(userRef, {
      "authInfo.email": newEmail,
      "authInfo.emailVerified": false,
      "metadata.emailVerified": false,
      "basicInfo.email": newEmail,
      "profile.email": newEmail,
    });

    // Send verification email
    await sendEmailVerification(user);
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// SIGN OUT
// ============================================================================

export const signOut = async (): Promise<void> => {
  try {
    await fbSignOut(fbAuth());
    localStorage.removeItem("skillverse.rememberMe");
    localStorage.removeItem("skillverse.magicEmail");
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// DELETE ACCOUNT
// ============================================================================

export const deleteAccount = async (password: string): Promise<void> => {
  try {
    const user = fbAuth().currentUser;
    if (!user || !user.email) {
      throw new AuthError("No user signed in", "no-user");
    }

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);

    // Mark account as deleted in Firestore
    const userRef = doc(fbDb(), "users", user.uid);
    await updateDoc(userRef, {
      "metadata.accountStatus": "deleted",
      "metadata.deletedAt": Date.now(),
    });

    // Delete Firebase Auth account
    await user.delete();
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// UPDATE PROFILE
// ============================================================================

export const updateUserProfile = async (
  updates: Partial<UserDocument>,
): Promise<void> => {
  try {
    const user = fbAuth().currentUser;
    if (!user) {
      throw new AuthError("No user signed in", "no-user");
    }

    const userRef = doc(fbDb(), "users", user.uid);
    await updateDoc(userRef, {
      ...updates,
      "metadata.updatedAt": Date.now(),
    });
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// GET USER DOCUMENT
// ============================================================================

export const getUserDocument = async (
  userId: string,
): Promise<UserDocument | null> => {
  try {
    const userRef = doc(fbDb(), "users", userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserDocument;
    }

    return null;
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// CHECK USERNAME AVAILABILITY
// ============================================================================

export const checkUsernameAvailability = async (
  username: string,
): Promise<boolean> => {
  try {
    // Query users collection for username
    const usersRef = doc(fbDb(), "usernames", username.toLowerCase());
    const docSnap = await getDoc(usersRef);
    return !docSnap.exists();
  } catch (error) {
    throw handleAuthError(error);
  }
};

// ============================================================================
// RESERVE USERNAME
// ============================================================================

export const reserveUsername = async (
  userId: string,
  username: string,
): Promise<void> => {
  try {
    const usernameRef = doc(fbDb(), "usernames", username.toLowerCase());
    await setDoc(usernameRef, {
      userId,
      reservedAt: Date.now(),
    });
  } catch (error) {
    throw handleAuthError(error);
  }
};
