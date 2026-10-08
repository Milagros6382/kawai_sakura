import { supabase } from '../lib/supabase'
import type { Profile, Role } from '../types/database'

// Registro: el rol viaja como "metadata". El trigger handle_new_user
// (en schema.sql) lo lee y crea la fila en profiles.
// Devuelve true si quedó con sesión iniciada, false si debe confirmar el email.
export async function signUp(email: string, password: string, role: Role): Promise<boolean> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role },
      // A dónde vuelve el link del email de confirmación (la app que esté abierta:
      // localhost en desarrollo, el dominio real cuando se publique).
      // Debe estar permitido en Supabase: Authentication → URL Configuration.
      emailRedirectTo: `${window.location.origin}${import.meta.env.BASE_URL}login`,
    },
  })
  if (error) throw error
  return data.session !== null
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Lee el perfil (y por lo tanto el rol) del usuario. La policy
// "profiles: ver el propio" hace que solo pueda leer el suyo.
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

// Pasa los mensajes de error de Supabase (en inglés) a algo entendible
export function authErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  if (message.includes('Invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (message.includes('User already registered')) return 'Ya existe una cuenta con ese email.'
  if (message.includes('Email not confirmed')) return 'Primero confirma tu email (revisa tu correo).'
  if (message.includes('Password should be')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (message.includes('rate limit')) return 'Demasiados intentos. Espera unos minutos.'
  return message
}

export const HOME_BY_ROLE: Record<Role, string> = {
  customer: '/customer',
  supplier: '/supplier',
}
