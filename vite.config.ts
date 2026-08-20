import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative so the build works both at a domain root and under a
  // GitHub Pages project subpath (/loadout-roulette/) without a rebuild.
  base: './',
  plugins: [react()],
})
