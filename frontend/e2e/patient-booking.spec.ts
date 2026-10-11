import { expect, test } from '@playwright/test'
import { freezeMockDate, loginAs } from './helpers'

test('CP-128 · RF-15/RF-16/RF-17 · paciente reserva una hora y la encuentra en Mis citas', async ({ page }) => {
  await freezeMockDate(page)
  await loginAs(page, 'paciente@medireservas.cl', 'Paciente123')
  await page.goto('/#/solicitar-cita')

  await page.getByLabel(/Especialidad/).selectOption('1')
  await page.getByLabel(/Médico/).selectOption('1')
  await page.getByLabel(/Fecha de atención/).fill('2026-10-12')
  await page.getByLabel(/Hora de atención/).selectOption('11:30')
  await page.getByLabel(/Motivo de la consulta/).fill('Control cardiológico E2E')
  await page.getByLabel(/Presencial/).check()
  await page.getByRole('button', { name: 'Solicitar cita' }).click()

  await expect(page.getByRole('status')).toContainText('Tu solicitud de cita se registró correctamente')
  await page.getByRole('link', { name: 'Consultar mis citas' }).click()
  await expect(page).toHaveURL(/#\/mis-citas$/)
  const bookedAppointment = page.getByRole('article').filter({ hasText: 'Control cardiológico E2E' })
  await expect(bookedAppointment).toContainText('Pendiente')
})
