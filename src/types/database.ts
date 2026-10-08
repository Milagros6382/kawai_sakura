// Forma de las tablas de Supabase, en el formato que espera supabase-js.
// Si cambias supabase/schema.sql, actualiza también este archivo.
// (Más adelante puede generarse solo con: npx supabase gen types typescript)

export type Role = 'customer' | 'supplier'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: Role
          created_at: string
        }
        Insert: never
        Update: never
        Relationships: []
      }
      customer_measurements: {
        Row: {
          id: string
          user_id: string
          bust: number
          body_length: number
          hip: number
          updated_at: string
        }
        Insert: {
          user_id: string
          bust: number
          body_length: number
          hip: number
        }
        Update: {
          bust?: number
          body_length?: number
          hip?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          supplier_id: string
          name: string
          image_url: string | null
          bust: number
          length: number
          hip: number
          created_at: string
        }
        Insert: {
          supplier_id: string
          name: string
          image_url?: string | null
          bust: number
          length: number
          hip: number
        }
        Update: {
          name?: string
          image_url?: string | null
          bust?: number
          length?: number
          hip?: number
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// Atajos para usar en el resto de la app
type Tables = Database['public']['Tables']
export type Profile = Tables['profiles']['Row']
export type CustomerMeasurements = Tables['customer_measurements']['Row']
export type Product = Tables['products']['Row']
