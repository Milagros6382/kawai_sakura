import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { HOME_BY_ROLE } from '../services/auth'
import type { Role } from '../types/database'

// Deja pasar solo a usuarios con sesión y con el rol indicado.
// Ojo: esto es comodidad (no mostrar pantallas equivocadas).
// La seguridad real la siguen poniendo las policies RLS de la base.
export function ProtectedRoute({ role, children }: { role: Role; children: ReactNode }) {
  const { session, profile, loading } = useAuth()

  if (loading) return <p className="center-message">Cargando…</p>
  if (!session) return <Navigate to="/login" replace />
  if (!profile) return <p className="center-message">No se encontró tu perfil.</p>
  if (profile.role !== role) return <Navigate to={HOME_BY_ROLE[profile.role]} replace />

  // Las pantallas con sesión llevan la imagen de fondo (ver .app-bg en index.css)
  return <div className="app-bg">{children}</div>
}
