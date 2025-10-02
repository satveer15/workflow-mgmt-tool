import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { notificationService } from '../services';
import type { Notification } from '../types';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      refreshUnreadCount();

      // Poll for new notifications every 30 seconds
      const interval = setInterval(() => {
        refreshUnreadCount();
      }, 30000);

      return () => clearInterval(interval);
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const fetchedNotifications = await notificationService.getAllNotifications();
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const updatedNotification = await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? updatedNotification : notif))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refreshUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider'
    );
  }
  return context;
};
