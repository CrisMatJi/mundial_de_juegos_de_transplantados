import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/mundial_de_juegos_de_transplantados/',
  plugins: [react()],
})
