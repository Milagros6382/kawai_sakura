import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Profile } from '../types/database'

// Lo que cualquier componente puede saber sobre la sesión actual
export type AuthState = {
  session: Session | null
  profile: Profile | null
  loading: boolean // true mientras averiguamos si hay sesión y cuál es el rol
}

export const AuthContext = createContext<AuthState | null>(null)

// Uso: const { session, profile, loading } = useAuth()
export function useAuth(): AuthState {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return value
}
