import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { AuthContext } from '../lib/authContext'
import { getProfile } from '../services/auth'
import type { Profile } from '../types/database'

// Envuelve toda la app y mantiene actualizados la sesión y el perfil.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileUserId, setProfileUserId] = useState<string | null>(null)

  // 1. Sesión: la leemos al abrir la app y escuchamos cambios
  //    (login, logout, renovación del token).
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setSessionLoading(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  // 2. Perfil: cada vez que cambia el usuario, buscamos su rol en la tabla profiles.
  const userId = session?.user.id ?? null
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    getProfile(userId)
      .catch(() => null)
      .then((p) => {
        if (cancelled) return
        setProfile(p)
        setProfileUserId(userId)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  // Si el perfil cargado es de otro usuario (o no hay sesión), todavía no sirve
  const currentProfile = userId && profileUserId === userId ? profile : null
  const loading = sessionLoading || (userId !== null && profileUserId !== userId)

  return (
    <AuthContext.Provider value={{ session, profile: currentProfile, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
