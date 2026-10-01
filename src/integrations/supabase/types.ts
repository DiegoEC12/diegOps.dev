export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      projects: {
        Row: {
          category: string
          created_at: string
          demo_url: string | null
          featured: boolean
          github_url: string | null
          id: string
          image_fit: string
          image_position: string
          image_url: string | null
          problem: string
          published: boolean
          slug: string
          sort_order: number
          summary: string
          technologies: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          demo_url?: string | null
          featured?: boolean
          github_url?: string | null
          id?: string
          image_fit?: string
          image_position?: string
          image_url?: string | null
          problem: string
          published?: boolean
          slug: string
          sort_order?: number
          summary: string
          technologies?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          demo_url?: string | null
          featured?: boolean
          github_url?: string | null
          id?: string
          image_fit?: string
          image_position?: string
          image_url?: string | null
          problem?: string
          published?: boolean
          slug?: string
          sort_order?: number
          summary?: string
          technologies?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          brand_initials: string
          brand_name: string
          hero_title: string
          hero_role: string
          hero_copy: string
          availability_status: string
          email_contact: string | null
          github_url: string | null
          linkedin_url: string | null
          location: string | null
          logo_url: string | null
          logo_fit: string
          logo_position: string
          footer_tagline: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          brand_initials?: string
          brand_name?: string
          hero_title?: string
          hero_role?: string
          hero_copy?: string
          availability_status?: string
          email_contact?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          logo_fit?: string
          logo_position?: string
          footer_tagline?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          brand_initials?: string
          brand_name?: string
          hero_title?: string
          hero_role?: string
          hero_copy?: string
          availability_status?: string
          email_contact?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          logo_fit?: string
          logo_position?: string
          footer_tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      timeline_entries: {
        Row: {
          id: string
          kind: "education" | "experience"
          title: string
          institution: string
          period: string
          status: string
          description: string
          skills_learned: string[]
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          kind: "education" | "experience"
          title: string
          institution: string
          period: string
          status?: string
          description: string
          skills_learned?: string[]
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          kind?: "education" | "experience"
          title?: string
          institution?: string
          period?: string
          status?: string
          description?: string
          skills_learned?: string[]
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          id: string
          title: string
          issuer: string
          issued_date: string
          credential_url: string | null
          credential_id: string | null
          hours: number | null
          badge_url: string | null
          image_fit: string
          image_position: string
          sort_order: number
          published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          issuer: string
          issued_date: string
          credential_url?: string | null
          credential_id?: string | null
          hours?: number | null
          badge_url?: string | null
          image_fit?: string
          image_position?: string
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          issuer?: string
          issued_date?: string
          credential_url?: string | null
          credential_id?: string | null
          hours?: number | null
          badge_url?: string | null
          image_fit?: string
          image_position?: string
          sort_order?: number
          published?: boolean
          created_at?: string
        }
        Relationships: []
      }
      music_tracks: {
        Row: {
          id: string
          title: string
          artist: string
          audio_url: string
          duration: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          artist?: string
          audio_url: string
          duration?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          audio_url?: string
          duration?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      faq_queries: {
        Row: {
          id: string
          question_label: string
          sql_command: string
          result_columns: string[]
          result_rows: Json
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          question_label: string
          sql_command: string
          result_columns?: string[]
          result_rows?: Json
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          question_label?: string
          sql_command?: string
          result_columns?: string[]
          result_rows?: Json
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          id: string
          sender_name: string
          sender_email: string
          subject: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_name: string
          sender_email: string
          subject?: string | null
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_name?: string
          sender_email?: string
          subject?: string | null
          message?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
