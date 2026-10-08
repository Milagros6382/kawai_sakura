import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Vite expone las variables del archivo .env que empiezan con VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Copia .env.example como .env y complétalo.',
  )
}

// Un único cliente para toda la app: lo importan los archivos de services/
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export const PRODUCT_IMAGES_BUCKET = 'product-images'
