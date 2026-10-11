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
