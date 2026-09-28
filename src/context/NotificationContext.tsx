import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppNotification } from '@/types';
import { useAuth } from './AuthContext';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  requestBrowserNotificationPermission,
} from '@/services/notificationService';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  removeNotification: (id: string) => Promise<void>;
  requestBrowserPermission: () => Promise<NotificationPermission>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      refreshNotifications().finally(() => setLoading(false));

      // Poll periodically every 2 minutes for updates if active
      const interval = setInterval(() => {
        refreshNotifications();
      }, 120000);

      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [user, refreshNotifications]);

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
    );
    try {
      await markNotificationAsRead(id);
    } catch (err) {
      console.error('Error marking notification as read:', err);
      refreshNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error('Error marking all as read:', err);
      refreshNotifications();
    }
  };

  const handleRemoveNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error('Error deleting notification:', err);
      refreshNotifications();
    }
  };

  const handleRequestBrowserPermission = async () => {
    return await requestBrowserNotificationPermission();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refreshNotifications,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        removeNotification: handleRemoveNotification,
        requestBrowserPermission: handleRequestBrowserPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
