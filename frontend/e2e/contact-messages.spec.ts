import { expect, test } from '@playwright/test'
import { loginAs, mockContactMessagesApi } from './helpers'

test('CP-143 · el formulario de contacto guarda el mensaje antes de confirmar el envío', async ({ page }) => {
  const api = await mockContactMessagesApi(page)
  await page.goto('/#/contacto')

  await page.getByLabel('Nombre').fill('  Ana Pérez  ')
  await page.getByLabel('Correo electrónico').fill('ANA@example.com')
  await page.getByLabel('Asunto').fill('Consulta de atención')
  await page.getByLabel('Mensaje').fill('Necesito información sobre una reserva.')
  await page.getByRole('button', { name: 'Enviar mensaje' }).click()

  await expect(page.getByRole('status')).toContainText('enviado al equipo de recepción')
  expect(api.messages).toHaveLength(1)
  expect(api.messages[0]).toMatchObject({
    name: 'Ana Pérez',
    email: 'ana@example.com',
    subject: 'Consulta de atención',
    message: 'Necesito información sobre una reserva.',
  })
})

test('CP-144 · todos los usuarios de recepción consultan la bandeja compartida', async ({ page }) => {
  await mockContactMessagesApi(page, [{
    contactMessageId: 31,
    name: 'Ana Pérez',
    email: 'ana@example.com',
    subject: 'Consulta de atención',
    message: 'Necesito información sobre una reserva.',
    createdAt: '2026-11-16T11:30:00',
  }])
  await loginAs(page, 'recepcion@medireservas.cl', 'Recepcion123')
  await page.goto('/#/mensajes-contacto')

  await expect(page.getByRole('heading', { name: 'Mensajes de contacto' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Consulta de atención' })).toBeVisible()
  await expect(page.getByText('Necesito información sobre una reserva.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'ana@example.com' })).toHaveAttribute('href', 'mailto:ana@example.com')
})
