import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { COPY } from '../lib/kawaii'
import { authErrorMessage, HOME_BY_ROLE, isEmailNotConfirmed, signIn } from '../services/auth'
import { KawaiiDecoration, KawaiiDivider } from '../components/KawaiiDecoration'
import { ResendConfirmation } from '../components/ResendConfirmation'

export function LoginPage() {
  const { session, profile, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notConfirmed, setNotConfirmed] = useState(false)
  const [busy, setBusy] = useState(false)

  // Si ya hay sesión, va directo a su panel según el rol
  if (!loading && session && profile) return <Navigate to={HOME_BY_ROLE[profile.role]} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault() // evita que el navegador recargue la página
    setError(null)
    setNotConfirmed(false)
    setBusy(true)
    try {
      await signIn(email, password)
      // Al iniciar sesión, AuthProvider carga el perfil y el "if" de arriba redirige
    } catch (err) {
      setError(authErrorMessage(err))
      setNotConfirmed(isEmailNotConfirmed(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <KawaiiDecoration className="kawaii-top">˚₊‧ 🎐 風鈴 ‧₊˚</KawaiiDecoration>
        <p className="brand">Kawaii Sakura</p>
        <h1>{COPY.loginTitle}</h1>

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
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder={COPY.passwordPlaceholder}
          />
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {/* La cuenta existe pero falta confirmar el email: ofrecemos reenviarlo */}
        {notConfirmed && (
          <>
            <p className="notice">{COPY.checkInbox}</p>
            <ResendConfirmation email={email} />
          </>
        )}

        <button type="submit" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar ♡'}
        </button>
        <p className="muted">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
        <KawaiiDivider />
      </form>
    </main>
  )
}
