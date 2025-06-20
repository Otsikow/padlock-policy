
import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Notification = Tables<'notifications'>;

export const useSmartNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const data = await NotificationService.getUserNotifications(user.id);
      setNotifications(data);
      setUnreadCount(data.filter(n => n.status === 'unread').length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const runPeriodicChecks = useCallback(async () => {
    await NotificationService.checkPolicyRenewals();
    await NotificationService.checkBetterDeals();
    // Refresh notifications after running checks
    setTimeout(fetchNotifications, 1000);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const success = await NotificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'read' as const }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return success;
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Set up periodic checks every 5 minutes
    const interval = setInterval(runPeriodicChecks, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchNotifications, runPeriodicChecks]);

  // Set up real-time notifications
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    runPeriodicChecks,
    markAsRead
  };
};
