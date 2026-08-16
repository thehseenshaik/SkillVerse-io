import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { fbDb } from "@/lib/firebase";

export type NotificationType =
  | "connection"
  | "problem"
  | "resume"
  | "profile"
  | "sync"
  | "sync_failure"
  | "ai";

export interface SkillVerseNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO 8601 string
  metadata?: Record<string, any>;
}

const LOCAL_STORAGE_KEY_PREFIX = "skillverse_notifications_";

// Helper to load cached notifications from localStorage if offline/guest
function getCachedNotifications(userId: string): SkillVerseNotification[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save notifications to localStorage
function cacheNotifications(userId: string, notifications: SkillVerseNotification[]) {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(notifications));
  } catch {
    // ignore
  }
}

/**
 * Creates a real notification for the authenticated user.
 * Operations should call this after a real action succeeds.
 * Errors are caught internally so primary user operations never fail.
 */
export async function createNotification(
  userId: string,
  data: {
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    idempotencyKey?: string;
  }
): Promise<string | null> {
  if (!userId) return null;

  // Prevent duplicate notifications if idempotency key is provided
  if (data.idempotencyKey && typeof window !== "undefined") {
    const key = `sv_notif_key_${userId}_${data.idempotencyKey}`;
    if (localStorage.getItem(key)) {
      return null;
    }
    try {
      localStorage.setItem(key, Date.now().toString());
    } catch {
      // ignore
    }
  }

  const notification: Omit<SkillVerseNotification, "id"> = {
    userId,
    type: data.type,
    title: data.title,
    message: data.message,
    read: false,
    createdAt: new Date().toISOString(),
    metadata: data.metadata || {},
  };

  try {
    const db = fbDb();
    const notifCollection = collection(db, "users", userId, "notifications");
    const docRef = await addDoc(notifCollection, notification);

    // Also update local cache for instant UI feedback
    const cached = getCachedNotifications(userId);
    const newNotif = { id: docRef.id, ...notification };
    cacheNotifications(userId, [newNotif, ...cached.filter((n) => n.id !== docRef.id)]);

    return docRef.id;
  } catch (error) {
    console.warn("Firestore notification insert failed, writing to local store:", error);
    // Fallback to local cache so notification feature works regardless of network/rules
    const fallbackId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newNotif: SkillVerseNotification = { id: fallbackId, ...notification };
    const cached = getCachedNotifications(userId);
    cacheNotifications(userId, [newNotif, ...cached]);
    return fallbackId;
  }
}

/**
 * Subscribes to real-time notification updates for a user.
 */
export function listenToNotifications(
  userId: string,
  onUpdate: (notifications: SkillVerseNotification[]) => void
): () => void {
  if (!userId) {
    onUpdate([]);
    return () => {};
  }

  // Load initial cached notifications
  const initialCached = getCachedNotifications(userId);
  if (initialCached.length > 0) {
    onUpdate(initialCached);
  }

  try {
    const db = fbDb();
    const notifCollection = collection(db, "users", userId, "notifications");
    const q = query(notifCollection, orderBy("createdAt", "desc"), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs: SkillVerseNotification[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<SkillVerseNotification, "id">),
        }));

        // Sort descending
        notifs.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        cacheNotifications(userId, notifs);
        onUpdate(notifs);
      },
      (error) => {
        console.warn("Real-time notification snapshot error, using cached fallback:", error);
        onUpdate(getCachedNotifications(userId));
      }
    );

    return unsubscribe;
  } catch (error) {
    console.warn("Notification listener initialization error:", error);
    onUpdate(getCachedNotifications(userId));
    return () => {};
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
  if (!userId || !notificationId) return;

  // Update local cache immediately
  const cached = getCachedNotifications(userId);
  const updated = cached.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
  cacheNotifications(userId, updated);

  if (notificationId.startsWith("local_")) return;

  try {
    const db = fbDb();
    const docRef = doc(db, "users", userId, "notifications", notificationId);
    await updateDoc(docRef, { read: true });
  } catch (error) {
    console.error("Failed to mark notification read in Firestore:", error);
  }
}

/**
 * Marks all notifications as read for a user.
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  if (!userId) return;

  const cached = getCachedNotifications(userId);
  const updated = cached.map((n) => ({ ...n, read: true }));
  cacheNotifications(userId, updated);

  try {
    const db = fbDb();
    const notifCollection = collection(db, "users", userId, "notifications");
    const snapshot = await getDocs(notifCollection);

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap) => {
      if (!docSnap.data().read) {
        batch.update(docSnap.ref, { read: true });
      }
    });

    await batch.commit();
  } catch (error) {
    console.error("Failed to mark all notifications read in Firestore:", error);
  }
}

/**
 * Deletes a notification by ID.
 */
export async function deleteNotification(userId: string, notificationId: string): Promise<void> {
  if (!userId || !notificationId) return;

  const cached = getCachedNotifications(userId);
  const updated = cached.filter((n) => n.id !== notificationId);
  cacheNotifications(userId, updated);

  if (notificationId.startsWith("local_")) return;

  try {
    const db = fbDb();
    const docRef = doc(db, "users", userId, "notifications", notificationId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Failed to delete notification in Firestore:", error);
  }
}
