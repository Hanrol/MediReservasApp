import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import process from 'node:process'

const frontendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repositoryRoot = path.resolve(frontendDirectory, '..')
const projectName = `medireservas-e2e-${randomUUID().slice(0, 8)}`
const patientEmail = 'patient-e2e@medireservas.local'
const patientPassword = 'E2ePatient123!'
const docker = process.platform === 'win32' ? 'docker.exe' : 'docker'
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

async function findAvailablePort() {
  const server = createServer()
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('No se pudo reservar puerto para el Gateway E2E.')
  const { port } = address
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  return port
}

function run(command, args, { cwd, env = process.env } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: 'inherit', windowsHide: true })
    child.once('error', reject)
    child.once('close', (code, signal) => {
      if (signal) return reject(new Error(`${command} terminó por señal ${signal}`))
      resolve(code ?? 1)
    })
  })
}

const gatewayPort = await findAvailablePort()
const gatewayTarget = `http://127.0.0.1:${gatewayPort}`
const testEnvironment = {
  ...process.env,
  E2E_GATEWAY_PORT: String(gatewayPort),
  E2E_API_PROXY_TARGET: gatewayTarget,
  E2E_TEST_DATABASE: 'YES',
  E2E_PATIENT_EMAIL: patientEmail,
  E2E_PATIENT_PASSWORD: patientPassword,
  DB_ROOT_PASSWORD: 'e2e_root_only_change_me',
  AUTH_DB_PASSWORD: 'e2e_auth_only',
  USERS_DB_PASSWORD: 'e2e_users_only',
  DOCTORS_DB_PASSWORD: 'e2e_doctors_only',
  APPOINTMENTS_DB_PASSWORD: 'e2e_appointments_only',
  MEDICAL_RECORDS_DB_PASSWORD: 'e2e_medical_records_only',
  JWT_SECRET: 'e2e-only-jwt-secret-do-not-use-outside-tests-123456789',
  MASTER_ADMIN_EMAIL: 'admin-e2e@medireservas.local',
  MASTER_ADMIN_PASSWORD: 'E2eAdmin123!',
  MASTER_ADMIN_RUN: '11.111.111-1',
}

const compose = [
  'compose',
  '--project-name', projectName,
  '--file', 'compose.e2e.yaml',
]
let composeMayExist = false
let testExitCode = 1

try {
  console.log(`Iniciando entorno Docker E2E aislado (${projectName}).`)
  composeMayExist = true
  const upCode = await run(docker, [...compose, 'up', '--build', '--detach'], {
    cwd: repositoryRoot,
    env: testEnvironment,
  })
  if (upCode !== 0) throw new Error(`Docker Compose terminó con código ${upCode}.`)

  const readyDeadline = Date.now() + 240_000
  let gatewayReady = false
  while (Date.now() < readyDeadline) {
    try {
      const response = await fetch(`${gatewayTarget}/actuator/health`, {
        signal: AbortSignal.timeout(2_000),
      })
      if (response.ok) {
        gatewayReady = true
        break
      }
    } catch {
      // Los servicios Java todavía están iniciando.
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000))
  }
  if (!gatewayReady) throw new Error('El Gateway E2E no quedó saludable dentro de cuatro minutos.')

  const seedCode = await run(process.execPath, [
    path.join(frontendDirectory, 'e2e', 'real', 'seed.mjs'),
  ], { cwd: frontendDirectory, env: testEnvironment })
  if (seedCode !== 0) throw new Error(`La preparación de datos E2E terminó con código ${seedCode}.`)

  testExitCode = await run(npm, ['run', 'test:e2e:real'], {
    cwd: frontendDirectory,
    env: testEnvironment,
  })
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
} finally {
  if (composeMayExist) {
    console.log(`Eliminando solo el entorno E2E aislado (${projectName}) y su volumen desechable.`)
    const downCode = await run(docker, [...compose, 'down', '--volumes', '--remove-orphans'], {
      cwd: repositoryRoot,
      env: testEnvironment,
    }).catch((error) => {
      console.error(error instanceof Error ? error.message : error)
      return 1
    })
    if (downCode !== 0) testExitCode = testExitCode || downCode
  }
}

process.exitCode = testExitCode
