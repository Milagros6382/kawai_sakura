import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { authErrorMessage, HOME_BY_ROLE, signUp } from '../services/auth'
import type { Role } from '../types/database'

export function RegisterPage() {
  const { session, profile, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('customer')
  const [error, setError] = useState<string | null>(null)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!loading && session && profile) return <Navigate to={HOME_BY_ROLE[profile.role]} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const loggedIn = await signUp(email, password, role)
      // Si "Confirm email" está activado en Supabase, no hay sesión todavía
      if (!loggedIn) setNeedsConfirmation(true)
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (needsConfirmation) {
    return (
      <main className="auth-page">
        <div className="card auth-card">
          <h1>📧 Revisa tu correo</h1>
          <p>
            Te enviamos un enlace a <strong>{email}</strong>. Confírmalo y luego{' '}
            <Link to="/login">inicia sesión</Link>.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>🌸 Kawaii Sakura</h1>
        <p className="muted">Crea tu cuenta</p>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Contraseña (mínimo 6 caracteres)
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" />
        </label>

        <fieldset className="role-picker">
          <legend>Soy…</legend>
          <label className="radio">
            <input type="radio" name="role" checked={role === 'customer'} onChange={() => setRole('customer')} />
            Cliente (quiero comprar)
          </label>
          <label className="radio">
            <input type="radio" name="role" checked={role === 'supplier'} onChange={() => setRole('supplier')} />
            Proveedor (quiero vender)
          </label>
        </fieldset>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={busy}>
          {busy ? 'Creando cuenta…' : 'Registrarme'}
        </button>
        <p className="muted">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </main>
  )
}
