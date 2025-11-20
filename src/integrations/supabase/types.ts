/* --------------------------------------------------------------------------
   SUPABASE TYPE DEFINITIONS — CLEANED, MERGED, PRODUCTION READY
-------------------------------------------------------------------------- */

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

      /* -------------------------------------------------------------  
         CHAT TABLES
      ------------------------------------------------------------- */

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
          }
        ]
      }

      /* -------------------------------------------------------------  
         CLAIMS & POLICIES
      ------------------------------------------------------------- */

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
          }
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

      /* -------------------------------------------------------------  
         INSURANCE COMPANIES (Onboarding)
      ------------------------------------------------------------- */

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

      /* -------------------------------------------------------------  
         NOTIFICATIONS / PAYMENTS / SUBSCRIPTIONS
      ------------------------------------------------------------- */

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
          status?: Database["public"]["Enums"]["notification_status_enum"] | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          id?: string
          message?: string
          status?: Database["public"]["Enums"]["notification_status_enum"] | null
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

      /* -------------------------------------------------------------  
         POLICIES
      ------------------------------------------------------------- */

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

      /* -------------------------------------------------------------  
         PROFILES (Users)
      ------------------------------------------------------------- */

      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at: string | null
          user_role: Database["public"]["Enums"]["user_role_enum"] | null
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role_enum"] | null
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at?: string | null
          user_role?: Database["public"]["Enums"]["user_role_enum"] | null
        }
        Relationships: []
      }

      /* -------------------------------------------------------------  
         PARTNERS (For Marketplace / Product Listing)
      ------------------------------------------------------------- */

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

      /* -------------------------------------------------------------  
         INSURANCE PRODUCTS
      ------------------------------------------------------------- */

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

      /* -------------------------------------------------------------  
         PRODUCT MEDIA
      ------------------------------------------------------------- */

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

      /* -------------------------------------------------------------  
         UNDERWRITING RULES
      ------------------------------------------------------------- */

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

      /* -------------------------------------------------------------  
         PRODUCT DOCUMENTS
      ------------------------------------------------------------- */

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

      /* -------------------------------------------------------------  
         PRODUCT STATS
      ------------------------------------------------------------- */

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
    },

    /* -------------------------------------------------------------
       ENUMS
    ------------------------------------------------------------- */
    Enums: {
      claim_status_enum: "pending" | "approved" | "rejected" | "processing"

      company_document_type_enum:
        | "certificate_of_incorporation"
        | "insurance_licence"
        | "proof_of_address"
        | "compliance_document"
        | "other"

      document_type_enum: "policy" | "receipt" | "id" | "claim" | "other"

      insurance_type_enum:
        | "vehicle"
        | "auto"
        | "travel"
        | "health"
        | "home"
        | "life"
        | "business"
        | "pet"
        | "other"

      notification_status_enum: "read" | "unread"

      onboarding_status_enum:
        | "pending_verification"
        | "documents_uploaded"
        | "under_review"
        | "approved"
        | "rejected"

      policy_type_enum: "health" | "auto" | "life" | "home" | "other"

      user_role_enum: "customer" | "insurance_company" | "partner" | "admin"

      verification_type_enum: "email" | "phone"

      product_status_enum:
        | "draft"
        | "pending_review"
        | "active"
        | "paused"
        | "archived"

      media_type_enum: "logo" | "banner" | "icon" | "thumbnail"

      document_category_enum:
        | "policy_wording"
        | "product_brochure"
        | "terms_conditions"
        | "other"

      rule_action_enum:
        | "reject"
        | "increase_premium"
        | "decrease_premium"
        | "require_approval"
        | "flag_for_review"
    },

    Views: {},
    Functions: {},
    CompositeTypes: {}
  }
}

/* -------------------------------------------------------------
   UTILITY TYPES
------------------------------------------------------------- */

type DefaultSchema = Database["public"]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T]["Row"]

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Update"]

export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]

/* -------------------------------------------------------------
   CONSTANTS OBJECT
------------------------------------------------------------- */

export const Constants = {
  public: {
    Enums: {
      claim_status_enum: ["pending", "approved", "rejected", "processing"],
      company_document_type_enum: [
        "certificate_of_incorporation",
        "insurance_licence",
        "proof_of_address",
        "compliance_document",
        "other",
      ],
      document_type_enum: ["policy", "receipt", "id", "claim", "other"],

      insurance_type_enum: [
        "vehicle",
        "auto",
        "travel",
        "health",
        "home",
        "life",
        "business",
        "pet",
        "other",
      ],

      notification_status_enum: ["read", "unread"],
      onboarding_status_enum: [
        "pending_verification",
        "documents_uploaded",
        "under_review",
        "approved",
        "rejected",
      ],

      policy_type_enum: ["health", "auto", "life", "home", "other"],

      user_role_enum: ["customer", "insurance_company", "partner", "admin"],

      verification_type_enum: ["email", "phone"],

      product_status_enum: [
        "draft",
        "pending_review",
        "active",
        "paused",
        "archived",
      ],

      media_type_enum: ["logo", "banner", "icon", "thumbnail"],

      document_category_enum: [
        "policy_wording",
        "product_brochure",
        "terms_conditions",
        "other",
      ],

      rule_action_enum: [
        "reject",
        "increase_premium",
        "decrease_premium",
        "require_approval",
        "flag_for_review",
      ],
    },
  },
} as const
