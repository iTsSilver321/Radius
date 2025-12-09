
import { supabase } from "@/src/lib/supabase";
import { create } from "zustand";
import { fetchNotifications, markAsRead, Notification } from "./api";

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  expoPushToken: string | null;
  setExpoPushToken: (token: string) => void;
  incrementUnreadCount: () => void;
  
  fetchNotifications: (userId: string) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  subscribeToNotifications: (userId: string) => () => void;
}

export const useNotificationStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  expoPushToken: null,

  setExpoPushToken: (token: string) => set({ expoPushToken: token }),

  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),

  fetchNotifications: async (userId: string) => {
    set({ isLoading: true });
    try {
      const notifications = await fetchNotifications(userId);
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  markNotificationAsRead: async (id: string) => {
    try {
      await markAsRead(id);
      const notifications = get().notifications.map((n) =>
        n.id === id ? { ...n, is_read: true } : n
      );
      const unreadCount = notifications.filter((n) => !n.is_read).length;
      set({ notifications, unreadCount });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },
  subscribeToNotifications: (userId: string) => {
    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT and UPDATE
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            set((state) => ({
              notifications: [newNotification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            }));
          } else if (payload.eventType === 'UPDATE') {
             const updatedNotification = payload.new as Notification;
             set((state) => {
                const notifications = state.notifications.map(n => 
                    n.id === updatedNotification.id ? updatedNotification : n
                );
                const unreadCount = notifications.filter(n => !n.is_read).length;
                return { notifications, unreadCount };
             });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
