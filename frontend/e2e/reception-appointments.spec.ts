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

test('CP-136 · RF-21 · recepción reagenda una cita pendiente a un horario disponible', async ({ page }) => {
  await freezeMockDate(page)
  await loginAs(page, 'recepcion@medireservas.cl', 'Recepcion123')
  await page.goto('/#/gestion-citas')

  const appointmentRow = page.getByRole('row').filter({ hasText: 'Control preventivo' })
  await appointmentRow.getByRole('button', { name: 'Reagendar' }).click()
  const rescheduleDialog = page.getByRole('dialog', { name: 'Nueva fecha y hora' })
  await rescheduleDialog.getByRole('combobox').nth(0).selectOption('2026-10-12')
  await rescheduleDialog.getByRole('combobox').nth(1).selectOption('11:30')
  await page.getByRole('button', { name: 'Guardar nueva fecha' }).click()

  await expect(page.getByRole('status')).toContainText('fue reagendada')
  await expect(appointmentRow).toContainText('2026-10-12')
  await expect(appointmentRow).toContainText('11:30')
  await expect.poll(() => page.evaluate(() => {
    const appointments = JSON.parse(localStorage.getItem('medireservas_appointments') ?? '[]')
    return appointments.find((appointment: { appointmentId: number }) => appointment.appointmentId === 2)?.scheduleSlotId
  })).toBe(7)
})

test('CP-137 · RF-22 · recepción cancela una cita confirmada y libera el horario', async ({ page }) => {
  await freezeMockDate(page)
  await loginAs(page, 'recepcion@medireservas.cl', 'Recepcion123')
  await page.goto('/#/gestion-citas')

  const appointmentRow = page.getByRole('row').filter({ hasText: 'Control general' })
  page.once('dialog', async (dialog) => {
    await dialog.accept()
  })
  await appointmentRow.getByRole('button', { name: 'Cancelar' }).click()

  await expect(page.getByRole('status')).toContainText('fue cancelada')
  await expect(appointmentRow).toContainText('Cancelada')
  await expect.poll(() => page.evaluate(() => {
    const schedules = JSON.parse(localStorage.getItem('medireservas_schedules') ?? '[]')
    return schedules.find((schedule: { id: number }) => schedule.id === 1)?.available
  })).toBe(true)
})
