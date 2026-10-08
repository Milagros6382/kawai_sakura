import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages publica la app en https://milagros6382.github.io/kawai_sakura/
  // así que al construirla todas las rutas cuelgan de /kawai_sakura/.
  // En desarrollo (npm run dev) sigue siendo http://localhost:5173/
  base: command === 'build' ? '/kawai_sakura/' : '/',
}))
