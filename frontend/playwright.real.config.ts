import { defineConfig, devices } from '@playwright/test'
import { env } from 'node:process'

const baseURL = 'http://127.0.0.1:4174'
const apiProxyTarget = env.E2E_API_PROXY_TARGET?.trim() || 'http://127.0.0.1:9013'

for (const variable of ['E2E_PATIENT_EMAIL', 'E2E_PATIENT_PASSWORD']) {
  if (!env[variable]) {
    throw new Error(`Falta la variable de entorno ${variable} para los E2E contra backend real.`)
  }
}

if (env.E2E_TEST_DATABASE !== 'YES') {
  throw new Error(
    'Los E2E reales escriben citas. Configura E2E_TEST_DATABASE=YES solo si el backend apunta a una base aislada de pruebas.',
  )
}

export default defineConfig({
  testDir: './e2e/real',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-real-report', open: 'never' }]],
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4174 --strictPort',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_DEV_API_PROXY_TARGET: apiProxyTarget,
    },
  },
})
