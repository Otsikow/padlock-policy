
import { supabase } from '@/integrations/supabase/client';

export class AIService {
  static async analyzeClaimRisk(claimData: {
    policy_type: string;
    claim_reason: string;
    claim_amount?: number;
    context?: string;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'risk_score',
          data: claimData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error analyzing claim risk:', error);
      return null;
    }
  }

  static async generatePolicySummary(policyData: {
    policy_type: string;
    premium_amount: number;
    start_date: string;
    end_date: string;
    coverage_summary?: string;
    document_content?: string;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'policy_summary',
          data: policyData
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating policy summary:', error);
      return null;
    }
  }

  static async sendChatMessage(conversationId: string, message: string, userPolicies: any[]) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'chat',
          data: {
            message,
            conversation_id: conversationId,
            user_policies: userPolicies
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      return null;
    }
  }

  static async createConversation(userId: string, title: string = 'Insurance Chat') {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: userId, title })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  static async getConversations(userId: string) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  static async getConversationMessages(conversationId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }
}
