import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { COPY } from '../lib/kawaii'
import { authErrorMessage, HOME_BY_ROLE, signUp } from '../services/auth'
import { KawaiiDecoration, KawaiiDivider } from '../components/KawaiiDecoration'
import { ResendConfirmation } from '../components/ResendConfirmation'
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

  // Solo llegamos acá si Supabase aceptó el registro de verdad
  if (needsConfirmation) {
    return (
      <main className="auth-page">
        <div className="card auth-card" role="status">
          <KawaiiDecoration className="kawaii-top">୨୧ ─── 🎐 ─── ୨୧</KawaiiDecoration>
          <h1>{COPY.registerSuccess}</h1>
          <p className="notice">{COPY.checkInbox}</p>
          <p>
            {COPY.emailSent}
            <br />
            Te enviamos un enlace a <strong>{email}</strong>. Confírmalo y luego{' '}
            <Link to="/login">inicia sesión</Link>.
          </p>
          <p className="muted small">¿No llegó? Revisá la carpeta de spam o pedí otra:</p>
          <ResendConfirmation email={email} startWithCooldown />
          <KawaiiDivider />
        </div>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <KawaiiDecoration className="kawaii-top">˚₊‧꒰ა ようこそ ໒꒱‧₊˚</KawaiiDecoration>
        <p className="brand">Kawaii Sakura</p>
        <h1>{COPY.registerTitle}</h1>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder={COPY.emailPlaceholder}
          />
        </label>
        <label>
          Contraseña (mínimo 6 caracteres)
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder={COPY.passwordPlaceholder}
          />
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

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy}>
          {busy ? 'Creando cuenta…' : COPY.registerButton}
        </button>
        <p className="muted">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
        <KawaiiDivider />
      </form>
    </main>
  )
}
