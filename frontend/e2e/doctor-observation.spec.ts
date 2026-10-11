import { expect, test } from '@playwright/test'
import { freezeMockDate, loginAs } from './helpers'

test('CP-130 · RF-23/RF-24/RF-25 · médico registra una observación y consulta el historial', async ({ page }) => {
  await freezeMockDate(page)
  await loginAs(page, 'medico@medireservas.cl', 'Medico123')
  await page.goto('/#/agenda-medica')

  await page.getByRole('link', { name: 'Registrar observación' }).first().click()
  await expect(page).toHaveURL(/#\/observacion-clinica\?cita=1$/)

  await page.getByLabel(/Diagnóstico/).fill('Migraña E2E')
  await page.getByLabel(/Observaciones clínicas/).fill('Paciente refiere cefalea recurrente.')
  await page.getByLabel(/Tratamiento e indicaciones/).fill('Control en cuatro semanas.')
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Guardar observación' }).click()

  await expect(page.getByRole('status')).toContainText('La observación clínica se guardó correctamente')
  await page.goto('/#/historial-clinico')
  await expect(page.getByText('Migraña E2E')).toBeVisible()
  await expect(page.getByText('Paula Contreras (44444444-4)')).toBeVisible()
})
