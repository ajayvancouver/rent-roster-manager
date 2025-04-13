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
      documents: {
        Row: {
          created_at: string | null
          file_size: string
          file_type: string
          id: string
          name: string
          property_id: string | null
          tenant_id: string | null
          tenant_user_id: string | null
          type: string
          updated_at: string | null
          upload_date: string
          url: string
        }
        Insert: {
          created_at?: string | null
          file_size: string
          file_type: string
          id?: string
          name: string
          property_id?: string | null
          tenant_id?: string | null
          tenant_user_id?: string | null
          type: string
          updated_at?: string | null
          upload_date?: string
          url: string
        }
        Update: {
          created_at?: string | null
          file_size?: string
          file_type?: string
          id?: string
          name?: string
          property_id?: string | null
          tenant_id?: string | null
          tenant_user_id?: string | null
          type?: string
          updated_at?: string | null
          upload_date?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance: {
        Row: {
          assigned_to: string | null
          cost: number | null
          created_at: string | null
          date_completed: string | null
          date_submitted: string
          description: string
          id: string
          priority: string
          property_id: string
          status: string
          tenant_id: string | null
          tenant_user_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          cost?: number | null
          created_at?: string | null
          date_completed?: string | null
          date_submitted?: string
          description: string
          id?: string
          priority: string
          property_id: string
          status: string
          tenant_id?: string | null
          tenant_user_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          cost?: number | null
          created_at?: string | null
          date_completed?: string | null
          date_submitted?: string
          description?: string
          id?: string
          priority?: string
          property_id?: string
          status?: string
          tenant_id?: string | null
          tenant_user_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          id: string
          method: string
          notes: string | null
          status: string
          tenant_id: string
          tenant_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          id?: string
          method: string
          notes?: string | null
          status: string
          tenant_id: string
          tenant_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          id?: string
          method?: string
          notes?: string | null
          status?: string
          tenant_id?: string
          tenant_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number | null
          created_at: string
          deposit_amount: number | null
          email: string
          full_name: string | null
          id: string
          lease_end: string | null
          lease_start: string | null
          phone: string | null
          property_id: string | null
          rent_amount: number | null
          status: string | null
          unit_number: string | null
          updated_at: string
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string
          deposit_amount?: number | null
          email: string
          full_name?: string | null
          id: string
          lease_end?: string | null
          lease_start?: string | null
          phone?: string | null
          property_id?: string | null
          rent_amount?: number | null
          status?: string | null
          unit_number?: string | null
          updated_at?: string
          user_type?: string
        }
        Update: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string
          deposit_amount?: number | null
          email?: string
          full_name?: string | null
          id?: string
          lease_end?: string | null
          lease_start?: string | null
          phone?: string | null
          property_id?: string | null
          rent_amount?: number | null
          status?: string | null
          unit_number?: string | null
          updated_at?: string
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          address: string
          city: string
          created_at: string | null
          id: string
          image: string | null
          name: string
          state: string
          type: string
          units: number
          updated_at: string | null
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          id?: string
          image?: string | null
          name: string
          state: string
          type: string
          units: number
          updated_at?: string | null
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          id?: string
          image?: string | null
          name?: string
          state?: string
          type?: string
          units?: number
          updated_at?: string | null
          zip_code?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          balance: number | null
          created_at: string | null
          deposit_amount: number
          email: string
          id: string
          lease_end: string
          lease_start: string
          name: string
          phone: string | null
          property_id: string | null
          rent_amount: number
          status: string
          tenant_user_id: string | null
          unit_number: string | null
          updated_at: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          deposit_amount: number
          email: string
          id?: string
          lease_end: string
          lease_start: string
          name: string
          phone?: string | null
          property_id?: string | null
          rent_amount: number
          status: string
          tenant_user_id?: string | null
          unit_number?: string | null
          updated_at?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          deposit_amount?: number
          email?: string
          id?: string
          lease_end?: string
          lease_start?: string
          name?: string
          phone?: string | null
          property_id?: string | null
          rent_amount?: number
          status?: string
          tenant_user_id?: string | null
          unit_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: "manager" | "tenant"
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
      user_type: ["manager", "tenant"],
    },
  },
} as const
