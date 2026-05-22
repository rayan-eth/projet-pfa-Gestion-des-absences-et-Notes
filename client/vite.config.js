import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/projet-pfa-Gestion-des-absences-et-Notes/',
  plugins: [react()],
})
