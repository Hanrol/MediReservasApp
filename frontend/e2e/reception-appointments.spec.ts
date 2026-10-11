import { expect, test } from '@playwright/test'
import { freezeMockDate, loginAs } from './helpers'

test('CP-129 · RF-19/RF-20 · recepción confirma una cita pendiente', async ({ page }) => {
  await freezeMockDate(page)
  await loginAs(page, 'recepcion@medireservas.cl', 'Recepcion123')
  await page.goto('/#/gestion-citas')

  const appointmentRow = page.getByRole('row').filter({ hasText: 'Control preventivo' })
  await expect(appointmentRow).toContainText('Control preventivo')
  await expect(page.getByRole('columnheader', { name: 'Motivo' })).toBeVisible()

  page.once('dialog', async (dialog) => {
    await dialog.accept()
  })
  await appointmentRow.getByRole('button', { name: 'Confirmar' }).click()

  await expect(page.getByRole('status')).toContainText('fue confirmada')
  await expect.poll(() => page.evaluate(() => {
    const appointments = JSON.parse(localStorage.getItem('medireservas_appointments') ?? '[]')
    return appointments.find((appointment: { appointmentId: number }) => appointment.appointmentId === 2)?.appointmentStatus
  })).toBe('CONFIRMED')
  await expect(appointmentRow).toContainText('Confirmada')
})
