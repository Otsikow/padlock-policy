
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, TrendingDown, CheckCircle, X } from 'lucide-react';
import { NotificationService } from '@/services/notificationService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Notification = Tables<'notifications'>;

const SmartNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchNotifications(user.id);
      runSmartChecks();
    }
    setLoading(false);
  };

  const fetchNotifications = async (userId: string) => {
    const data = await NotificationService.getUserNotifications(userId);
    setNotifications(data);
  };

  const runSmartChecks = async () => {
    // Run periodic checks for renewals and better deals
    await NotificationService.checkPolicyRenewals();
    await NotificationService.checkBetterDeals();
    
    // Refresh notifications after checks
    if (user) {
      setTimeout(() => fetchNotifications(user.id), 1000);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await NotificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, status: 'read' as const }
            : notif
        )
      );
    }
  };

  const getNotificationIcon = (message: string) => {
    if (message.includes('renew') || message.includes('expir')) {
      return <Calendar className="w-5 h-5 text-orange-500" />;
    }
    if (message.includes('Better deal') || message.includes('Save')) {
      return <TrendingDown className="w-5 h-5 text-green-500" />;
    }
    if (message.includes('claim') || message.includes('Approved')) {
      return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
    return <Bell className="w-5 h-5 text-gray-500" />;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#183B6B]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Smart Alerts & Reminders
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <Button
          onClick={runSmartChecks}
          variant="outline"
          size="sm"
          className="text-[#183B6B] border-[#183B6B] hover:bg-[#183B6B] hover:text-white"
        >
          Check for Updates
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
            <p className="text-sm">We'll notify you about renewals, better deals, and claim updates</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                  notification.status === 'unread'
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.message)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${
                    notification.status === 'unread' ? 'font-medium' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp || '').toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {notification.status === 'unread' && (
                  <Button
                    onClick={() => handleMarkAsRead(notification.id)}
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SmartNotifications;
