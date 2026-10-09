import type { ReactNode } from 'react'
import { SIGNATURE } from '../lib/kawaii'

// Adorno puramente visual: aria-hidden hace que los lectores de pantalla lo salteen.
// Uso: <KawaiiDecoration>✧ 桜 ✧</KawaiiDecoration>
export function KawaiiDecoration({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`kawaii-deco ${className}`} aria-hidden="true">
      {children}
    </span>
  )
}

// Separador con la firma de la marca: ୨୧ ── 🎐 ── ♡ ── 🌸
export function KawaiiDivider() {
  return <KawaiiDecoration className="kawaii-divider">{SIGNATURE}</KawaiiDecoration>
}
