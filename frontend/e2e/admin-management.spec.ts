import { expect, test } from '@playwright/test'
import { loginAs } from './helpers'

test('CP-132 · RF-07/RF-08 · administrador filtra usuarios y asigna roles', async ({ page }) => {
  await loginAs(page, 'administrador@medireservas.cl', 'Admin123')
  await page.goto('/#/usuarios')

  await page.getByLabel('Buscar usuario').fill('Paula')
  await expect(page.getByRole('row').filter({ hasText: 'Paula Contreras' })).toBeVisible()
  await expect(page.getByRole('row').filter({ hasText: 'Andrea Muñoz' })).toHaveCount(0)

  await page.goto('/#/roles')
  const patientRow = page.getByRole('row').filter({ hasText: 'Paula Contreras' })
  await patientRow.getByRole('button', { name: 'Cambiar rol' }).click()
  await page.getByLabel('Nuevo rol').selectOption('RECEPTIONIST')
  await page.getByRole('button', { name: 'Guardar rol' }).click()
  await page.getByRole('alertdialog').getByRole('button', { name: 'Confirmar cambio' }).click()

  await expect(patientRow).toContainText('Recepcionista')
})
