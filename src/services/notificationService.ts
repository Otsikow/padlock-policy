
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type NotificationType = 'renewal_reminder' | 'better_deal' | 'claim_update' | 'policy_expiry';

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  static async createNotification(userId: string, data: NotificationData) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          message: `${data.title}: ${data.message}`,
          status: 'unread'
        });

      if (error) throw error;
      
      // Show toast notification for immediate feedback
      toast({
        title: data.title,
        description: data.message,
      });

      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  static async checkPolicyRenewals() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get policies expiring in the next 7 days
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const { data: policies, error } = await supabase
        .from('policies')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .lte('end_date', sevenDaysFromNow.toISOString().split('T')[0]);

      if (error) throw error;

      for (const policy of policies || []) {
        const daysUntilExpiry = Math.ceil(
          (new Date(policy.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          await this.createNotification(user.id, {
            type: 'renewal_reminder',
            title: 'Policy Renewal Reminder',
            message: `Your ${policy.policy_type} policy renews in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`,
            metadata: { policy_id: policy.id, days_until_expiry: daysUntilExpiry }
          });
        }
      }
    } catch (error) {
      console.error('Error checking policy renewals:', error);
    }
  }

  static async checkBetterDeals() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userPolicies } = await supabase
        .from('policies')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      const { data: offers } = await supabase
        .from('comparison_offers')
        .select('*');

      if (!userPolicies || !offers) return;

      for (const policy of userPolicies) {
        const betterOffers = offers.filter(offer => 
          offer.policy_type === policy.policy_type &&
          Number(offer.premium_amount) < Number(policy.premium_amount)
        );

        if (betterOffers.length > 0) {
          const bestOffer = betterOffers.reduce((best, current) => 
            Number(current.premium_amount) < Number(best.premium_amount) ? current : best
          );

          const savings = Number(policy.premium_amount) - Number(bestOffer.premium_amount);

          await this.createNotification(user.id, {
            type: 'better_deal',
            title: 'Better Deal Found',
            message: `Save $${savings.toFixed(2)}/month on your ${policy.policy_type} insurance with ${bestOffer.insurer_name}`,
            metadata: {
              current_policy_id: policy.id,
              better_offer_id: bestOffer.id,
              savings: savings
            }
          });
        }
      }
    } catch (error) {
      console.error('Error checking better deals:', error);
    }
  }

  static async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  static async getUserNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }
}
