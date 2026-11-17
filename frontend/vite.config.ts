import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
const devApiTarget = process.env.VITE_DEV_API_PROXY_TARGET?.trim() || 'http://localhost:9013'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/MediReservasApp/' : '/',
  server: {
    proxy: {
      '/api': {
        target: devApiTarget,
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
}))
