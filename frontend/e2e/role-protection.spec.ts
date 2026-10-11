import { expect, test } from '@playwright/test'
import { loginAs } from './helpers'

test('CP-133 · RF-29 · rutas privadas redirigen al login cuando no hay sesión', async ({ page }) => {
  await page.goto('/#/usuarios')

  await expect(page).toHaveURL(/#\/login$/)
  await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible()
})

test('CP-134 · RF-29 · paciente autenticado no puede abrir la administración', async ({ page }) => {
  await loginAs(page, 'paciente@medireservas.cl', 'Paciente123')
  await page.goto('/#/usuarios')

  await expect(page).toHaveURL(/#\/acceso-denegado$/)
  await expect(page.getByRole('heading', { name: 'No tienes permiso para ingresar' })).toBeVisible()
})

test('CP-140 · RF-03/RF-29 · médico no hereda una ruta exclusiva de paciente al iniciar sesión', async ({ page }) => {
  await page.goto('/#/solicitar-cita')
  await expect(page).toHaveURL(/#\/login$/)

  await page.getByLabel('Correo electrónico').fill('medico@medireservas.cl')
  await page.getByLabel('Contraseña').fill('Medico123')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  await expect(page).toHaveURL(/#\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Hola, Daniela' })).toBeVisible()
})
