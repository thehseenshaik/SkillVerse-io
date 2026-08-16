import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  SkillVerseNotification,
  listenToNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as removeNotificationDoc,
} from "@/lib/services/notification-service";

interface NotificationContextType {
  notifications: SkillVerseNotification[];
  unreadCount: number;
  hasUnread: boolean;
  isNewArrival: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SkillVerseNotification[]>([]);
  const [isNewArrival, setIsNewArrival] = useState<boolean>(false);
  const prevCountRef = React.useRef<number>(0);

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      prevCountRef.current = 0;
      return;
    }

    const unsubscribe = listenToNotifications(user.id, (notifs) => {
      const currentUnread = notifs.filter((n) => !n.read).length;
      
      // Trigger subtle bell shake animation if new unread notification arrives
      if (currentUnread > prevCountRef.current && prevCountRef.current >= 0) {
        setIsNewArrival(true);
        setTimeout(() => setIsNewArrival(false), 800);
      }

      prevCountRef.current = currentUnread;
      setNotifications(notifs);
    });

    return () => unsubscribe();
  }, [user?.id]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const hasUnread = unreadCount > 0;

  const handleMarkAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;
      await markNotificationAsRead(user.id, notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    },
    [user?.id]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    await markAllNotificationsAsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [user?.id]);

  const handleDeleteNotification = useCallback(
    async (notificationId: string) => {
      if (!user?.id) return;
      await removeNotificationDoc(user.id, notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    },
    [user?.id]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      hasUnread,
      isNewArrival,
      markAsRead: handleMarkAsRead,
      markAllAsRead: handleMarkAllAsRead,
      deleteNotification: handleDeleteNotification,
    }),
    [
      notifications,
      unreadCount,
      hasUnread,
      isNewArrival,
      handleMarkAsRead,
      handleMarkAllAsRead,
      handleDeleteNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
