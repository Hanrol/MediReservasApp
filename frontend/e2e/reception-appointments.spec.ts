import { expect, test } from '@playwright/test'
import { freezeMockDate, loginAs, mockReceptionApi } from './helpers'

test('CP-129 · RF-19/RF-20 · recepción confirma una cita pendiente', async ({ page }) => {
  await freezeMockDate(page)
  const api = await mockReceptionApi(page)
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
  expect(api.appointments.find((appointment) => appointment.appointmentId === 2)?.appointmentStatus).toBe('CONFIRMED')
  await expect(appointmentRow).toContainText('Confirmada')
})

test('CP-136 · RF-21 · recepción reagenda una cita pendiente a un horario disponible', async ({ page }) => {
  await freezeMockDate(page)
  const api = await mockReceptionApi(page)
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
  expect(api.appointments.find((appointment) => appointment.appointmentId === 2)?.scheduleSlotId).toBe(7)
  expect(api.slots.find((slot) => slot.scheduleSlotId === 6)).toMatchObject({
    slotStatus: 'LIBERADO_POR_CANCELACION',
    appointmentId: null,
  })
  expect(api.slots.find((slot) => slot.scheduleSlotId === 7)).toMatchObject({
    slotStatus: 'RESERVADO',
    appointmentId: 2,
  })
})

test('CP-137 · RF-22 · recepción cancela una cita confirmada y libera el horario', async ({ page }) => {
  await freezeMockDate(page)
  const api = await mockReceptionApi(page)
  await loginAs(page, 'recepcion@medireservas.cl', 'Recepcion123')
  await page.goto('/#/gestion-citas')

  const appointmentRow = page.getByRole('row').filter({ hasText: 'Control general' })
  page.once('dialog', async (dialog) => {
    await dialog.accept()
  })
  await appointmentRow.getByRole('button', { name: 'Cancelar' }).click()

  await expect(page.getByRole('status')).toContainText('fue cancelada')
  await expect(appointmentRow).toContainText('Cancelada')
  expect(api.appointments.find((appointment) => appointment.appointmentId === 1)?.appointmentStatus).toBe('CANCELLED')
  expect(api.slots.find((slot) => slot.scheduleSlotId === 1)).toMatchObject({
    slotStatus: 'LIBERADO_POR_CANCELACION',
    appointmentId: null,
  })
})
