import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://<user>.github.io/loadout-roulette/ on GitHub Pages.
  base: '/loadout-roulette/',
  plugins: [react()],
})
