import { useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { authErrorMessage, HOME_BY_ROLE, signIn } from '../services/auth'

export function LoginPage() {
  const { session, profile, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // Si ya hay sesión, va directo a su panel según el rol
  if (!loading && session && profile) return <Navigate to={HOME_BY_ROLE[profile.role]} replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault() // evita que el navegador recargue la página
    setError(null)
    setBusy(true)
    try {
      await signIn(email, password)
      // Al iniciar sesión, AuthProvider carga el perfil y el "if" de arriba redirige
    } catch (err) {
      setError(authErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <form className="card auth-card" onSubmit={handleSubmit}>
        <h1>🌸 Kawaii Sakura</h1>
        <p className="muted">Inicia sesión</p>

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={busy}>
          {busy ? 'Entrando…' : 'Entrar'}
        </button>
        <p className="muted">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </form>
    </main>
  )
}
