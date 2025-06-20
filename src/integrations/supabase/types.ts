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
      claims: {
        Row: {
          claim_amount: number | null
          claim_documents: string | null
          claim_reason: string
          claim_status: Database["public"]["Enums"]["claim_status_enum"] | null
          created_at: string | null
          id: string
          policy_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          claim_amount?: number | null
          claim_documents?: string | null
          claim_reason: string
          claim_status?: Database["public"]["Enums"]["claim_status_enum"] | null
          created_at?: string | null
          id?: string
          policy_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          claim_amount?: number | null
          claim_documents?: string | null
          claim_reason?: string
          claim_status?: Database["public"]["Enums"]["claim_status_enum"] | null
          created_at?: string | null
          id?: string
          policy_id?: string
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
          document_type: Database["public"]["Enums"]["document_type_enum"]
          file_size: number | null
          file_url: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_type: Database["public"]["Enums"]["document_type_enum"]
          file_size?: number | null
          file_url: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      policies: {
        Row: {
          coverage_summary: string | null
          created_at: string | null
          document_url: string | null
          end_date: string
          id: string
          policy_type: Database["public"]["Enums"]["policy_type_enum"]
          premium_amount: number
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coverage_summary?: string | null
          created_at?: string | null
          document_url?: string | null
          end_date: string
          id?: string
          policy_type: Database["public"]["Enums"]["policy_type_enum"]
          premium_amount: number
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coverage_summary?: string | null
          created_at?: string | null
          document_url?: string | null
          end_date?: string
          id?: string
          policy_type?: Database["public"]["Enums"]["policy_type_enum"]
          premium_amount?: number
          start_date?: string
          updated_at?: string | null
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
    },
  },
} as const
