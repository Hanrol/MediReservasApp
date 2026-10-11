import { expect, test } from '@playwright/test'
import { freezeMockDate, loginAs } from './helpers'

test('CP-135 · RNF-01 · áreas privadas por rol no desbordan en varios dispositivos', async ({ page }) => {
  await freezeMockDate(page)

  const scenarios = [
    {
      email: 'paciente@medireservas.cl',
      password: 'Paciente123',
      width: 360,
      routes: [
        { path: '/#/solicitar-cita', heading: 'Solicitar cita médica' },
        { path: '/#/mis-citas', heading: 'Mis citas médicas' },
      ],
    },
    {
      email: 'recepcion@medireservas.cl',
      password: 'Recepcion123',
      width: 768,
      routes: [{ path: '/#/gestion-citas', heading: 'Gestión de citas' }],
    },
    {
      email: 'medico@medireservas.cl',
      password: 'Medico123',
      width: 1280,
      routes: [
        { path: '/#/agenda-medica', heading: 'Mi agenda médica' },
        { path: '/#/historial-clinico', heading: 'Historial clínico' },
      ],
    },
    {
      email: 'administrador@medireservas.cl',
      password: 'Admin123',
      width: 360,
      routes: [{ path: '/#/usuarios', heading: 'Gestión de usuarios' }],
    },
  ]

  let hasSession = false
  for (const scenario of scenarios) {
    await page.setViewportSize({ width: scenario.width, height: 900 })
    if (hasSession) {
      await page.getByRole('button', { name: /Salir|Cerrar sesión/ }).click()
      await expect(page).toHaveURL(/#\/login$/)
    }
    await loginAs(page, scenario.email, scenario.password)
    hasSession = true

    for (const route of scenario.routes) {
      await page.goto(route.path)
      await expect(page.getByRole('heading', { name: route.heading })).toBeVisible()
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
  }
})
