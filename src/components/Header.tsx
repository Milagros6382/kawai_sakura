import { useState } from 'react'
import { useAuth } from '../lib/authContext'
import { signOut } from '../services/auth'

// Barra superior con el email del usuario y el botón de salir
export function Header({ title }: { title: string }) {
  const { profile } = useAuth()
  const [busy, setBusy] = useState(false)

  async function handleSignOut() {
    setBusy(true)
    try {
      await signOut()
      // No hace falta redirigir: al perder la sesión, ProtectedRoute manda a /login
    } finally {
      setBusy(false)
    }
  }

  return (
    <header className="header">
      <h1>{title}</h1>
      <div className="header-user">
        <span>{profile?.email}</span>
        <button type="button" className="secondary" onClick={handleSignOut} disabled={busy}>
          Salir
        </button>
      </div>
    </header>
  )
}
