import { expect, test } from '@playwright/test'

test('CP-138 · RF-02/RF-03 · paciente se registra y luego inicia sesión', async ({ page }) => {
  await page.goto('/#/registro')

  await page.getByLabel('RUN').fill('12345678-5')
  await page.getByLabel('Nombre').fill('Camila')
  await page.getByLabel('Apellidos').fill('Playwright')
  await page.getByLabel('Fecha de nacimiento').fill('1990-05-10')
  await page.getByLabel('Teléfono').fill('912345678')
  await page.getByLabel('Dirección').fill('Santiago Centro')
  await page.getByLabel('Correo electrónico').fill('camila.playwright@example.cl')
  await page.getByLabel('Contraseña', { exact: true }).fill('Paciente123')
  await page.getByLabel('Confirmar contraseña').fill('Paciente123')
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Crear cuenta' }).click()

  await expect(page.getByRole('status')).toContainText('Cuenta creada correctamente')
  await expect(page).toHaveURL(/#\/login$/, { timeout: 5_000 })

  await page.getByLabel('Correo electrónico').fill('camila.playwright@example.cl')
  await page.getByLabel('Contraseña', { exact: true }).fill('Paciente123')
  await page.getByRole('button', { name: 'Iniciar sesión' }).click()

  await expect(page).toHaveURL(/#\/dashboard$/)
  await expect(page.getByRole('heading', { name: 'Hola, Camila' })).toBeVisible()
})
