import { expect, test } from '@playwright/test'
import { loginAs, mockDoctorAvailabilityApi } from './helpers'

test('CP-141 · médico configura su disponibilidad semanal desde su panel', async ({ page }) => {
  await mockDoctorAvailabilityApi(page)
  await loginAs(page, 'medico@medireservas.cl', 'Medico123')
  await page.goto('/#/disponibilidad-medica')

  await expect(page.getByRole('heading', { name: 'Mi disponibilidad' })).toBeVisible()
  await expect(page.getByText(/horario\(s\) semanal\(es\) antiguo\(s\)/)).toBeVisible()
  const date = new Date()
  date.setDate(date.getDate() + 1)
  const dateValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  await page.getByLabel('Día').fill(dateValue)
  await page.getByLabel('Hora de inicio').selectOption('10:00')
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Agregar al calendario' }).click()

  await expect(page.getByRole('status')).toContainText('Horario agregado al calendario')
  await expect(page.getByText('10:00–10:30 · Disponible')).toBeVisible()
})
