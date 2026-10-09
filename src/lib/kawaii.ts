// Identidad kawaii: símbolos decorativos y textos de la interfaz en un solo lugar.
// Si quieres cambiar un texto o un adorno, cámbialo aquí y se actualiza en toda la app.

// Símbolos agrupados por familia (para usar con <KawaiiDecoration />)
export const SYMBOLS = {
  // Campanitas y magia japonesa. 風鈴 (fūrin) = campanilla de viento
  furin: ['🎐', '風鈴', '♡', '𓂃', '✧', '˚'],
  // Corazones y lazos
  hearts: ['♡', '♥', 'ღ', 'ෆ', '୨୧', 'ʚ♡ɞ', '꒰ა', '໒꒱'],
  // Estrellitas y destellos
  stars: ['✧', '✦', '⋆', '˚｡⋆୨୧˚', '⊹', '˖', '✩', '₊˚'],
  // Sakuras y flores
  flowers: ['🌸', '🌷', '❀', '✿', 'ꕤ', 'ෆ', '⋆｡˚'],
} as const

// Palabras japonesas
export const JAPANESE = {
  kawaii: 'かわいい', // adorable
  yume: '夢', // sueño
  hoshi: '星', // estrella
  sakura: '桜', // flor de cerezo
  tenshi: '天使', // ángel
  youkoso: 'ようこそ', // bienvenida
  arigatou: 'ありがとう', // gracias
} as const

// Firma de la marca: separadores y mensajes de bienvenida
export const SIGNATURE = '୨୧ ── 🎐 ── ♡ ── 🌸'

// Textos de login, registro y confirmación de email
export const COPY = {
  registerTitle: '୨୧ Join our little universe ♡',
  loginTitle: '♡ Welcome back, little star.',
  emailPlaceholder: '✧ Tu email mágico...',
  passwordPlaceholder: '🔒 Guardá tu pequeño secreto...',
  registerButton: '🎀 Crear mi cuenta ♡',
  registerSuccess: '🌸 ¡Tu cuenta está floreciendo!',
  checkInbox: '🎐 ¡Toc, toc! Tu email te espera...',
  emailSent: '✧ Una pequeña carta está en camino ♡',
  resendButton: '୨୧ Enviar otra campanita ✧',
  genericError: '☁️ Ups, algo salió mal. Intentémoslo otra vez ♡',
} as const
