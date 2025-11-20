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
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string | null
        }
        Relationships: []
      }
      insurance_companies: {
        Row: {
          id: string
          partner_id: string
          company_name: string
          company_number: string | null
          trading_name: string | null
          website_url: string | null
          email: string
          phone: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          postcode: string | null
          country: string | null
          fca_number: string | null
          vat_number: string | null
          company_type: string | null
          status: Database["public"]["Enums"]["company_status_enum"]
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
          kyc_documents: Json
          compliance_documents: Json
          logo_url: string | null
          description: string | null
          is_featured: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          partner_id: string
          company_name: string
          company_number?: string | null
          trading_name?: string | null
          website_url?: string | null
          email: string
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postcode?: string | null
          country?: string | null
          fca_number?: string | null
          vat_number?: string | null
          company_type?: string | null
          status?: Database["public"]["Enums"]["company_status_enum"]
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          kyc_documents?: Json
          compliance_documents?: Json
          logo_url?: string | null
          description?: string | null
          is_featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          partner_id?: string
          company_name?: string
          company_number?: string | null
          trading_name?: string | null
          website_url?: string | null
          email?: string
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postcode?: string | null
          country?: string | null
          fca_number?: string | null
          vat_number?: string | null
          company_type?: string | null
          status?: Database["public"]["Enums"]["company_status_enum"]
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
          kyc_documents?: Json
          compliance_documents?: Json
          logo_url?: string | null
          description?: string | null
          is_featured?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          company_id: string
          product_name: string
          product_type: Database["public"]["Enums"]["insurance_type_enum"]
          description: string | null
          coverage_details: Json
          base_premium: number
          currency: string
          premium_frequency: string
          coverage_amount: number | null
          excess_amount: number | null
          min_age: number | null
          max_age: number | null
          geographic_coverage: Json
          exclusions: string | null
          status: Database["public"]["Enums"]["product_status_enum"]
          admin_notes: string | null
          rejection_reason: string | null
          approved_at: string | null
          approved_by: string | null
          ai_normalized_data: Json
          ai_risk_flags: Json
          data_source: string | null
          source_url: string | null
          last_crawled_at: string | null
          view_count: number
          conversion_count: number
          click_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          product_name: string
          product_type: Database["public"]["Enums"]["insurance_type_enum"]
          description?: string | null
          coverage_details?: Json
          base_premium: number
          currency?: string
          premium_frequency?: string
          coverage_amount?: number | null
          excess_amount?: number | null
          min_age?: number | null
          max_age?: number | null
          geographic_coverage?: Json
          exclusions?: string | null
          status?: Database["public"]["Enums"]["product_status_enum"]
          admin_notes?: string | null
          rejection_reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          ai_normalized_data?: Json
          ai_risk_flags?: Json
          data_source?: string | null
          source_url?: string | null
          last_crawled_at?: string | null
          view_count?: number
          conversion_count?: number
          click_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          product_name?: string
          product_type?: Database["public"]["Enums"]["insurance_type_enum"]
          description?: string | null
          coverage_details?: Json
          base_premium?: number
          currency?: string
          premium_frequency?: string
          coverage_amount?: number | null
          excess_amount?: number | null
          min_age?: number | null
          max_age?: number | null
          geographic_coverage?: Json
          exclusions?: string | null
          status?: Database["public"]["Enums"]["product_status_enum"]
          admin_notes?: string | null
          rejection_reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          ai_normalized_data?: Json
          ai_risk_flags?: Json
          data_source?: string | null
          source_url?: string | null
          last_crawled_at?: string | null
          view_count?: number
          conversion_count?: number
          click_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          }
        ]
      }
      product_verifications: {
        Row: {
          id: string
          product_id: string
          admin_id: string
          status: Database["public"]["Enums"]["verification_status_enum"]
          comments: string | null
          requested_documents: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          admin_id: string
          status: Database["public"]["Enums"]["verification_status_enum"]
          comments?: string | null
          requested_documents?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          admin_id?: string
          status?: Database["public"]["Enums"]["verification_status_enum"]
          comments?: string | null
          requested_documents?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_verifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_crawl_logs: {
        Row: {
          id: string
          operation_type: string
          target_url: string | null
          target_company_id: string | null
          status: Database["public"]["Enums"]["ai_operation_status_enum"]
          products_found: number
          products_updated: number
          products_created: number
          errors: Json
          crawl_rules: Json
          started_at: string
          completed_at: string | null
          duration_seconds: number | null
          triggered_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          operation_type: string
          target_url?: string | null
          target_company_id?: string | null
          status?: Database["public"]["Enums"]["ai_operation_status_enum"]
          products_found?: number
          products_updated?: number
          products_created?: number
          errors?: Json
          crawl_rules?: Json
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
          triggered_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          operation_type?: string
          target_url?: string | null
          target_company_id?: string | null
          status?: Database["public"]["Enums"]["ai_operation_status_enum"]
          products_found?: number
          products_updated?: number
          products_created?: number
          errors?: Json
          crawl_rules?: Json
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
          triggered_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_crawl_logs_target_company_id_fkey"
            columns: ["target_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          }
        ]
      }
      search_queries: {
        Row: {
          id: string
          user_id: string | null
          query_text: string
          insurance_type: Database["public"]["Enums"]["insurance_type_enum"] | null
          filters: Json
          results_count: number
          clicked_product_id: string | null
          user_country: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          query_text: string
          insurance_type?: Database["public"]["Enums"]["insurance_type_enum"] | null
          filters?: Json
          results_count?: number
          clicked_product_id?: string | null
          user_country?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          query_text?: string
          insurance_type?: Database["public"]["Enums"]["insurance_type_enum"] | null
          filters?: Json
          results_count?: number
          clicked_product_id?: string | null
          user_country?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_queries_clicked_product_id_fkey"
            columns: ["clicked_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          event_type: string
          event_category: string | null
          product_id: string | null
          company_id: string | null
          metadata: Json
          user_country: string | null
          user_region: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          event_type: string
          event_category?: string | null
          product_id?: string | null
          company_id?: string | null
          metadata?: Json
          user_country?: string | null
          user_region?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          event_type?: string
          event_category?: string | null
          product_id?: string | null
          company_id?: string | null
          metadata?: Json
          user_country?: string | null
          user_region?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
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
      user_role_enum: "customer" | "partner" | "admin"
      company_status_enum: "pending" | "approved" | "rejected" | "suspended" | "disabled"
      product_status_enum: "draft" | "pending" | "approved" | "rejected" | "paused" | "active" | "archived"
      insurance_type_enum: "health" | "auto" | "life" | "home" | "travel" | "business" | "pet" | "other"
      ai_operation_status_enum: "running" | "completed" | "failed" | "paused"
      verification_status_enum: "pending" | "approved" | "rejected" | "additional_docs_required"
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
      user_role_enum: ["customer", "partner", "admin"],
      company_status_enum: ["pending", "approved", "rejected", "suspended", "disabled"],
      product_status_enum: ["draft", "pending", "approved", "rejected", "paused", "active", "archived"],
      insurance_type_enum: ["health", "auto", "life", "home", "travel", "business", "pet", "other"],
      ai_operation_status_enum: ["running", "completed", "failed", "paused"],
      verification_status_enum: ["pending", "approved", "rejected", "additional_docs_required"],
    },
  },
} as const
