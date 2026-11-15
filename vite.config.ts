import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// LunaTerraMars Analog Explorer build configuration.
// Tailwind CSS v4 is wired through the first-party Vite plugin, so no
// PostCSS pipeline or tailwind.config.ts file is required.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
