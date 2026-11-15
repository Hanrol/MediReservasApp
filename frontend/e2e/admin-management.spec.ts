import { expect, test } from '@playwright/test'
import { loginAs, mockAdminApi } from './helpers'

test('CP-132 · RF-07/RF-08 · administrador filtra usuarios y consulta roles asignados', async ({ page }) => {
  await mockAdminApi(page)
  await loginAs(page, 'administrador@medireservas.cl', 'Admin123')
  await page.goto('/#/usuarios')

  await page.getByLabel('Buscar usuario').fill('Paula')
  await expect(page.getByRole('row').filter({ hasText: 'Paula Contreras' })).toBeVisible()
  await expect(page.getByRole('row').filter({ hasText: 'Andrea Muñoz' })).toHaveCount(0)

  await page.goto('/#/roles')
  const patientRow = page.getByRole('row').filter({ hasText: 'Paula Contreras' })
  await expect(patientRow).toContainText('Paciente')
  await expect(page.getByRole('button', { name: 'Cambiar rol' })).toHaveCount(0)
})
