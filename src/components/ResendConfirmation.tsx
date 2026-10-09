import { useEffect, useState } from 'react'
import { COPY } from '../lib/kawaii'
import { authErrorMessage, resendConfirmation } from '../services/auth'

// Supabase solo deja reenviar el email cada 60 segundos: esperamos lo mismo
// para no mandar pedidos que igual van a fallar.
const COOLDOWN_SECONDS = 60

// Botón "Enviar otra campanita": vuelve a mandar el email de confirmación.
// startWithCooldown: true si el email se acaba de enviar (recién registrado).
export function ResendConfirmation({ email, startWithCooldown = false }: { email: string; startWithCooldown?: boolean }) {
  const [busy, setBusy] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(startWithCooldown ? COOLDOWN_SECONDS : 0)
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)

  // Cuenta regresiva de a un segundo
  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  async function handleResend() {
    setStatus(null)
    setBusy(true)
    try {
      await resendConfirmation(email)
      setStatus({ ok: true, text: COPY.emailSent })
      setSecondsLeft(COOLDOWN_SECONDS)
    } catch (err) {
      setStatus({ ok: false, text: authErrorMessage(err) })
    } finally {
      setBusy(false)
    }
  }

  const waiting = secondsLeft > 0
  return (
    <div className="resend">
      <button type="button" className="secondary" onClick={handleResend} disabled={busy || waiting || !email}>
        {busy ? 'Enviando…' : COPY.resendButton}
      </button>
      {waiting && <p className="muted small">Podés pedir otra en {secondsLeft} s</p>}
      {/* role="status" / "alert": los lectores de pantalla anuncian el resultado */}
      {status && (
        <p className={status.ok ? 'success' : 'error'} role={status.ok ? 'status' : 'alert'}>
          {status.text}
        </p>
      )}
    </div>
  )
}
