export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_conversations: {
        Row: {
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      claims: {
        Row: {
          ai_risk_score: number | null
          claim_amount: number | null
          claim_documents: string | null
          claim_reason: string
          claim_status: Database["public"]["Enums"]["claim_status_enum"] | null
          created_at: string | null
          id: string
          policy_id: string
          risk_factors: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_risk_score?: number | null
          claim_amount?: number | null
          claim_documents?: string | null
          claim_reason: string
          claim_status?: Database["public"]["Enums"]["claim_status_enum"] | null
          created_at?: string | null
          id?: string
          policy_id: string
          risk_factors?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_risk_score?: number | null
          claim_amount?: number | null
          claim_documents?: string | null
          claim_reason?: string
          claim_status?: Database["public"]["Enums"]["claim_status_enum"] | null
          created_at?: string | null
          id?: string
          policy_id?: string
          risk_factors?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      comparison_offers: {
        Row: {
          benefits: string | null
          contact_info: string | null
          coverage_details: string | null
          created_at: string | null
          id: string
          insurer_name: string
          policy_type: Database["public"]["Enums"]["policy_type_enum"] | null
          premium_amount: number
        }
        Insert: {
          benefits?: string | null
          contact_info?: string | null
          coverage_details?: string | null
          created_at?: string | null
          id?: string
          insurer_name: string
          policy_type?: Database["public"]["Enums"]["policy_type_enum"] | null
          premium_amount: number
        }
        Update: {
          benefits?: string | null
          contact_info?: string | null
          coverage_details?: string | null
          created_at?: string | null
          id?: string
          insurer_name?: string
          policy_type?: Database["public"]["Enums"]["policy_type_enum"] | null
          premium_amount?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          description: string | null
          document_category: string | null
          document_type: Database["public"]["Enums"]["document_type_enum"]
          file_size: number | null
          file_url: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          document_category?: string | null
          document_type: Database["public"]["Enums"]["document_type_enum"]
          file_size?: number | null
          file_url: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          document_category?: string | null
          document_type?: Database["public"]["Enums"]["document_type_enum"]
          file_size?: number | null
          file_url?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          message: string
          status: Database["public"]["Enums"]["notification_status_enum"] | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          id?: string
          message: string
          status?:
            | Database["public"]["Enums"]["notification_status_enum"]
            | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message?: string
          status?:
            | Database["public"]["Enums"]["notification_status_enum"]
            | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          service: string
          status: string
          stripe_session_id: string | null
          transaction_reference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          service: string
          status?: string
          stripe_session_id?: string | null
          transaction_reference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          service?: string
          status?: string
          stripe_session_id?: string | null
          transaction_reference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      policies: {
        Row: {
          ai_summary: string | null
          coverage_summary: string | null
          created_at: string | null
          document_url: string | null
          end_date: string
          fine_print_summary: string | null
          id: string
          policy_number: string | null
          policy_type: Database["public"]["Enums"]["policy_type_enum"]
          premium_amount: number
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          coverage_summary?: string | null
          created_at?: string | null
          document_url?: string | null
          end_date: string
          fine_print_summary?: string | null
          id?: string
          policy_number?: string | null
          policy_type: Database["public"]["Enums"]["policy_type_enum"]
          premium_amount: number
          start_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          coverage_summary?: string | null
          created_at?: string | null
          document_url?: string | null
          end_date?: string
          fine_print_summary?: string | null
          id?: string
          policy_number?: string | null
          policy_type?: Database["public"]["Enums"]["policy_type_enum"]
          premium_amount?: number
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role_enum"] | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role_enum"] | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role_enum"] | null
        }
        Relationships: []
      }
      insurance_partners: {
        Row: {
          id: string
          user_id: string
          company_name: string
          company_registration_number: string | null
          company_logo_url: string | null
          company_description: string | null
          contact_email: string
          contact_phone: string | null
          website_url: string | null
          address: string | null
          city: string | null
          country: string | null
          postal_code: string | null
          is_verified: boolean | null
          verification_date: string | null
          ai_quality_score: number | null
          total_products: number | null
          total_views: number | null
          total_clicks: number | null
          total_conversions: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          company_registration_number?: string | null
          company_logo_url?: string | null
          company_description?: string | null
          contact_email: string
          contact_phone?: string | null
          website_url?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          is_verified?: boolean | null
          verification_date?: string | null
          ai_quality_score?: number | null
          total_products?: number | null
          total_views?: number | null
          total_clicks?: number | null
          total_conversions?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          company_registration_number?: string | null
          company_logo_url?: string | null
          company_description?: string | null
          contact_email?: string
          contact_phone?: string | null
          website_url?: string | null
          address?: string | null
          city?: string | null
          country?: string | null
          postal_code?: string | null
          is_verified?: boolean | null
          verification_date?: string | null
          ai_quality_score?: number | null
          total_products?: number | null
          total_views?: number | null
          total_clicks?: number | null
          total_conversions?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      insurance_products: {
        Row: {
          id: string
          partner_id: string
          product_name: string
          insurance_type: Database["public"]["Enums"]["insurance_type_enum"]
          short_summary: string | null
          full_description: string | null
          target_users: string | null
          region_country: string | null
          premium_start_price: number
          currency: string | null
          coverage_limits: Json | null
          excess_deductibles: Json | null
          add_ons: Json | null
          exclusions_list: string[] | null
          key_benefits: string[] | null
          ai_generated_description: string | null
          ai_generated_exclusions: string[] | null
          ai_generated_marketing_copy: string | null
          ai_generated_faq: Json | null
          ai_quality_score: number | null
          status: Database["public"]["Enums"]["product_status_enum"] | null
          admin_notes: string | null
          approved_by: string | null
          approved_at: string | null
          published_at: string | null
          view_count: number | null
          click_count: number | null
          conversion_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          partner_id: string
          product_name: string
          insurance_type: Database["public"]["Enums"]["insurance_type_enum"]
          short_summary?: string | null
          full_description?: string | null
          target_users?: string | null
          region_country?: string | null
          premium_start_price: number
          currency?: string | null
          coverage_limits?: Json | null
          excess_deductibles?: Json | null
          add_ons?: Json | null
          exclusions_list?: string[] | null
          key_benefits?: string[] | null
          ai_generated_description?: string | null
          ai_generated_exclusions?: string[] | null
          ai_generated_marketing_copy?: string | null
          ai_generated_faq?: Json | null
          ai_quality_score?: number | null
          status?: Database["public"]["Enums"]["product_status_enum"] | null
          admin_notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          published_at?: string | null
          view_count?: number | null
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          partner_id?: string
          product_name?: string
          insurance_type?: Database["public"]["Enums"]["insurance_type_enum"]
          short_summary?: string | null
          full_description?: string | null
          target_users?: string | null
          region_country?: string | null
          premium_start_price?: number
          currency?: string | null
          coverage_limits?: Json | null
          excess_deductibles?: Json | null
          add_ons?: Json | null
          exclusions_list?: string[] | null
          key_benefits?: string[] | null
          ai_generated_description?: string | null
          ai_generated_exclusions?: string[] | null
          ai_generated_marketing_copy?: string | null
          ai_generated_faq?: Json | null
          ai_quality_score?: number | null
          status?: Database["public"]["Enums"]["product_status_enum"] | null
          admin_notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          published_at?: string | null
          view_count?: number | null
          click_count?: number | null
          conversion_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_products_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "insurance_partners"
            referencedColumns: ["id"]
          }
        ]
      }
      product_media: {
        Row: {
          id: string
          product_id: string
          media_type: Database["public"]["Enums"]["media_type_enum"]
          file_url: string
          file_name: string | null
          file_size: number | null
          alt_text: string | null
          display_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          media_type: Database["public"]["Enums"]["media_type_enum"]
          file_url: string
          file_name?: string | null
          file_size?: number | null
          alt_text?: string | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          media_type?: Database["public"]["Enums"]["media_type_enum"]
          file_url?: string
          file_name?: string | null
          file_size?: number | null
          alt_text?: string | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "insurance_products"
            referencedColumns: ["id"]
          }
        ]
      }
      underwriting_rules: {
        Row: {
          id: string
          product_id: string
          rule_name: string
          rule_description: string | null
          conditions: Json
          action: Database["public"]["Enums"]["rule_action_enum"]
          action_value: number | null
          action_message: string | null
          priority: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          rule_name: string
          rule_description?: string | null
          conditions: Json
          action: Database["public"]["Enums"]["rule_action_enum"]
          action_value?: number | null
          action_message?: string | null
          priority?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          rule_name?: string
          rule_description?: string | null
          conditions?: Json
          action?: Database["public"]["Enums"]["rule_action_enum"]
          action_value?: number | null
          action_message?: string | null
          priority?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "underwriting_rules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "insurance_products"
            referencedColumns: ["id"]
          }
        ]
      }
      product_documents: {
        Row: {
          id: string
          product_id: string
          document_category: Database["public"]["Enums"]["document_category_enum"]
          document_name: string
          file_url: string
          file_size: number | null
          file_type: string | null
          version: string | null
          is_current: boolean | null
          uploaded_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          document_category: Database["public"]["Enums"]["document_category_enum"]
          document_name: string
          file_url: string
          file_size?: number | null
          file_type?: string | null
          version?: string | null
          is_current?: boolean | null
          uploaded_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          document_category?: Database["public"]["Enums"]["document_category_enum"]
          document_name?: string
          file_url?: string
          file_size?: number | null
          file_type?: string | null
          version?: string | null
          is_current?: boolean | null
          uploaded_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_documents_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "insurance_products"
            referencedColumns: ["id"]
          }
        ]
      }
      product_stats: {
        Row: {
          id: string
          product_id: string
          date: string
          views: number | null
          clicks: number | null
          conversions: number | null
          quote_requests: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          date: string
          views?: number | null
          clicks?: number | null
          conversions?: number | null
          quote_requests?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          date?: string
          views?: number | null
          clicks?: number | null
          conversions?: number | null
          quote_requests?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_stats_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "insurance_products"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          end_date: string | null
          id: string
          plan_id: string
          start_date: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          plan_id: string
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          plan_id?: string
          start_date?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      claim_status_enum: "pending" | "approved" | "rejected" | "processing"
      document_type_enum: "policy" | "receipt" | "id" | "claim" | "other"
      notification_status_enum: "read" | "unread"
      policy_type_enum: "health" | "auto" | "life" | "home" | "other"
      user_role_enum: "consumer" | "partner" | "admin"
      product_status_enum: "draft" | "pending_review" | "active" | "paused" | "archived"
      insurance_type_enum: "health" | "auto" | "life" | "home" | "travel" | "business" | "pet" | "other"
      media_type_enum: "logo" | "banner" | "icon" | "thumbnail"
      document_category_enum: "policy_wording" | "product_brochure" | "terms_conditions" | "other"
      rule_action_enum: "reject" | "increase_premium" | "decrease_premium" | "require_approval" | "flag_for_review"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      claim_status_enum: ["pending", "approved", "rejected", "processing"],
      document_type_enum: ["policy", "receipt", "id", "claim", "other"],
      notification_status_enum: ["read", "unread"],
      policy_type_enum: ["health", "auto", "life", "home", "other"],
      user_role_enum: ["consumer", "partner", "admin"],
      product_status_enum: ["draft", "pending_review", "active", "paused", "archived"],
      insurance_type_enum: ["health", "auto", "life", "home", "travel", "business", "pet", "other"],
      media_type_enum: ["logo", "banner", "icon", "thumbnail"],
      document_category_enum: ["policy_wording", "product_brochure", "terms_conditions", "other"],
      rule_action_enum: ["reject", "increase_premium", "decrease_premium", "require_approval", "flag_for_review"],
    },
  },
} as const
