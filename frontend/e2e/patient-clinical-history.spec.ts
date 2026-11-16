import { expect, test } from '@playwright/test'
import { loginAs, mockPatientClinicalHistoryApi } from './helpers'

test('CP-145 · el paciente consulta su historial clínico desde su API autenticada', async ({ page }) => {
  await mockPatientClinicalHistoryApi(page)
  await loginAs(page, 'paciente@medireservas.cl', 'Paciente123')
  await page.goto('/#/historial-clinico')

  await expect(page.getByRole('heading', { name: 'Historial clínico' })).toBeVisible()
  await expect(page.getByText('Migraña persistente')).toBeVisible()
  await expect(page.getByText('Seguimiento clínico de prueba.')).toBeVisible()
  await expect(page.getByText('Daniela Rojas')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Consulta de Cardiología' })).toBeVisible()
})
