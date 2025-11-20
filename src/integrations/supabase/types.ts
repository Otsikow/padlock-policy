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
      insurance_companies: {
        Row: {
          id: string
          user_id: string
          legal_name: string
          registration_number: string
          website: string | null
          country: string
          phone: string
          phone_verified: boolean | null
          email_verified: boolean | null
          onboarding_status: Database["public"]["Enums"]["onboarding_status_enum"] | null
          compliance_officer_name: string | null
          compliance_officer_email: string | null
          compliance_officer_phone: string | null
          rejection_reason: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          legal_name: string
          registration_number: string
          website?: string | null
          country: string
          phone: string
          phone_verified?: boolean | null
          email_verified?: boolean | null
          onboarding_status?: Database["public"]["Enums"]["onboarding_status_enum"] | null
          compliance_officer_name?: string | null
          compliance_officer_email?: string | null
          compliance_officer_phone?: string | null
          rejection_reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          legal_name?: string
          registration_number?: string
          website?: string | null
          country?: string
          phone?: string
          phone_verified?: boolean | null
          email_verified?: boolean | null
          onboarding_status?: Database["public"]["Enums"]["onboarding_status_enum"] | null
          compliance_officer_name?: string | null
          compliance_officer_email?: string | null
          compliance_officer_phone?: string | null
          rejection_reason?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      insurance_company_profiles: {
        Row: {
          id: string
          company_id: string
          logo_url: string | null
          brand_color_primary: string | null
          brand_color_secondary: string | null
          company_bio: string | null
          office_locations: Json | null
          customer_support_email: string | null
          customer_support_phone: string | null
          customer_support_hours: string | null
          insurance_types: Database["public"]["Enums"]["insurance_type_enum"][] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          company_id: string
          logo_url?: string | null
          brand_color_primary?: string | null
          brand_color_secondary?: string | null
          company_bio?: string | null
          office_locations?: Json | null
          customer_support_email?: string | null
          customer_support_phone?: string | null
          customer_support_hours?: string | null
          insurance_types?: Database["public"]["Enums"]["insurance_type_enum"][] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          logo_url?: string | null
          brand_color_primary?: string | null
          brand_color_secondary?: string | null
          company_bio?: string | null
          office_locations?: Json | null
          customer_support_email?: string | null
          customer_support_phone?: string | null
          customer_support_hours?: string | null
          insurance_types?: Database["public"]["Enums"]["insurance_type_enum"][] | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_company_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          }
        ]
      }
      insurance_company_documents: {
        Row: {
          id: string
          company_id: string
          document_type: Database["public"]["Enums"]["company_document_type_enum"]
          file_url: string
          file_name: string
          file_size: number | null
          uploaded_by: string
          notes: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          document_type: Database["public"]["Enums"]["company_document_type_enum"]
          file_url: string
          file_name: string
          file_size?: number | null
          uploaded_by: string
          notes?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          document_type?: Database["public"]["Enums"]["company_document_type_enum"]
          file_url?: string
          file_name?: string
          file_size?: number | null
          uploaded_by?: string
          notes?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_company_documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          }
        ]
      }
      insurance_company_verifications: {
        Row: {
          id: string
          company_id: string
          verification_type: Database["public"]["Enums"]["verification_type_enum"]
          verification_value: string
          otp_code: string
          verified: boolean | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          verification_type: Database["public"]["Enums"]["verification_type_enum"]
          verification_value: string
          otp_code: string
          verified?: boolean | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          verification_type?: Database["public"]["Enums"]["verification_type_enum"]
          verification_value?: string
          otp_code?: string
          verified?: boolean | null
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_company_verifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          }
        ]
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
          role: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at?: string | null
        }
        Relationships: []
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
      company_document_type_enum: "certificate_of_incorporation" | "insurance_licence" | "proof_of_address" | "compliance_document" | "other"
      document_type_enum: "policy" | "receipt" | "id" | "claim" | "other"
      insurance_type_enum: "vehicle" | "travel" | "health" | "home" | "life" | "business" | "other"
      notification_status_enum: "read" | "unread"
      onboarding_status_enum: "pending_verification" | "documents_uploaded" | "under_review" | "approved" | "rejected"
      policy_type_enum: "health" | "auto" | "life" | "home" | "other"
      user_role_enum: "customer" | "insurance_company" | "admin"
      verification_type_enum: "email" | "phone"
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
      company_document_type_enum: ["certificate_of_incorporation", "insurance_licence", "proof_of_address", "compliance_document", "other"],
      document_type_enum: ["policy", "receipt", "id", "claim", "other"],
      insurance_type_enum: ["vehicle", "travel", "health", "home", "life", "business", "other"],
      notification_status_enum: ["read", "unread"],
      onboarding_status_enum: ["pending_verification", "documents_uploaded", "under_review", "approved", "rejected"],
      policy_type_enum: ["health", "auto", "life", "home", "other"],
      user_role_enum: ["customer", "insurance_company", "admin"],
      verification_type_enum: ["email", "phone"],
    },
  },
} as const
